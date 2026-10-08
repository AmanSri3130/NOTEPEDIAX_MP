"""
NotepediaX Engine — Mock Event Testing Script
===============================================
End-to-end integration test that exercises the full Phase 1 flow:

  1. Use an existing staging student account.
  2. Submit a diagnostic score.
  3. Emit 3 QUESTION_ATTEMPT events.
  4. Verify that topic_mastery updated correctly in MongoDB.

Usage
-----
  # Start the server first:
  #   cd notepediax_engine && uvicorn app.main:app --reload
  # Then run:
  #   python -m tests.test_mock_events

The script uses httpx (sync) to hit the local FastAPI server.
"""

from __future__ import annotations

import sys
import time
import os

import httpx

from app.config import get_settings

# Reconfigure stdout for utf-8 on Windows
if sys.platform.startswith("win") and sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_URL = "http://127.0.0.1:8000"
TOPIC_ID = "physics_electrostatics_ef"

# Expected mastery after each step (rounded to 4 decimal places):
#   Diagnostic seed         -> 0.4000
#   Event 1 (score = 0.80)  -> 0.4000 * 0.75 + 0.80 * 0.25 = 0.5000
#   Event 2 (score = 0.60)  -> 0.5000 * 0.75 + 0.60 * 0.25 = 0.5250
#   Event 3 (score = 1.00)  -> 0.5250 * 0.75 + 1.00 * 0.25 = 0.6438

MOCK_EVENTS = [
    {"score": 0.80, "correct": True,  "response_time": 45},
    {"score": 0.60, "correct": False, "response_time": 120},
    {"score": 1.00, "correct": True,  "response_time": 30},
]


def separator(title: str) -> None:
    """Print a visual separator in the console."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def main() -> None:
    client = httpx.Client(
        base_url=BASE_URL,
        timeout=30.0,
        headers={"X-Engine-API-Key": get_settings().engine_api_key},
    )

    # ------------------------------------------------------------------
    # Step 1 — Use an existing staging student account
    # ------------------------------------------------------------------
    separator("Step 1: Onboard Student")

    student_id = os.environ.get("STUDENT_ID")
    if not student_id:
        raise RuntimeError("Set STUDENT_ID to an existing staging student MongoDB ObjectId.")
    print("[OK] Using configured staging student account.")

    # ------------------------------------------------------------------
    # Step 2 — Submit Diagnostic
    # ------------------------------------------------------------------
    separator("Step 2: Submit Diagnostic")

    diagnostic_payload = {
        "scores": {TOPIC_ID: 0.40},
    }
    resp = client.post(
        f"/student/{student_id}/diagnostic",
        json=diagnostic_payload,
    )
    assert resp.status_code == 200, f"Diagnostic failed: {resp.text}"

    diag_data = resp.json()["data"]
    print(f"[OK] Diagnostic seeded  mastery = {diag_data['topic_mastery']}")

    # ------------------------------------------------------------------
    # Step 3 — Emit 3 QUESTION_ATTEMPT Events
    # ------------------------------------------------------------------
    separator("Step 3: Emit Learning Events")

    for i, meta in enumerate(MOCK_EVENTS, start=1):
        event_payload = {
            "student_id": student_id,
            "event_type": "QUESTION_ATTEMPT",
            "topic_id": TOPIC_ID,
            "metadata": meta,
        }
        resp = client.post(
            f"/student/{student_id}/event",
            json=event_payload,
        )
        assert resp.status_code == 200, f"Event {i} failed: {resp.text}"

        evt = resp.json()["data"]
        print(
            f"  Event {i}  score={meta['score']:.2f}  "
            f"mastery: {evt['old_mastery']:.4f} -> {evt['new_mastery']:.4f}"
        )
        time.sleep(0.2)  # small delay to respect rate limits

    # ------------------------------------------------------------------
    # Step 4 — Verify Final State
    # ------------------------------------------------------------------
    separator("Step 4: Verify Learner State")

    resp = client.get(f"/student/{student_id}/state")
    assert resp.status_code == 200, f"State fetch failed: {resp.text}"

    state = resp.json()["data"]["learner_state"]
    final_mastery = state["topic_mastery"].get(TOPIC_ID)

    print(f"  Student ID       : {state['student_id']}")
    print(f"  Topic Mastery    : {state['topic_mastery']}")
    print(f"  Retention Scores : {state['retention_scores']}")
    print(f"  Last Updated     : {state['last_updated_at']}")

    # Verify the math:  0.4 -> 0.5 -> 0.525 -> 0.6438
    expected_final = 0.6438
    if final_mastery is not None and abs(final_mastery - expected_final) < 0.01:
        print(f"\n[OK] PASS — Final mastery {final_mastery:.4f} ~ {expected_final}")
    else:
        print(f"\n[FAIL] Expected ~{expected_final}, got {final_mastery}")
        sys.exit(1)

    separator("All Phase 1 Tests Passed [OK]")


if __name__ == "__main__":
    main()
