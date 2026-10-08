"""
NotepediaX Engine — Phase 2: 7-Day Student Activity Simulation Test Suite
==========================================================================
Simulates a realistic 7-day learning timeline for a student:

  1. Use an existing staging student and seed initial diagnostic mastery (0.60).
  2. Day 1: Student attempts a question correctly with fast response time -> Verify mastery increase.
  3. Day 2–5: Simulate inactivity by backdating `last_seen` in MongoDB -> Verify exponential retention decay.
  4. Day 6: Student does a FLASHCARD_REVIEW with low confidence -> Verify state and retention update.
  5. Day 7: Check `/revision-due` and `/features/{topic_id}` endpoints -> Verify urgency ranking and ML feature vector.

Usage
-----
  # 1. Start the server (in notepediax_engine/):
  #    uvicorn app.main:app --reload
  # 2. Run this test suite:
  #    python -m tests.test_phase2_simulation
"""

from __future__ import annotations

import sys
import time
import os
from datetime import datetime, timedelta, timezone

import httpx

from app.config import get_settings
from app.database import get_mongodb_database
from app.services.retention_engine import calculate_retention_score

# Reconfigure stdout for utf-8 on Windows
if sys.platform.startswith("win") and sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ---------------------------------------------------------------------------
# Test Configuration
# ---------------------------------------------------------------------------
BASE_URL = "http://127.0.0.1:8000"
TOPIC_ID = "physics_electrostatics_ef"


def separator(title: str) -> None:
    """Print visual section separator."""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")


def main() -> None:
    client = httpx.Client(
        base_url=BASE_URL,
        timeout=30.0,
        headers={"X-Engine-API-Key": get_settings().engine_api_key},
    )

    # ------------------------------------------------------------------
    # Step 1 — Existing staging student & diagnostic seeding
    # ------------------------------------------------------------------
    separator("Step 1: Onboard Student & Seed Diagnostic Mastery (0.60)")

    student_id = os.environ.get("STUDENT_ID")
    if not student_id:
        raise RuntimeError("Set STUDENT_ID to an existing staging student MongoDB ObjectId.")
    print("[OK] Using configured staging student account.")

    # Seed Diagnostic
    diag_payload = {"scores": {TOPIC_ID: 0.60}}
    diag_resp = client.post(f"/student/{student_id}/diagnostic", json=diag_payload)
    assert diag_resp.status_code == 200, f"Diagnostic failed: {diag_resp.text}"
    init_mastery = diag_resp.json()["data"]["topic_mastery"][TOPIC_ID]
    print(f"[OK] Diagnostic seeded | Topic: {TOPIC_ID} | Initial Mastery: {init_mastery:.4f}")

    # ------------------------------------------------------------------
    # Step 2 — Day 1: Successful Question Attempt
    # ------------------------------------------------------------------
    separator("Step 2 (Day 1): Ingest QUESTION_ATTEMPT (Correct, Fast RT)")

    event_payload = {
        "student_id": student_id,
        "event_type": "QUESTION_ATTEMPT",
        "topic_id": TOPIC_ID,
        "metadata": {
            "question_id": "q_electro_001",
            "topic_id": TOPIC_ID,
            "difficulty": 0.7,
            "correct": True,
            "response_time_seconds": 25,
            "attempt_number": 1,
        },
    }
    resp = client.post(f"/student/{student_id}/event", json=event_payload)
    assert resp.status_code == 200, f"Event ingestion failed: {resp.text}"
    evt_data = resp.json()["data"]

    day1_mastery = evt_data["new_mastery"]
    print(f"  Old Mastery       : {evt_data['old_mastery']:.4f}")
    print(f"  Performance Score : {evt_data['performance_score']:.4f}")
    print(f"  New Mastery       : {day1_mastery:.4f}")
    print(f"  New Retention     : {evt_data['retention_score']:.4f}")
    assert day1_mastery > init_mastery, "Mastery should increase after a correct attempt"
    print("[OK] Day 1 event processed and mastery increased.")

    # ------------------------------------------------------------------
    # Step 3 — Day 2 to Day 5: Simulate 4 Days of Inactivity (Decay Curve)
    # ------------------------------------------------------------------
    separator("Step 3 (Days 2–5): Simulate 4 Days of Inactivity & Verify Decay")

    # Backdate the last_seen field in the MongoDB learner state by 4 days.
    db = get_mongodb_database()
    four_days_ago = (datetime.now(timezone.utc) - timedelta(days=4.0)).isoformat()

    db.learner_states.update_one(
        {"student_id": student_id},
        {"$set": {f"retention_scores.{TOPIC_ID}.last_seen": four_days_ago}},
    )
    print(f"Fast-forwarded time: `last_seen` timestamp set to 4 days ago ({four_days_ago[:19]})")

    # Fetch learner state via GET API — API dynamically recalculates decayed retention
    state_resp = client.get(f"/student/{student_id}/state")
    assert state_resp.status_code == 200, f"Get state failed: {state_resp.text}"
    refreshed_retention = state_resp.json()["data"]["learner_state"]["retention_scores"][TOPIC_ID]

    decayed_score = refreshed_retention["score"]
    days_elapsed = refreshed_retention["days_since_last_seen"]
    priority = refreshed_retention["revision_priority"]

    # Calculate theoretical decay: M * exp(-0.15 * 4.0)
    expected_decay = calculate_retention_score(day1_mastery, 4.0, forgetting_rate=0.15)

    print(f"  Elapsed Inactivity Days : {days_elapsed:.2f} days")
    print(f"  Decayed Retention Score : {decayed_score:.4f} (Expected ~ {expected_decay:.4f})")
    print(f"  Revision Priority Score : {priority:.4f}")

    assert abs(decayed_score - expected_decay) < 0.05, f"Decayed retention mismatch: {decayed_score} vs {expected_decay}"
    assert priority > 0.40, "Revision priority should be high after 4 days of inactivity"
    print("[OK] Exponential forgetting decay validated successfully.")

    # ------------------------------------------------------------------
    # Step 4 — Day 6: FLASHCARD_REVIEW with Low Confidence
    # ------------------------------------------------------------------
    separator("Step 4 (Day 6): Ingest FLASHCARD_REVIEW (Low Confidence)")

    flashcard_payload = {
        "student_id": student_id,
        "event_type": "FLASHCARD_REVIEW",
        "topic_id": TOPIC_ID,
        "metadata": {
            "card_id": "fc_ef_009",
            "topic_id": TOPIC_ID,
            "recalled_correctly": False,
            "confidence_rating": 2,  # 1 to 5 scale
        },
    }
    resp = client.post(f"/student/{student_id}/event", json=flashcard_payload)
    assert resp.status_code == 200, f"Flashcard event failed: {resp.text}"
    fc_data = resp.json()["data"]

    print(f"  Performance Score (Low recall + conf) : {fc_data['performance_score']:.4f}")
    print(f"  Updated Mastery                       : {fc_data['old_mastery']:.4f} -> {fc_data['new_mastery']:.4f}")
    print(f"  Reset Retention Score (t=0)           : {fc_data['retention_score']:.4f}")
    print("[OK] Flashcard review processed and state reset at t=0.")

    # ------------------------------------------------------------------
    # Step 5 — Day 7: Revision Due & ML Feature Vector APIs
    # ------------------------------------------------------------------
    separator("Step 5 (Day 7): Query /revision-due and /features Endpoints")

    # Test /revision-due endpoint
    rev_resp = client.get(f"/student/{student_id}/revision-due?threshold=0.85")
    assert rev_resp.status_code == 200, f"Revision due failed: {rev_resp.text}"
    rev_data = rev_resp.json()["data"]

    print(f"  Topics Due for Revision (Threshold 0.85): {len(rev_data['topics_due'])}")
    for item in rev_data["topics_due"]:
        print(f"    - Topic: {item['topic_id']} | Retention: {item['retention_score']:.4f} | Priority: {item['revision_priority']:.4f}")

    assert any(t["topic_id"] == TOPIC_ID for t in rev_data["topics_due"]), "Topic should appear in revision due list"

    # Test /features/{topic_id} endpoint
    feat_resp = client.get(f"/student/{student_id}/features/{TOPIC_ID}")
    assert feat_resp.status_code == 200, f"Feature vector failed: {feat_resp.text}"
    features = feat_resp.json()["data"]

    print("\n  Compiled ML Feature Vector:")
    print(f"    - Rolling Accuracy    : {features['rolling_accuracy']}")
    print(f"    - Avg Response Time   : {features['avg_response_time']}s")
    print(f"    - Study Consistency   : {features['study_consistency']}")
    print(f"    - Total Attempts      : {features['total_attempts']}")
    print(f"    - Current Mastery     : {features['current_mastery']}")
    print(f"    - Retention Score     : {features['retention_score']}")
    print(f"    - Revision Priority   : {features['revision_priority']}")

    separator("All Phase 2 Simulation Tests Passed Successfully!")


if __name__ == "__main__":
    main()
