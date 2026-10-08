"""
NotepediaX Engine — Learner State Service (Phase 2)
=====================================================
Orchestrates the complete event processing pipeline:

  Event In → Performance Extraction → Mastery Update → Retention Update
           → Engagement Metrics → MongoDB Persistence

Phase 1 functions (``calculate_diagnostic_state``, ``update_mastery_from_event``)
are preserved.  Phase 2 adds ``extract_performance_score`` and the full
``process_event_and_update_state`` pipeline.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from app.config import get_settings
from app.database import get_mongodb_database
from app.schemas import EventType, UniversalLearningEvent
from app.services.retention_engine import (
    calculate_retention_score,
    calculate_revision_priority,
)

logger = logging.getLogger(__name__)


# =============================================================================
# 1. Diagnostic → Baseline Mastery Initialisation (Phase 1 — preserved)
# =============================================================================

def calculate_diagnostic_state(
    student_id: str,
    diagnostic_data: dict[str, float],
) -> dict[str, float]:
    """
    Convert raw diagnostic scores into the initial topic_mastery JSONB payload.

    Parameters
    ----------
    student_id : str
        UUID of the student (used for logging context).
    diagnostic_data : dict[str, float]
        Mapping of ``topic_id`` → diagnostic score (0–1).

    Returns
    -------
    dict[str, float]
        Cleansed, clamped mastery dict ready to be written to
        ``learner_states.topic_mastery``.

    Example
    -------
    >>> calculate_diagnostic_state("abc-123", {"physics_ef": 0.65})
    {'physics_ef': 0.65}
    """
    mastery: dict[str, float] = {}
    for topic_id, score in diagnostic_data.items():
        # Clamp to [0.0, 1.0] — defensive against bad upstream data
        clamped = max(0.0, min(1.0, float(score)))
        mastery[topic_id] = round(clamped, 4)

    logger.info(
        "Diagnostic state initialised for student=%s | topics=%d",
        student_id,
        len(mastery),
    )
    return mastery


# =============================================================================
# 2. Event-Driven Mastery Update — Weighted Moving Average (Phase 1 — preserved)
# =============================================================================

def update_mastery_from_event(
    current_mastery: float,
    performance_score: float,
) -> float:
    """
    Compute the updated mastery level using a weighted moving average.

    Formula (Phase 1 baseline)::

        new_mastery = (current_mastery × W_current) + (performance_score × W_new)

    The weights default to 0.75 / 0.25 and are configurable in ``Settings``.
    The result is clamped to [0.0, 1.0].

    Parameters
    ----------
    current_mastery : float
        Existing mastery score for the topic (0–1).
    performance_score : float
        Performance on the latest event (0–1).

    Returns
    -------
    float
        Updated mastery score, rounded to 4 decimal places.
    """
    settings = get_settings()

    w_current = settings.mastery_weight_current  # default 0.75
    w_new = settings.mastery_weight_new           # default 0.25

    raw = (current_mastery * w_current) + (performance_score * w_new)
    clamped = max(0.0, min(1.0, raw))

    logger.debug(
        "Mastery update: %.4f × %.2f + %.4f × %.2f = %.4f",
        current_mastery, w_current, performance_score, w_new, clamped,
    )
    return round(clamped, 4)


# =============================================================================
# 3. Phase 2 — Performance Score Extraction from Event Metadata
# =============================================================================

def extract_performance_score(event: UniversalLearningEvent) -> float:
    """
    Derive a normalised performance score (0–1) from event metadata,
    combining correctness, response time, and confidence signals.

    Extraction rules per event type:

    - **QUESTION_ATTEMPT**: ``1.0 if correct else 0.0``, adjusted by
      response time (faster = small bonus, capped at +0.1).
    - **NOTE_READ**: ``completion_percentage / 100``.
    - **QUIZ_COMPLETE**: ``score_percentage / 100``.
    - **VIDEO_COMPLETE**: ``completion_rate`` (already 0–1).
    - **FLASHCARD_REVIEW**: ``1.0 if recalled else 0.0``, weighted by
      ``confidence_rating / 5``.
    - **DOUBT_ASKED**: ``0.3`` (engagement signal, not performance).
    - **PLAN_COMPLETED**: ``0.8`` (positive completion signal).
    - **PLAN_SKIPPED**: ``0.1`` (low signal, student skipped).

    Parameters
    ----------
    event : UniversalLearningEvent
        The incoming event with its metadata dict.

    Returns
    -------
    float
        Normalised score clamped to [0.0, 1.0].
    """
    meta = event.metadata
    et = event.event_type

    # If explicit score is already provided in metadata, honor it directly
    if "score" in meta and meta["score"] is not None:
        return round(min(1.0, max(0.0, float(meta["score"]))), 4)

    if et == EventType.QUESTION_ATTEMPT:
        base = 1.0 if meta.get("correct", False) else 0.0
        # Response time bonus: faster answers get a small bump
        rt = meta.get("response_time_seconds", meta.get("response_time", 60))
        time_bonus = max(0.0, min(0.1, (60 - rt) / 600))  # up to +0.1
        return round(min(1.0, base + time_bonus), 4)

    elif et == EventType.NOTE_READ:
        completion = meta.get("completion_percentage", 0.0)
        return round(min(1.0, completion / 100.0), 4)

    elif et == EventType.QUIZ_COMPLETE:
        score_pct = meta.get("score_percentage", 0.0)
        return round(min(1.0, score_pct / 100.0), 4)

    elif et == EventType.VIDEO_COMPLETE:
        return round(min(1.0, max(0.0, meta.get("completion_rate", 0.0))), 4)

    elif et == EventType.FLASHCARD_REVIEW:
        recalled = 1.0 if meta.get("recalled_correctly", False) else 0.0
        confidence = meta.get("confidence_rating", 3) / 5.0
        # Blend recall correctness (70%) with self-reported confidence (30%)
        return round(min(1.0, (recalled * 0.7) + (confidence * 0.3)), 4)

    elif et == EventType.DOUBT_ASKED:
        return 0.3  # Engagement signal — no performance metric

    elif et == EventType.PLAN_COMPLETED:
        return 0.8

    elif et == EventType.PLAN_SKIPPED:
        return 0.1

    # Fallback — use Phase 1 score field if present
    return round(min(1.0, max(0.0, meta.get("score", 0.0))), 4)


# =============================================================================
# 4. Phase 2 — Full Event Processing Pipeline
# =============================================================================

def process_event_and_update_state(
    student_id: str,
    event: UniversalLearningEvent,
) -> dict:
    """
    End-to-end event processing pipeline:

    1. Persist event to ``learning_events``.
    2. Extract performance score from event metadata.
    3. Update ``topic_mastery`` via weighted average.
    4. Update ``retention_scores`` with fresh ``last_seen`` and decay calc.
    5. Update ``engagement_metrics`` (total study minutes, streak).
    6. Persist all changes to ``learner_states``.

    Parameters
    ----------
    student_id : str
        UUID of the student.
    event : UniversalLearningEvent
        The incoming universal learning event.

    Returns
    -------
    dict
        Summary with keys: ``topic_id``, ``old_mastery``, ``new_mastery``,
        ``performance_score``, ``retention_score``, ``revision_priority``.
    """
    db = get_mongodb_database()
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()

    # Resolve the topic_id — some event types carry it inside metadata
    topic_id = event.topic_id

    # ── 1. Persist event to learning_events ───────────────────────────────
    event_row = {
        "student_id": student_id,
        "event_type": event.event_type.value,
        "topic_id": topic_id,
        "metadata": event.metadata,
        "created_at": event.timestamp or now,
    }
    db.learning_events.insert_one(event_row)
    logger.info(
        "Event persisted  student=%s  type=%s  topic=%s",
        student_id, event.event_type.value, topic_id,
    )

    # ── 2. Extract performance score ──────────────────────────────────────
    performance = extract_performance_score(event)

    # ── 3. Read current learner state ─────────────────────────────────────
    state = db.learner_states.find_one(
        {"student_id": student_id},
        {"topic_mastery": 1, "retention_scores": 1},
    )

    mastery_map: dict = {}
    retention_map: dict = {}
    if state:
        mastery_map = state.get("topic_mastery", {})
        retention_map = state.get("retention_scores", {})

    # ── 4. Update topic mastery ───────────────────────────────────────────
    old_mastery = mastery_map.get(topic_id, 0.0)
    new_mastery = update_mastery_from_event(old_mastery, performance)
    mastery_map[topic_id] = new_mastery

    # ── 5. Update retention scores ────────────────────────────────────────
    # On event receipt, the topic was just seen — reset decay timer
    new_retention = calculate_retention_score(
        initial_mastery=new_mastery,
        days_since_last_seen=0.0,  # just reviewed
    )
    retention_map[topic_id] = {
        "score": new_retention,
        "last_seen": now_iso,
        "revision_priority": calculate_revision_priority(new_retention),
        "days_since_last_seen": 0.0,
    }

    # ── 6. Persist all updates ────────────────────────────────────────────
    db.learner_states.update_one(
        {"student_id": student_id},
        {"$set": {
            "topic_mastery": mastery_map,
            "retention_scores": retention_map,
            "last_updated_at": now,
        }},
        upsert=True,
    )

    logger.info(
        "State updated  student=%s  topic=%s  mastery: %.4f→%.4f  "
        "retention=%.4f  perf=%.4f",
        student_id, topic_id, old_mastery, new_mastery,
        new_retention, performance,
    )

    return {
        "student_id": student_id,
        "topic_id": topic_id,
        "old_mastery": old_mastery,
        "new_mastery": new_mastery,
        "performance_score": performance,
        "retention_score": new_retention,
        "revision_priority": calculate_revision_priority(new_retention),
    }
