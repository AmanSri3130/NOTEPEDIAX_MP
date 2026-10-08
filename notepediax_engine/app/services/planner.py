"""
NotepediaX Engine — Constraint-Based Planner & Adaptive Replanner
==================================================================
Phase 3: Assembles optimized daily study schedules satisfying:
  1. Prerequisite Knowledge Constraints (Prerequisite topics must have mastery > 0.60)
  2. Daily Time Budget Constraint (daily_available_minutes)
  3. Cognitive Fatigue / Study-Break Insertion (10-min break after 45-50 min continuous study)
  4. Dynamic Adaptive Replanning upon feedback (e.g. SKIPPED, TOO_HARD)
"""

from __future__ import annotations

import logging
import uuid
from datetime import date, datetime, timezone
from typing import Any

from app.database import get_mongodb_database
from app.schemas import (
    ActivityStatus,
    ActivityType,
    CandidateActivity,
    DailyPlan,
    DifficultyFeedback,
    PlanFeedback,
    ScheduledActivity,
    ScoredRecommendation,
)
from app.services.candidate_generator import generate_candidates
from app.services.recommender import rank_candidates

logger = logging.getLogger(__name__)


def _check_prerequisites_met(
    topic_id: str,
    learner_state: dict[str, Any],
    taxonomy_dict: dict[str, dict],
    min_prereq_mastery: float = 0.60,
) -> bool:
    """
    Verify whether all prerequisite topics have been sufficiently mastered.
    """
    topic_info = taxonomy_dict.get(topic_id, {})
    prereqs = topic_info.get("prerequisite_topic_ids", [])
    if not prereqs:
        return True

    mastery_map: dict[str, float] = learner_state.get("topic_mastery", {})
    for prereq_id in prereqs:
        prereq_mastery = float(mastery_map.get(prereq_id, 0.0))
        if prereq_mastery < min_prereq_mastery:
            logger.info(
                "Prerequisite topic '%s' (mastery=%.2f) not met for '%s' (required >= %.2f)",
                prereq_id, prereq_mastery, topic_id, min_prereq_mastery,
            )
            return False
    return True


def optimize_daily_plan(
    student_id: str,
    available_minutes: int,
    ranked_candidates: list[ScoredRecommendation],
    learner_state: dict[str, Any] | None = None,
    taxonomy: list[dict[str, Any]] | None = None,
    plan_date: date | None = None,
) -> DailyPlan:
    """
    Build an optimized daily schedule bounded by time and prerequisite constraints.

    Parameters
    ----------
    student_id : str
        MongoDB id of target student.
    available_minutes : int
        Daily study budget in minutes.
    ranked_candidates : list[ScoredRecommendation]
        Candidate activities sorted by score descending.
    learner_state : dict, optional
        Student learner state for prerequisite verification.
    taxonomy : list[dict], optional
        Topic taxonomy records.
    plan_date : date, optional
        Target plan date (default: today).

    Returns
    -------
    DailyPlan
        Bounded daily schedule with study slots and break periods.
    """
    db = get_mongodb_database()
    target_date = plan_date or date.today()
    taxonomy_dict = {t.get("id", ""): t for t in (taxonomy or []) if t.get("id")}
    state = learner_state or {}

    scheduled_activities: list[ScheduledActivity] = []
    total_allocated = 0
    continuous_study_block = 0
    slot_index = 1

    for cand in ranked_candidates:
        # Check prerequisite constraint
        if taxonomy_dict and not _check_prerequisites_met(cand.topic_id, state, taxonomy_dict):
            continue

        cand_duration = cand.estimated_duration_minutes

        # Check if adding this activity would exceed the total budget
        if total_allocated + cand_duration > available_minutes:
            continue

        # Check if we should insert a 10-minute break before this activity
        if continuous_study_block >= 45 and (total_allocated + 10 + cand_duration <= available_minutes):
            break_activity = ScheduledActivity(
                activity_id=f"break_{slot_index}_{uuid.uuid4().hex[:4]}",
                time_slot=f"Slot {slot_index} (Break)",
                activity=None,
                is_break=True,
                duration_minutes=10,
                status=ActivityStatus.COMPLETED,
            )
            scheduled_activities.append(break_activity)
            total_allocated += 10
            continuous_study_block = 0
            slot_index += 1

        # Add study activity
        start_min = total_allocated
        end_min = start_min + cand_duration
        activity_slot = ScheduledActivity(
            activity_id=cand.activity_id,
            time_slot=f"Slot {slot_index} ({start_min}m–{end_min}m)",
            activity=cand,
            is_break=False,
            duration_minutes=cand_duration,
            status=ActivityStatus.PENDING,
        )
        scheduled_activities.append(activity_slot)
        total_allocated += cand_duration
        continuous_study_block += cand_duration
        slot_index += 1

        # Stop if budget is reached
        if total_allocated >= available_minutes:
            break

    plan_id = uuid.uuid4()
    daily_plan = DailyPlan(
        plan_id=plan_id,
        student_id=student_id,
        plan_date=target_date,
        total_allocated_minutes=total_allocated,
        activities=scheduled_activities,
        completion_status=0.0,
        status="active",
    )

    # Persist the plan for this student and date.
    plan_row = {
        "id": str(plan_id),
        "student_id": student_id,
        "plan_date": target_date.isoformat(),
        "activities": [act.model_dump(mode="json") for act in scheduled_activities],
        "status": "active",
    }
    db.learning_plans.replace_one(
        {"student_id": student_id, "plan_date": target_date.isoformat()},
        plan_row,
        upsert=True,
    )
    logger.info("Persisted daily plan in MongoDB | plan_id=%s | student=%s", plan_id, student_id)

    return daily_plan


def adaptive_replan(
    student_id: str,
    plan_id: str,
    feedback: PlanFeedback,
    student_profile: dict[str, Any] | None = None,
) -> DailyPlan:
    """
    Dynamically adapt the remaining daily schedule based on real-time activity feedback.

    Adaptation Rules:
    - If status == SKIPPED or difficulty_feedback == TOO_HARD:
      Replace upcoming high-difficulty quizzes on that topic with theory review / AI notes.
    - If status == COMPLETED:
      Recalculate overall plan completion percentage.
    """
    db = get_mongodb_database()

    # 1. Fetch current plan from MongoDB ---------------------------------------
    plan_row = db.learning_plans.find_one({"id": plan_id, "student_id": student_id})
    if not plan_row:
        # Fallback query by student_id and today's date
        today_str = date.today().isoformat()
        plan_row = db.learning_plans.find_one(
            {"student_id": student_id, "plan_date": today_str}
        )

    if not plan_row:
        raise ValueError(f"No active learning plan found for plan_id={plan_id} or student={student_id}")

    existing_activities_raw = plan_row.get("activities", [])
    activities: list[ScheduledActivity] = [
        ScheduledActivity(**act) for act in existing_activities_raw
    ]

    # 2. Update target activity status -----------------------------------------
    target_found = False
    affected_topic_id = None
    for act in activities:
        if act.activity_id == feedback.activity_id:
            act.status = feedback.status
            if act.activity:
                affected_topic_id = act.activity.topic_id
            target_found = True
            break

    # 3. Apply Adaptive Modifications if skipped or struggled ------------------
    if feedback.status == ActivityStatus.SKIPPED or feedback.difficulty_feedback == DifficultyFeedback.TOO_HARD:
        logger.info("Triggering adaptive re-scheduling due to difficulty/skip on activity: %s", feedback.activity_id)

        # For remaining pending activities on this topic, reduce difficulty or substitute with NOTE_READ
        for act in activities:
            if act.status == ActivityStatus.PENDING and act.activity:
                if affected_topic_id and act.activity.topic_id == affected_topic_id:
                    if act.activity.activity_type == ActivityType.QUIZ_ATTEMPT:
                        # Substitute difficult quiz with supportive theory/summary note
                        act.activity.activity_type = ActivityType.NOTE_READ
                        act.activity.title = f"AI Conceptual Breakdown & Key Formulas: {affected_topic_id.replace('_', ' ').title()}"
                        act.activity.difficulty = 0.35
                        act.activity.recommendation_reason = "Adaptive adjustment: Simplified conceptual review after difficulty signal."

    # 4. Compute updated completion status -------------------------------------
    study_activities = [a for a in activities if not a.is_break]
    completed_count = sum(1 for a in study_activities if a.status == ActivityStatus.COMPLETED)
    total_study_count = len(study_activities)
    completion_ratio = round(completed_count / total_study_count, 4) if total_study_count > 0 else 0.0

    overall_status = "completed" if completion_ratio >= 1.0 else "active"

    # 5. Persist updated plan --------------------------------------------------
    updated_plan = DailyPlan(
        plan_id=uuid.UUID(plan_row["id"]),
        student_id=student_id,
        plan_date=date.fromisoformat(plan_row["plan_date"]) if isinstance(plan_row["plan_date"], str) else plan_row["plan_date"],
        total_allocated_minutes=sum(a.duration_minutes for a in activities),
        activities=activities,
        completion_status=completion_ratio,
        status=overall_status,
    )

    db.learning_plans.update_one(
        {"id": plan_row["id"], "student_id": student_id},
        {"$set": {
            "activities": [a.model_dump(mode="json") for a in activities],
            "status": overall_status,
        }},
    )

    logger.info("Adaptive replan completed | plan_id=%s | new_completion=%.2f", plan_row["id"], completion_ratio)
    return updated_plan
