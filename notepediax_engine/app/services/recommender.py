"""
NotepediaX Engine — Multi-Factor Recommendation & ML Scoring Engine
====================================================================
Phase 3: Ranks candidate learning activities using a multi-factor scoring
model combining knowledge gaps, forgetting risk, target exam weighting,
and engagement probability.

Mathematical Formulation:
-------------------------
recommendation_score = (
    0.30 * knowledge_gap +
    0.20 * exam_priority +
    0.15 * forgetting_risk +
    0.15 * goal_impact +
    0.10 * engagement_probability +
    0.10 * content_preference
)

Also includes an extensible GBDT / LightGBM tabular re-ranking stub for
downstream fine-tuning when user click-through & score outcome logs are available.
"""

from __future__ import annotations

import logging
from typing import Any

from app.schemas import ActivityType, CandidateActivity, ScoredRecommendation
from app.services.retention_engine import refresh_all_retention_scores

logger = logging.getLogger(__name__)

# Target exam subject weighting matrix (normalized weights)
EXAM_WEIGHTS: dict[str, dict[str, float]] = {
    "JEE_MAIN": {"physics": 1.0, "chemistry": 1.0, "maths": 1.0, "biology": 0.0},
    "JEE_ADVANCED": {"physics": 1.1, "chemistry": 1.0, "maths": 1.1, "biology": 0.0},
    "NEET": {"physics": 0.9, "chemistry": 0.9, "biology": 1.2, "maths": 0.0},
    "BOARDS": {"physics": 0.8, "chemistry": 0.8, "maths": 0.8, "biology": 0.8},
}


def _derive_exam_priority(topic_id: str, student_profile: dict[str, Any] | None) -> float:
    """Calculate exam priority weight based on target exam."""
    if not student_profile:
        return 0.70

    target_exam = str(student_profile.get("exam_target", "JEE_MAIN")).upper()
    exam_map = EXAM_WEIGHTS.get(target_exam, {"physics": 0.8, "chemistry": 0.8, "maths": 0.8})

    # Detect subject from topic_id prefix
    subject = topic_id.split("_")[0].lower() if "_" in topic_id else "general"
    weight = exam_map.get(subject, 0.75)
    return min(1.0, max(0.2, weight / 1.2))


def _derive_content_preference(activity: CandidateActivity, student_profile: dict[str, Any] | None) -> float:
    """Match activity type and duration to student daily budget and preferences."""
    if not student_profile:
        return 0.75

    daily_minutes = student_profile.get("daily_available_minutes", 60)
    # If student has limited time (< 45 mins), prefer concise flashcards or notes
    if daily_minutes < 45:
        if activity.activity_type in (ActivityType.FLASHCARD_REVIEW, ActivityType.NOTE_READ):
            return 0.95
        if activity.activity_type == ActivityType.QUIZ_ATTEMPT and activity.estimated_duration_minutes > 25:
            return 0.50
    return 0.80


def _generate_explanation(
    breakdown: dict[str, float],
    activity: CandidateActivity,
    mastery: float,
    retention: float,
) -> str:
    """Generate explainable UI reason for recommendation."""
    topic_clean = activity.topic_id.replace("_", " ").title()

    if breakdown["forgetting_risk"] > 0.60:
        return f"Urgent revision required: Memory retention on {topic_clean} has decayed to {retention*100:.0f}%."

    if breakdown["knowledge_gap"] > 0.60:
        return f"Fundamental knowledge gap detected in {topic_clean} (Mastery: {mastery*100:.0f}%). Conceptual review recommended."

    if breakdown["exam_priority"] >= 0.80:
        return f"High-yield topic for your target exam syllabus ({topic_clean}). Practice problem set recommended."

    if activity.activity_type == ActivityType.SPACED_REVISION:
        return f"Spaced repetition milestone reached for {topic_clean} to strengthen long-term recall."

    return f"Next optimal learning step to boost your overall target score in {topic_clean}."


def rank_candidates(
    student_id: str,
    learner_state: dict[str, Any],
    candidates: list[CandidateActivity],
    student_profile: dict[str, Any] | None = None,
    use_ml_model: bool = False,
) -> list[ScoredRecommendation]:
    """
    Score and rank candidate activities for a student.

    Parameters
    ----------
    student_id : str
        UUID of the student.
    learner_state : dict
        Current state with ``topic_mastery`` and ``retention_scores``.
    candidates : list[CandidateActivity]
        Pool of candidate activities from candidate generator.
    student_profile : dict, optional
        Student profile details (exam target, daily minutes, etc.).
    use_ml_model : bool, optional
        Whether to invoke the tabular GBDT re-ranking pipeline.

    Returns
    -------
    list[ScoredRecommendation]
        Sorted list of scored recommendations in descending order of final_score.
    """
    if not candidates:
        return []

    topic_mastery: dict[str, float] = learner_state.get("topic_mastery", {})
    raw_retention: dict[str, Any] = learner_state.get("retention_scores", {})
    retention_map = refresh_all_retention_scores(topic_mastery, raw_retention)

    scored_list: list[ScoredRecommendation] = []

    for cand in candidates:
        mastery = float(topic_mastery.get(cand.topic_id, 0.0))
        ret_entry = retention_map.get(cand.topic_id, {})
        retention = float(ret_entry.get("score", mastery)) if isinstance(ret_entry, dict) else mastery

        # 1. Feature Factors ---------------------------------------------------
        knowledge_gap = round(1.0 - max(0.0, min(1.0, mastery)), 4)
        forgetting_risk = round(1.0 - max(0.0, min(1.0, retention)), 4)
        exam_priority = _derive_exam_priority(cand.topic_id, student_profile)
        goal_impact = round(0.70 + (knowledge_gap * 0.30), 4)
        engagement_probability = round(0.85 - (cand.difficulty * 0.15), 4)
        content_preference = _derive_content_preference(cand, student_profile)

        # 2. Weighted Score Formula --------------------------------------------
        final_score = (
            (0.30 * knowledge_gap) +
            (0.20 * exam_priority) +
            (0.15 * forgetting_risk) +
            (0.15 * goal_impact) +
            (0.10 * engagement_probability) +
            (0.10 * content_preference)
        )
        final_score_clamped = round(max(0.0, min(1.0, final_score)), 4)

        scoring_breakdown = {
            "knowledge_gap": knowledge_gap,
            "exam_priority": exam_priority,
            "forgetting_risk": forgetting_risk,
            "goal_impact": goal_impact,
            "engagement_probability": engagement_probability,
            "content_preference": content_preference,
        }

        reason = _generate_explanation(scoring_breakdown, cand, mastery, retention)

        scored_list.append(
            ScoredRecommendation(
                activity_id=cand.activity_id,
                topic_id=cand.topic_id,
                title=cand.title,
                activity_type=cand.activity_type,
                estimated_duration_minutes=cand.estimated_duration_minutes,
                difficulty=cand.difficulty,
                final_score=final_score_clamped,
                scoring_breakdown=scoring_breakdown,
                recommendation_reason=reason,
            )
        )

    # 3. Optional ML Tabular Re-ranking Stub -----------------------------------
    if use_ml_model:
        scored_list = _ml_rerank_stub(scored_list)

    # Sort descending by final_score
    scored_list.sort(key=lambda x: x.final_score, reverse=True)

    logger.info(
        "Ranked %d candidates for student=%s | top_score=%.4f",
        len(scored_list),
        student_id,
        scored_list[0].final_score if scored_list else 0.0,
    )
    return scored_list


def _ml_rerank_stub(recommendations: list[ScoredRecommendation]) -> list[ScoredRecommendation]:
    """
    LightGBM / Tabular ML Re-ranking pipeline hook.
    When a trained model checkpoint exists, this passes feature matrices
    through the model to predict expected learning gain and adjusts scores.
    """
    try:
        import numpy as np
        # Feature matrix for tabular ranking
        features = np.array([
            [
                r.scoring_breakdown.get("knowledge_gap", 0),
                r.scoring_breakdown.get("forgetting_risk", 0),
                r.scoring_breakdown.get("exam_priority", 0),
                r.difficulty,
                r.estimated_duration_minutes,
            ]
            for r in recommendations
        ])
        logger.debug("ML feature matrix constructed with shape: %s", features.shape)
    except Exception as e:
        logger.warning("ML re-ranking stub bypassed: %s", e)

    return recommendations
