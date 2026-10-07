"""
NotepediaX Engine — Feature Engineering Pipeline
==================================================
Phase 2: Aggregates raw ``learning_events`` rows into rolling statistical
features for a given student × topic pair.  These features feed into
downstream ML ranking models and the retention engine.

All functions operate on pre-fetched event rows (list[dict]) so they
remain DB-agnostic and unit-testable.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from app.config import get_settings
from app.database import get_supabase_client

logger = logging.getLogger(__name__)


# =============================================================================
# 1. Rolling Accuracy (7-day window)
# =============================================================================

def calculate_rolling_accuracy(events: list[dict]) -> float:
    """
    Compute accuracy over recent QUESTION_ATTEMPT events.

    Parameters
    ----------
    events : list[dict]
        Rows from ``learning_events`` filtered to QUESTION_ATTEMPT for a
        specific topic.  Each row must have ``metadata.correct`` (bool).

    Returns
    -------
    float
        Accuracy between 0.0 and 1.0.  Returns 0.0 if no attempts exist.
    """
    attempts = [
        e for e in events
        if e.get("event_type") == "QUESTION_ATTEMPT"
    ]
    if not attempts:
        return 0.0

    correct = sum(
        1 for a in attempts
        if a.get("metadata", {}).get("correct") is True
    )
    accuracy = correct / len(attempts)
    logger.debug("Rolling accuracy: %d/%d = %.4f", correct, len(attempts), accuracy)
    return round(accuracy, 4)


# =============================================================================
# 2. Average Response Time
# =============================================================================

def calculate_avg_response_time(events: list[dict]) -> float:
    """
    Mean response time (seconds) for QUESTION_ATTEMPT events.

    Parameters
    ----------
    events : list[dict]
        Event rows; each may have ``metadata.response_time_seconds``.

    Returns
    -------
    float
        Average response time in seconds.  Returns 0.0 if no data.
    """
    times: list[int] = []
    for e in events:
        if e.get("event_type") != "QUESTION_ATTEMPT":
            continue
        meta = e.get("metadata", {})
        # Support both Phase 1 key ("response_time") and Phase 2 key ("response_time_seconds")
        rt = meta.get("response_time_seconds") or meta.get("response_time")
        if rt is not None:
            times.append(int(rt))

    if not times:
        return 0.0

    avg = sum(times) / len(times)
    logger.debug("Avg response time: %.2f seconds over %d attempts", avg, len(times))
    return round(avg, 2)


# =============================================================================
# 3. Study Consistency Score
# =============================================================================

def calculate_study_consistency(events: list[dict], window_days: int = 7) -> float:
    """
    Measure how consistently the student studied a topic over the last
    ``window_days`` days.

    Score = (unique active days in window) / window_days, clamped [0, 1].

    Parameters
    ----------
    events : list[dict]
        All event rows for the topic (any event type counts as activity).
    window_days : int
        Size of the lookback window in days.

    Returns
    -------
    float
        Consistency score between 0.0 (no activity) and 1.0 (daily).
    """
    if not events:
        return 0.0

    active_dates: set[str] = set()
    for e in events:
        created = e.get("created_at", "")
        if created:
            # Handle both ISO strings and datetime objects
            if isinstance(created, str):
                day = created[:10]  # 'YYYY-MM-DD'
            else:
                day = created.strftime("%Y-%m-%d")
            active_dates.add(day)

    consistency = min(1.0, len(active_dates) / max(window_days, 1))
    logger.debug(
        "Study consistency: %d active days / %d window = %.4f",
        len(active_dates), window_days, consistency,
    )
    return round(consistency, 4)


# =============================================================================
# 4. Full Feature Vector Extraction
# =============================================================================

def extract_feature_vector(student_id: str, topic_id: str) -> dict:
    """
    Compile a complete ML-ready feature dict for a student × topic pair.

    Fetches recent events from Supabase, computes rolling stats, and merges
    with current mastery/retention from ``learner_states``.

    Parameters
    ----------
    student_id : str
        UUID of the student.
    topic_id : str
        Canonical topic ID.

    Returns
    -------
    dict
        Feature vector with keys: ``rolling_accuracy``, ``avg_response_time``,
        ``study_consistency``, ``total_attempts``, ``current_mastery``,
        ``retention_score``, ``revision_priority``.
    """
    settings = get_settings()
    db = get_supabase_client()
    window = settings.feature_window_days

    # ── Fetch events in the rolling window ────────────────────────────────
    cutoff = (datetime.now(timezone.utc) - timedelta(days=window)).isoformat()

    events_result = (
        db.table("learning_events")
        .select("*")
        .eq("student_id", student_id)
        .eq("topic_id", topic_id)
        .gte("created_at", cutoff)
        .order("created_at", desc=False)
        .execute()
    )
    events = events_result.data or []

    # ── Compute rolling features ──────────────────────────────────────────
    rolling_acc = calculate_rolling_accuracy(events)
    avg_rt = calculate_avg_response_time(events)
    consistency = calculate_study_consistency(events, window_days=window)
    total_attempts = sum(
        1 for e in events if e.get("event_type") == "QUESTION_ATTEMPT"
    )

    # ── Pull current mastery + retention from learner_states ──────────────
    state_result = (
        db.table("learner_states")
        .select("topic_mastery, retention_scores")
        .eq("student_id", student_id)
        .execute()
    )
    mastery_map: dict = {}
    retention_map: dict = {}
    if state_result.data:
        mastery_map = state_result.data[0].get("topic_mastery", {})
        retention_map = state_result.data[0].get("retention_scores", {})

    current_mastery = mastery_map.get(topic_id, 0.0)
    retention_entry = retention_map.get(topic_id, {})
    retention_score = retention_entry.get("score", 0.0) if isinstance(retention_entry, dict) else 0.0
    revision_priority = round(1.0 - retention_score, 4)

    feature_vec = {
        "student_id": student_id,
        "topic_id": topic_id,
        "rolling_accuracy": rolling_acc,
        "avg_response_time": avg_rt,
        "study_consistency": consistency,
        "total_attempts": total_attempts,
        "current_mastery": current_mastery,
        "retention_score": retention_score,
        "revision_priority": revision_priority,
    }

    logger.info(
        "Feature vector extracted  student=%s  topic=%s  features=%s",
        student_id, topic_id, feature_vec,
    )
    return feature_vec
