"""
NotepediaX Engine — FastAPI Core Application (Phase 1, 2 & 3)
==============================================================
Phase 1:
  POST /student/onboard                   — Create profile + empty learner state
  POST /student/{id}/diagnostic           — Seed baseline mastery from diagnostic
  GET  /student/{id}/state                — Read profile + real-time refreshed learner state

Phase 2:
  POST /student/{id}/event                — Ingest universal event, update feature pipeline,
                                            topic mastery, and retention scores
  GET  /student/{id}/revision-due         — Ranked list of topics requiring revision
  GET  /student/{id}/features/{topic_id}  — Compiled ML feature vector

Phase 3:
  GET  /student/{id}/recommendations      — Multi-factor ranked candidate learning activities
  POST /student/{id}/optimize-plan        — Constraint-based daily schedule generation & saving
  GET  /student/{id}/plan/today           — Fetch current day's active plan
  POST /student/{id}/plan/{act_id}/feedback — Submit activity outcome & trigger adaptive replan
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import date, datetime, timezone

from fastapi import FastAPI, HTTPException, Query, status

from app.config import get_settings
from app.database import get_supabase_client
from app.schemas import (
    APIResponse,
    DailyPlan,
    DiagnosticSubmission,
    FeatureVectorResponse,
    LearnerStateResponse,
    OptimizePlanRequest,
    PlanFeedback,
    RevisionDueResponse,
    ScoredRecommendation,
    StudentProfileCreate,
    StudentProfileResponse,
    UniversalLearningEvent,
)
from app.services.candidate_generator import generate_candidates
from app.services.feature_pipeline import extract_feature_vector
from app.services.learner_state import (
    calculate_diagnostic_state,
    process_event_and_update_state,
)
from app.services.planner import adaptive_replan, optimize_daily_plan
from app.services.recommender import rank_candidates
from app.services.retention_engine import (
    get_topics_due_for_revision,
    refresh_all_retention_scores,
)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("notepediax")


# ---------------------------------------------------------------------------
# Application lifecycle
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hook — logs readiness."""
    settings = get_settings()
    logger.info(
        "🚀 NotepediaX Engine (Phase 3) starting | env=%s | supabase=%s",
        settings.app_env,
        settings.supabase_url[:40] + "…",
    )
    yield
    logger.info("🛑 NotepediaX Engine shutting down")


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NotepediaX Adaptive Learning Engine",
    description="Phase 3 — Recommendation & Constraint-Based Planning Core with Real-time Adaptive Intelligence Loop.",
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Health Check
# =============================================================================

@app.get("/health", tags=["ops"])
async def health_check():
    """Liveness probe reporting current engine status and phase."""
    return {"status": "ok", "phase": 3, "engine": "recommendation_and_planning_core"}


# =============================================================================
# Phase 1: POST /student/onboard
# =============================================================================

@app.post(
    "/student/onboard",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["student"],
    summary="Onboard a new student",
)
async def onboard_student(payload: StudentProfileCreate):
    """
    Create a student profile in the ``students`` table and initialise an
    empty row in ``learner_states``.
    """
    db = get_supabase_client()

    # 1. Insert student profile
    student_row = payload.model_dump()
    insert_result = db.table("students").insert(student_row).execute()

    if not insert_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to insert student profile.",
        )

    student = insert_result.data[0]
    student_id = student["id"]
    logger.info("Student onboarded  id=%s", student_id)

    # 2. Initialise empty learner_states row
    state_row = {
        "student_id": student_id,
        "topic_mastery": {},
        "retention_scores": {},
        "last_updated_at": datetime.now(timezone.utc).isoformat(),
    }
    db.table("learner_states").insert(state_row).execute()
    logger.info("Learner state initialised  student_id=%s", student_id)

    return APIResponse(
        success=True,
        message="Student onboarded successfully.",
        data=StudentProfileResponse(**student).model_dump(mode="json"),
    )


# =============================================================================
# Phase 1: POST /student/{student_id}/diagnostic
# =============================================================================

@app.post(
    "/student/{student_id}/diagnostic",
    response_model=APIResponse,
    tags=["student"],
    summary="Submit diagnostic assessment scores",
)
async def submit_diagnostic(student_id: str, payload: DiagnosticSubmission):
    """
    Process a diagnostic submission, compute the baseline topic-mastery
    vector, seed initial retention scores, and persist to ``learner_states``.
    """
    db = get_supabase_client()

    # Verify student exists
    student_check = db.table("students").select("id").eq("id", student_id).execute()
    if not student_check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student {student_id} not found.",
        )

    # Calculate baseline mastery
    mastery = calculate_diagnostic_state(student_id, payload.scores)

    # Initialise retention scores at t=0 (score = mastery)
    now_iso = datetime.now(timezone.utc).isoformat()
    retention_scores = {
        topic_id: {
            "score": score,
            "last_seen": now_iso,
            "revision_priority": round(1.0 - score, 4),
            "days_since_last_seen": 0.0,
        }
        for topic_id, score in mastery.items()
    }

    # Upsert into learner_states
    db.table("learner_states").upsert(
        {
            "student_id": student_id,
            "topic_mastery": mastery,
            "retention_scores": retention_scores,
            "last_updated_at": now_iso,
        },
        on_conflict="student_id",
    ).execute()

    logger.info("Diagnostic processed  student_id=%s  topics=%d", student_id, len(mastery))

    return APIResponse(
        success=True,
        message="Diagnostic scores processed. Baseline mastery and retention initialized.",
        data={"student_id": student_id, "topic_mastery": mastery, "retention_scores": retention_scores},
    )


# =============================================================================
# Phase 2: POST /student/{student_id}/event
# =============================================================================

@app.post(
    "/student/{student_id}/event",
    response_model=APIResponse,
    tags=["events"],
    summary="Ingest a universal learning event",
)
async def ingest_event(student_id: str, payload: UniversalLearningEvent):
    """
    Ingest any of the 8 universal learning event types, derive performance,
    re-calibrate mastery, compute retention decay, and update state.
    """
    db = get_supabase_client()

    student_check = db.table("students").select("id").eq("id", student_id).execute()
    if not student_check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student {student_id} not found.",
        )

    update_result = process_event_and_update_state(student_id, payload)

    return APIResponse(
        success=True,
        message="Event ingested. Topic mastery and retention scores updated.",
        data=update_result,
    )


# =============================================================================
# Phase 1 & 2: GET /student/{student_id}/state
# =============================================================================

@app.get(
    "/student/{student_id}/state",
    response_model=APIResponse,
    tags=["student"],
    summary="Retrieve current learner state",
)
async def get_student_state(student_id: str):
    """
    Fetch student profile and dynamic learner state with real-time
    recalculated retention decay based on elapsed time.
    """
    db = get_supabase_client()

    profile_result = db.table("students").select("*").eq("id", student_id).execute()
    if not profile_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student {student_id} not found.",
        )

    state_result = db.table("learner_states").select("*").eq("student_id", student_id).execute()
    state_data = state_result.data[0] if state_result.data else {
        "student_id": student_id,
        "topic_mastery": {},
        "retention_scores": {},
        "last_updated_at": None,
    }

    topic_mastery = state_data.get("topic_mastery", {})
    retention_scores = state_data.get("retention_scores", {})
    refreshed_retention = refresh_all_retention_scores(topic_mastery, retention_scores)
    state_data["retention_scores"] = refreshed_retention

    profile = profile_result.data[0]
    learner_state = LearnerStateResponse(**state_data)

    return APIResponse(
        success=True,
        message="Learner state retrieved with refreshed retention decay.",
        data={
            "profile": StudentProfileResponse(**profile).model_dump(mode="json"),
            "learner_state": learner_state.model_dump(mode="json"),
        },
    )


# =============================================================================
# Phase 2: GET /student/{student_id}/revision-due
# =============================================================================

@app.get(
    "/student/{student_id}/revision-due",
    response_model=APIResponse,
    tags=["retention"],
    summary="Get topics due for revision",
)
async def get_revision_due(
    student_id: str,
    threshold: float | None = Query(
        default=None,
        ge=0.0,
        le=1.0,
        description="Retention threshold cutoff (default configured in settings, e.g. 0.5).",
    ),
):
    """
    Calculates current retention for all topics studied by the student and returns
    those falling below the retention threshold, ranked in descending order of revision priority.
    """
    db = get_supabase_client()
    settings = get_settings()
    active_threshold = threshold if threshold is not None else settings.retention_threshold

    student_check = db.table("students").select("id").eq("id", student_id).execute()
    if not student_check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student {student_id} not found.",
        )

    state_result = db.table("learner_states").select("topic_mastery, retention_scores").eq("student_id", student_id).execute()
    if not state_result.data:
        return APIResponse(
            success=True,
            message="No learner state found for student.",
            data={"student_id": student_id, "threshold": active_threshold, "topics_due": []},
        )

    topic_mastery = state_result.data[0].get("topic_mastery", {})
    retention_scores = state_result.data[0].get("retention_scores", {})
    fresh_retention = refresh_all_retention_scores(topic_mastery, retention_scores)
    due_topics = get_topics_due_for_revision(fresh_retention, threshold=active_threshold)

    return APIResponse(
        success=True,
        message=f"Found {len(due_topics)} topic(s) due for revision.",
        data={
            "student_id": student_id,
            "threshold": active_threshold,
            "topics_due": due_topics,
        },
    )


# =============================================================================
# Phase 2: GET /student/{student_id}/features/{topic_id}
# =============================================================================

@app.get(
    "/student/{student_id}/features/{topic_id}",
    response_model=APIResponse,
    tags=["features"],
    summary="Get compiled ML feature vector for a student and topic",
)
async def get_feature_vector(student_id: str, topic_id: str):
    """
    Computes and returns the 7-day rolling ML feature vector for the given
    student and topic pair.
    """
    db = get_supabase_client()

    student_check = db.table("students").select("id").eq("id", student_id).execute()
    if not student_check.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student {student_id} not found.",
        )

    feature_vec = extract_feature_vector(student_id, topic_id)

    return APIResponse(
        success=True,
        message="Feature vector compiled successfully.",
        data=feature_vec,
    )


# =============================================================================
# Phase 3: GET /student/{student_id}/recommendations
# =============================================================================

@app.get(
    "/student/{student_id}/recommendations",
    response_model=APIResponse,
    tags=["recommendations"],
    summary="Get ranked next best learning activities",
)
async def get_recommendations(
    student_id: str,
    limit: int = Query(default=10, ge=1, le=50, description="Max activities to return."),
    use_ml_reranker: bool = Query(default=False, description="Enable ML tabular re-ranking model."),
):
    """
    Evaluates candidate learning activities against knowledge gaps, forgetting risk,
    and target exam weighting to return ranked recommendations with UI explanation reasons.
    """
    db = get_supabase_client()

    profile_res = db.table("students").select("*").eq("id", student_id).execute()
    if not profile_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student {student_id} not found.")
    profile = profile_res.data[0]

    state_res = db.table("learner_states").select("*").eq("student_id", student_id).execute()
    state = state_res.data[0] if state_res.data else {"topic_mastery": {}, "retention_scores": {}}

    taxonomy_res = db.table("topic_taxonomy").select("*").execute()
    taxonomy = taxonomy_res.data or []

    # Generate & rank candidate activities
    candidates = generate_candidates(student_id, state, taxonomy)
    ranked = rank_candidates(
        student_id=student_id,
        learner_state=state,
        candidates=candidates,
        student_profile=profile,
        use_ml_model=use_ml_reranker,
    )

    top_recommendations = ranked[:limit]

    return APIResponse(
        success=True,
        message=f"Generated {len(top_recommendations)} ranked recommendation(s).",
        data={
            "student_id": student_id,
            "recommendations": [rec.model_dump(mode="json") for rec in top_recommendations],
        },
    )


# =============================================================================
# Phase 3: POST /student/{student_id}/optimize-plan
# =============================================================================

@app.post(
    "/student/{student_id}/optimize-plan",
    response_model=APIResponse,
    tags=["planning"],
    summary="Generate optimized daily learning plan",
)
async def generate_optimized_plan(student_id: str, payload: OptimizePlanRequest | None = None):
    """
    Builds an optimized daily schedule fitting within the student's available minutes,
    enforcing prerequisite mastery rules, and automatically inserting rest breaks.
    """
    db = get_supabase_client()

    profile_res = db.table("students").select("*").eq("id", student_id).execute()
    if not profile_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student {student_id} not found.")
    profile = profile_res.data[0]

    state_res = db.table("learner_states").select("*").eq("student_id", student_id).execute()
    state = state_res.data[0] if state_res.data else {"topic_mastery": {}, "retention_scores": {}}

    taxonomy_res = db.table("topic_taxonomy").select("*").execute()
    taxonomy = taxonomy_res.data or []

    # Determine time budget
    req_minutes = payload.available_minutes if payload else None
    available_minutes = req_minutes or profile.get("daily_available_minutes", 60)
    plan_date_target = (payload.plan_date if payload and payload.plan_date else date.today())
    focus_topics = payload.focus_topics if payload else None

    # Generate, score, and optimize plan
    candidates = generate_candidates(student_id, state, taxonomy, focus_topic_ids=focus_topics)
    ranked = rank_candidates(student_id, state, candidates, student_profile=profile)
    optimized_plan = optimize_daily_plan(
        student_id=student_id,
        available_minutes=available_minutes,
        ranked_candidates=ranked,
        learner_state=state,
        taxonomy=taxonomy,
        plan_date=plan_date_target,
    )

    return APIResponse(
        success=True,
        message="Daily plan optimized and scheduled successfully.",
        data=optimized_plan.model_dump(mode="json"),
    )


# =============================================================================
# Phase 3: GET /student/{student_id}/plan/today
# =============================================================================

@app.get(
    "/student/{student_id}/plan/today",
    response_model=APIResponse,
    tags=["planning"],
    summary="Get today's active learning plan",
)
async def get_today_plan(student_id: str):
    """
    Fetches the student's active plan for today from Supabase ``learning_plans``.
    """
    db = get_supabase_client()
    today_str = date.today().isoformat()

    plan_res = (
        db.table("learning_plans")
        .select("*")
        .eq("student_id", student_id)
        .eq("plan_date", today_str)
        .execute()
    )

    if not plan_res.data:
        return APIResponse(
            success=False,
            message="No active plan found for today. Call /optimize-plan to generate one.",
            data=None,
        )

    plan_row = plan_res.data[0]
    daily_plan = DailyPlan(
        plan_id=plan_row["id"],
        student_id=plan_row["student_id"],
        plan_date=plan_row["plan_date"],
        total_allocated_minutes=sum(a.get("duration_minutes", 0) for a in plan_row.get("activities", [])),
        activities=plan_row.get("activities", []),
        completion_status=0.0,
        status=plan_row.get("status", "active"),
    )

    return APIResponse(
        success=True,
        message="Today's learning plan retrieved.",
        data=daily_plan.model_dump(mode="json"),
    )


# =============================================================================
# Phase 3: POST /student/{student_id}/plan/{activity_id}/feedback
# =============================================================================

@app.post(
    "/student/{student_id}/plan/{activity_id}/feedback",
    response_model=APIResponse,
    tags=["planning"],
    summary="Submit activity feedback and trigger adaptive replan",
)
async def submit_plan_feedback(
    student_id: str,
    activity_id: str,
    payload: PlanFeedback,
):
    """
    Receives activity outcome feedback, updates activity status, logs learning event,
    and dynamically adapts remaining scheduled tasks if the student struggled or skipped.
    """
    db = get_supabase_client()

    # Find today's plan
    today_str = date.today().isoformat()
    plan_res = (
        db.table("learning_plans")
        .select("*")
        .eq("student_id", student_id)
        .eq("plan_date", today_str)
        .execute()
    )

    if not plan_res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active plan found for today.")

    plan_id = plan_res.data[0]["id"]
    payload.activity_id = activity_id

    # Execute adaptive replan
    updated_plan = adaptive_replan(
        student_id=student_id,
        plan_id=plan_id,
        feedback=payload,
    )

    return APIResponse(
        success=True,
        message="Feedback processed. Daily plan adapted dynamically.",
        data=updated_plan.model_dump(mode="json"),
    )


# =============================================================================
# Entrypoint (for `python -m app.main`)
# =============================================================================

if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=(settings.app_env == "development"),
        log_level=settings.log_level.lower(),
    )
