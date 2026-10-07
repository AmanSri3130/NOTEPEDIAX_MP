"""
NotepediaX Engine — Retention & Forgetting Decay Engine
========================================================
Phase 2: Implements the Ebbinghaus-inspired exponential forgetting curve.

    R(t) = M₀ · exp(−λ · t)

Where:
  - R(t) = retention score at time t
  - M₀   = mastery level at time of last review
  - λ     = forgetting rate (default 0.15 /day)
  - t     = days since last review

The engine provides three core functions:
  1. ``calculate_retention_score``  — point-in-time retention from mastery & elapsed days
  2. ``calculate_revision_priority`` — urgency = 1 − retention
  3. ``get_topics_due_for_revision`` — filter topics below a retention threshold
"""

from __future__ import annotations

import logging
import math
from datetime import datetime, timezone

from app.config import get_settings

logger = logging.getLogger(__name__)


# =============================================================================
# 1. Exponential Retention Score
# =============================================================================

def calculate_retention_score(
    initial_mastery: float,
    days_since_last_seen: float,
    forgetting_rate: float | None = None,
) -> float:
    """
    Compute the current retention using exponential decay.

    Parameters
    ----------
    initial_mastery : float
        Mastery level (0–1) at the time the topic was last studied.
    days_since_last_seen : float
        Fractional days elapsed since the student last engaged with
        the topic.
    forgetting_rate : float, optional
        Decay constant λ.  Defaults to ``Settings.forgetting_rate`` (0.15).

    Returns
    -------
    float
        Retention score clamped to [0.0, 1.0], rounded to 4 decimal places.

    Examples
    --------
    >>> calculate_retention_score(0.80, 0.0)
    0.8
    >>> calculate_retention_score(0.80, 5.0, forgetting_rate=0.15)
    0.3773  # 0.80 * e^(−0.75) ≈ 0.3773
    """
    if forgetting_rate is None:
        forgetting_rate = get_settings().forgetting_rate

    # Guard against negative time (clock skew) and negative mastery
    days = max(0.0, days_since_last_seen)
    mastery = max(0.0, min(1.0, initial_mastery))

    retention = mastery * math.exp(-forgetting_rate * days)
    clamped = max(0.0, min(1.0, retention))

    logger.debug(
        "Retention: M₀=%.4f  Δt=%.2f days  λ=%.4f → R=%.4f",
        mastery, days, forgetting_rate, clamped,
    )
    return round(clamped, 4)


# =============================================================================
# 2. Revision Priority
# =============================================================================

def calculate_revision_priority(retention_score: float) -> float:
    """
    Convert a retention score into a revision urgency.

    Formula: ``priority = 1.0 − retention_score``

    A retention of 0.3 produces a priority of 0.7 (urgent).
    A retention of 0.9 produces a priority of 0.1 (low urgency).

    Parameters
    ----------
    retention_score : float
        Current retention level (0–1).

    Returns
    -------
    float
        Revision priority (0–1), rounded to 4 decimal places.
    """
    priority = 1.0 - max(0.0, min(1.0, retention_score))
    return round(priority, 4)


# =============================================================================
# 3. Topics Due for Revision
# =============================================================================

def get_topics_due_for_revision(
    retention_scores: dict[str, dict],
    threshold: float | None = None,
) -> list[dict]:
    """
    Filter and rank topics whose retention has dropped below ``threshold``.

    Parameters
    ----------
    retention_scores : dict[str, dict]
        Mapping of ``topic_id`` → ``{score, last_seen, ...}`` from
        ``learner_states.retention_scores`` JSONB.
    threshold : float, optional
        Retention cutoff.  Defaults to ``Settings.retention_threshold`` (0.5).

    Returns
    -------
    list[dict]
        Sorted list (highest priority first) of dicts with keys:
        ``topic_id``, ``retention_score``, ``revision_priority``,
        ``days_since_last_seen``.
    """
    if threshold is None:
        threshold = get_settings().retention_threshold

    due: list[dict] = []
    now = datetime.now(timezone.utc)

    for topic_id, entry in retention_scores.items():
        if not isinstance(entry, dict):
            continue

        score = entry.get("score", 0.0)
        if score >= threshold:
            continue  # retention is still healthy

        # Calculate days since last seen
        last_seen_str = entry.get("last_seen")
        if last_seen_str:
            try:
                last_seen_dt = datetime.fromisoformat(last_seen_str)
                # Ensure timezone-aware
                if last_seen_dt.tzinfo is None:
                    last_seen_dt = last_seen_dt.replace(tzinfo=timezone.utc)
                delta = (now - last_seen_dt).total_seconds() / 86400.0
            except (ValueError, TypeError):
                delta = 0.0
        else:
            delta = 0.0

        due.append({
            "topic_id": topic_id,
            "retention_score": round(score, 4),
            "revision_priority": calculate_revision_priority(score),
            "days_since_last_seen": round(delta, 2),
        })

    # Sort by revision_priority descending (most urgent first)
    due.sort(key=lambda x: x["revision_priority"], reverse=True)

    logger.info(
        "Revision due: %d topics below threshold %.2f",
        len(due), threshold,
    )
    return due


# =============================================================================
# 4. Batch Retention Refresh
# =============================================================================

def refresh_all_retention_scores(
    topic_mastery: dict[str, float],
    retention_scores: dict[str, dict],
) -> dict[str, dict]:
    """
    Recompute retention scores for all topics based on elapsed time since
    each topic was last seen.  Called before returning state to ensure
    retention values are always fresh.

    Parameters
    ----------
    topic_mastery : dict[str, float]
        Current mastery map from ``learner_states``.
    retention_scores : dict[str, dict]
        Existing retention records with ``last_seen`` timestamps.

    Returns
    -------
    dict[str, dict]
        Updated retention_scores with recalculated ``score`` and
        ``revision_priority`` fields.
    """
    now = datetime.now(timezone.utc)
    updated: dict[str, dict] = {}

    for topic_id, mastery in topic_mastery.items():
        existing = retention_scores.get(topic_id, {})
        last_seen_str = existing.get("last_seen") if isinstance(existing, dict) else None

        if last_seen_str:
            try:
                last_seen_dt = datetime.fromisoformat(last_seen_str)
                if last_seen_dt.tzinfo is None:
                    last_seen_dt = last_seen_dt.replace(tzinfo=timezone.utc)
                days_elapsed = (now - last_seen_dt).total_seconds() / 86400.0
            except (ValueError, TypeError):
                days_elapsed = 0.0
        else:
            days_elapsed = 0.0

        score = calculate_retention_score(mastery, days_elapsed)
        updated[topic_id] = {
            "score": score,
            "last_seen": last_seen_str or now.isoformat(),
            "revision_priority": calculate_revision_priority(score),
            "days_since_last_seen": round(days_elapsed, 2),
        }

    return updated
