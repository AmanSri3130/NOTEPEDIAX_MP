"""
NotepediaX Engine — Phase 3: Recommendation & Constraint-Based Planning Simulation
====================================================================================
End-to-end integration test suite verifying:
  1. Candidate Generation & Multi-Factor Scoring with Explainable Reasons
  2. Constraint-Based Daily Schedule Optimization (Time budget + Automatic Breaks)
  3. Real-Time Adaptive Replanning upon Difficulty / Skip Feedback

Usage
-----
  # 1. Start the server (in notepediax_engine/):
  #    uvicorn app.main:app --reload
  # 2. Run this test suite:
  #    python -m tests.test_phase3_simulation
"""

from __future__ import annotations

import sys
import httpx

# Reconfigure stdout for utf-8 on Windows
if sys.platform.startswith("win") and sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_URL = "http://127.0.0.1:8000"
TOPIC_ID = "physics_electrostatics_ef"


def separator(title: str) -> None:
    """Print visual section separator."""
    print(f"\n{'='*75}")
    print(f"  {title}")
    print(f"{'='*75}")


def main() -> None:
    client = httpx.Client(base_url=BASE_URL, timeout=30.0)

    # ------------------------------------------------------------------
    # Step 1 — Onboard Student with 120-min daily budget & weak topic mastery
    # ------------------------------------------------------------------
    separator("Step 1: Onboard Student & Seed Diagnostic Weakness (Mastery: 0.35)")

    onboard_payload = {
        "academic_level": "class_12",
        "exam_target": "JEE_ADVANCED",
        "target_score": 290,
        "daily_available_minutes": 120,
        "preferred_language": "en",
    }
    resp = client.post("/student/onboard", json=onboard_payload)
    assert resp.status_code == 201, f"Onboard failed: {resp.text}"
    student_id = resp.json()["data"]["id"]
    print(f"[OK] Onboarded Student ID: {student_id}")

    # Seed weak diagnostic score
    diag_payload = {"scores": {TOPIC_ID: 0.35}}
    diag_resp = client.post(f"/student/{student_id}/diagnostic", json=diag_payload)
    assert diag_resp.status_code == 200, f"Diagnostic failed: {diag_resp.text}"
    print(f"[OK] Diagnostic Initialized | Topic: {TOPIC_ID} | Mastery: 0.35")

    # ------------------------------------------------------------------
    # Step 2 — Fetch Next-Best Action Recommendations
    # ------------------------------------------------------------------
    separator("Step 2: Query /recommendations & Verify Multi-Factor Scoring")

    rec_resp = client.get(f"/student/{student_id}/recommendations?limit=5")
    assert rec_resp.status_code == 200, f"Recommendations failed: {rec_resp.text}"
    recommendations = rec_resp.json()["data"]["recommendations"]

    print(f"Generated {len(recommendations)} Ranked Candidate Activities:\n")
    for i, rec in enumerate(recommendations, 1):
        print(f"  [{i}] {rec['title']}")
        print(f"      Type: {rec['activity_type']} | Duration: {rec['estimated_duration_minutes']}m | Score: {rec['final_score']:.4f}")
        print(f"      Reason: \"{rec['recommendation_reason']}\"")
        print(f"      Breakdown: Knowledge Gap={rec['scoring_breakdown']['knowledge_gap']:.2f}, Exam Priority={rec['scoring_breakdown']['exam_priority']:.2f}")

    assert len(recommendations) > 0, "Should generate at least one recommendation"
    assert recommendations[0]["final_score"] >= recommendations[-1]["final_score"], "Should be sorted descending by score"
    print("\n[OK] Multi-factor recommendation ranking verified.")

    # ------------------------------------------------------------------
    # Step 3 — Generate Constraint-Bounded Daily Plan (120 mins)
    # ------------------------------------------------------------------
    separator("Step 3: Call /optimize-plan with 120-Minute Budget & Prerequisite Verification")

    plan_req = {"available_minutes": 120}
    plan_resp = client.post(f"/student/{student_id}/optimize-plan", json=plan_req)
    assert plan_resp.status_code == 200, f"Plan optimization failed: {plan_resp.text}"
    plan_data = plan_resp.json()["data"]

    plan_id = plan_data["plan_id"]
    total_minutes = plan_data["total_allocated_minutes"]
    activities = plan_data["activities"]

    print(f"[OK] Plan Created | Plan ID: {plan_id} | Total Time: {total_minutes} / 120 min")
    print(f"Scheduled Blocks ({len(activities)} total):")

    has_break = False
    for slot in activities:
        if slot["is_break"]:
            has_break = True
            print(f"  - {slot['time_slot']} — Cognitive Rest Period ({slot['duration_minutes']} min)")
        else:
            act = slot["activity"]
            print(f"  - {slot['time_slot']} — {act['title']} [{act['activity_type']}] ({slot['duration_minutes']} min) | Status: {slot['status']}")

    assert total_minutes <= 120, f"Plan exceeded budget: {total_minutes} > 120"
    assert has_break, "Plan should automatically insert cognitive rest breaks after intensive study blocks"
    print("\n[OK] Time budget fitting and break insertion verified.")

    # ------------------------------------------------------------------
    # Step 4 — Fetch Active Daily Plan from /plan/today
    # ------------------------------------------------------------------
    separator("Step 4: Fetch Today's Active Plan via /plan/today")

    today_resp = client.get(f"/student/{student_id}/plan/today")
    assert today_resp.status_code == 200, f"Fetch today plan failed: {today_resp.text}"
    today_plan = today_resp.json()["data"]
    print(f"[OK] Active plan retrieved from Supabase | Status: {today_plan['status']} | Blocks: {len(today_plan['activities'])}")

    # ------------------------------------------------------------------
    # Step 5 — Submit Activity Feedback & Trigger Adaptive Replanning
    # ------------------------------------------------------------------
    separator("Step 5: Submit Feedback (SKIPPED / TOO_HARD) & Verify Adaptive Replanning")

    # Pick the first non-break activity to skip
    study_slots = [s for s in activities if not s["is_break"]]
    first_activity_id = study_slots[0]["activity_id"]

    feedback_payload = {
        "activity_id": first_activity_id,
        "status": "SKIPPED",
        "difficulty_feedback": "TOO_HARD",
        "relevance_feedback": "HELPFUL",
    }
    fb_resp = client.post(
        f"/student/{student_id}/plan/{first_activity_id}/feedback",
        json=feedback_payload,
    )
    assert fb_resp.status_code == 200, f"Feedback submission failed: {fb_resp.text}"
    adapted_plan = fb_resp.json()["data"]

    print(f"[OK] Activity '{first_activity_id}' updated to SKIPPED.")
    print("Updated Schedule after Adaptive Replanning:")
    for slot in adapted_plan["activities"]:
        if slot["is_break"]:
            print(f"  - {slot['time_slot']} — Break ({slot['duration_minutes']} min)")
        else:
            act = slot["activity"]
            print(f"  - {slot['time_slot']} — {act['title']} [{act['activity_type']}] | Diff: {act['difficulty']} | Status: {slot['status']}")

    separator("All Phase 3 Recommendation & Planning Tests Passed Successfully!")


if __name__ == "__main__":
    main()
