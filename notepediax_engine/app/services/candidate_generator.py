"""
NotepediaX Engine — Candidate Activity Generator
=================================================
Phase 3: Analyzes a student's dynamic learner state against the topic
taxonomy to generate a pool of candidate learning activities.

Strategy:
1. Knowledge Gaps: Topics with low mastery (< 0.5) generate concept-building
   activities (NOTE_READ, VIDEO_LESSON, QUIZ_ATTEMPT).
2. Forgetting & Retention Risks: Topics with low retention (< 0.5) generate
   active recall activities (SPACED_REVISION, FLASHCARD_REVIEW).
3. Mistake Patterns: Topics with recent incorrect answers generate MISTAKE_REVIEW.
4. Mastery Progression: Topics nearing mastery (0.5 - 0.8) generate challenging
   practice problems (QUIZ_ATTEMPT).
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

from app.schemas import ActivityType, CandidateActivity
from app.services.retention_engine import refresh_all_retention_scores

logger = logging.getLogger(__name__)


def generate_candidates(
    student_id: str,
    learner_state: dict[str, Any],
    taxonomy: list[dict[str, Any]],
    focus_topic_ids: list[str] | None = None,
) -> list[CandidateActivity]:
    """
    Generate candidate learning activities for a student based on knowledge
    gaps, retention decay curves, and topic taxonomy.

    Parameters
    ----------
    student_id : str
        UUID of the student.
    learner_state : dict
        Current learner state containing ``topic_mastery`` and ``retention_scores``.
    taxonomy : list[dict]
        List of topic records from ``topic_taxonomy`` table.
    focus_topic_ids : list[str], optional
        Explicit topics requested by student or syllabus.

    Returns
    -------
    list[CandidateActivity]
        Pool of candidate activities available for ranking and scheduling.
    """
    topic_mastery: dict[str, float] = learner_state.get("topic_mastery", {})
    raw_retention: dict[str, Any] = learner_state.get("retention_scores", {})

    # Refresh retention scores dynamically so decay is accurate right now
    retention_map = refresh_all_retention_scores(topic_mastery, raw_retention)

    candidates: list[CandidateActivity] = []

    # Map taxonomy for quick lookup
    tax_dict: dict[str, dict] = {t.get("id", ""): t for t in taxonomy if t.get("id")}

    # Topics to evaluate: taxonomy topics + any focus topics + existing state topics
    all_topic_ids = list(tax_dict.keys())
    if not all_topic_ids:
        # Fallback if taxonomy is empty in DB
        all_topic_ids = list(set(list(topic_mastery.keys()) + list(retention_map.keys()) + (focus_topic_ids or [])))

    if focus_topic_ids:
        target_topics = [tid for tid in focus_topic_ids if tid in tax_dict or tid in topic_mastery]
        if not target_topics:
            target_topics = focus_topic_ids
    else:
        target_topics = all_topic_ids

    for topic_id in target_topics:
        tax_info = tax_dict.get(topic_id, {})
        subject = tax_info.get("subject", "General").capitalize()
        topic_name = tax_info.get("topic", topic_id.replace("_", " ").title())

        mastery = float(topic_mastery.get(topic_id, 0.0))
        ret_entry = retention_map.get(topic_id, {})
        retention = float(ret_entry.get("score", mastery)) if isinstance(ret_entry, dict) else mastery

        # ------------------------------------------------------------------
        # 1. High Knowledge Gap (Mastery < 0.50)
        # ------------------------------------------------------------------
        if mastery < 0.50:
            # Note Reading Activity (Conceptual Foundation)
            candidates.append(
                CandidateActivity(
                    activity_id=f"act_note_{topic_id}_{uuid.uuid4().hex[:6]}",
                    topic_id=topic_id,
                    title=f"Core Theory & Formula Guide: {topic_name}",
                    activity_type=ActivityType.NOTE_READ,
                    estimated_duration_minutes=25,
                    difficulty=0.4,
                )
            )

            # Video Lesson Activity
            candidates.append(
                CandidateActivity(
                    activity_id=f"act_vid_{topic_id}_{uuid.uuid4().hex[:6]}",
                    topic_id=topic_id,
                    title=f"Video Walkthrough: {topic_name} Fundamentals",
                    activity_type=ActivityType.VIDEO_LESSON,
                    estimated_duration_minutes=20,
                    difficulty=0.45,
                )
            )

            # Diagnostic / Foundation Quiz
            candidates.append(
                CandidateActivity(
                    activity_id=f"act_quiz_{topic_id}_{uuid.uuid4().hex[:6]}",
                    topic_id=topic_id,
                    title=f"Guided Concept Quiz: {topic_name}",
                    activity_type=ActivityType.QUIZ_ATTEMPT,
                    estimated_duration_minutes=20,
                    difficulty=0.5,
                )
            )

        # ------------------------------------------------------------------
        # 2. Forgetting Risk & Revision Due (Retention < 0.50)
        # ------------------------------------------------------------------
        if retention < 0.50:
            # Spaced Revision Session
            candidates.append(
                CandidateActivity(
                    activity_id=f"act_rev_{topic_id}_{uuid.uuid4().hex[:6]}",
                    topic_id=topic_id,
                    title=f"Spaced Memory Refresh: {topic_name}",
                    activity_type=ActivityType.SPACED_REVISION,
                    estimated_duration_minutes=20,
                    difficulty=0.5,
                )
            )

            # Active Recall Flashcards
            candidates.append(
                CandidateActivity(
                    activity_id=f"act_fc_{topic_id}_{uuid.uuid4().hex[:6]}",
                    topic_id=topic_id,
                    title=f"Rapid Recall Flashcard Deck: {topic_name}",
                    activity_type=ActivityType.FLASHCARD_REVIEW,
                    estimated_duration_minutes=15,
                    difficulty=0.35,
                )
            )

        # ------------------------------------------------------------------
        # 3. Intermediate Mastery (0.50 <= Mastery < 0.85) -> Practice & Deepening
        # ------------------------------------------------------------------
        if 0.50 <= mastery < 0.85:
            candidates.append(
                CandidateActivity(
                    activity_id=f"act_quiz_adv_{topic_id}_{uuid.uuid4().hex[:6]}",
                    topic_id=topic_id,
                    title=f"Exam-Level Problem Set: {topic_name}",
                    activity_type=ActivityType.QUIZ_ATTEMPT,
                    estimated_duration_minutes=30,
                    difficulty=0.7,
                )
            )
            candidates.append(
                CandidateActivity(
                    activity_id=f"act_err_{topic_id}_{uuid.uuid4().hex[:6]}",
                    topic_id=topic_id,
                    title=f"Mistake Analysis & Edge Cases: {topic_name}",
                    activity_type=ActivityType.MISTAKE_REVIEW,
                    estimated_duration_minutes=15,
                    difficulty=0.6,
                )
            )

        # ------------------------------------------------------------------
        # 4. High Mastery (>= 0.85) -> Maintenance & Advanced Speed Drilling
        # ------------------------------------------------------------------
        if mastery >= 0.85:
            candidates.append(
                CandidateActivity(
                    activity_id=f"act_speed_{topic_id}_{uuid.uuid4().hex[:6]}",
                    topic_id=topic_id,
                    title=f"Timed Speed Drill: {topic_name}",
                    activity_type=ActivityType.QUIZ_ATTEMPT,
                    estimated_duration_minutes=15,
                    difficulty=0.85,
                )
            )

    logger.info(
        "Candidate generation complete | student=%s | pool_size=%d",
        student_id,
        len(candidates),
    )
    return candidates
