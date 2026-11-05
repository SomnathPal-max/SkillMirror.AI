from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.schemas.models import RunCodeRequest, SubmitChallengeRequest, ChallengeCreateRequest
from app.services.evaluator import run_python_tests
from app.services.scoring_engine import compute_deterministic_scores
from app.services.thought_xray import generate_thought_xray
import uuid
import time

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.get("")
async def list_challenges():
    public_list = []
    for c in db.challenges.values():
        public_list.append({
            "id": c["id"],
            "title": c["title"],
            "slug": c["slug"],
            "organization": c.get("organization", "OpenCore Foundation"),
            "domain": c.get("domain", "Distributed Systems"),
            "difficulty": c["difficulty"],
            "language": c.get("language", "python"),
            "estimated_minutes": c.get("estimated_minutes", 10),
            "calibrated_median_seconds": c.get("calibrated_median_seconds", 510),
            "description": c["description"],
            "tags": c.get("tags", []),
            "public_tests_count": len(c.get("public_tests", [])),
            "hidden_tests_count": len(c.get("hidden_tests", []))
        })
    return {"success": True, "challenges": public_list}

@router.get("/{challenge_id}")
async def get_challenge(challenge_id: str):
    c = db.challenges.get(challenge_id)
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    # Return challenge without exposing exact hidden test code
    sanitized = {
        **c,
        "hidden_tests": [{"id": h["id"], "name": h["name"], "is_hidden": True} for h in c.get("hidden_tests", [])]
    }
    return {"success": True, "challenge": sanitized}

@router.post("/{challenge_id}/run")
async def run_challenge(challenge_id: str, req: RunCodeRequest):
    c = db.challenges.get(challenge_id)
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    all_tests = list(c.get("public_tests", [])) + list(c.get("hidden_tests", []))
    
    # Add custom tests if supplied
    for ct in req.custom_tests:
        all_tests.append({
            "id": f"custom-{uuid.uuid4().hex[:4]}",
            "name": ct.get("name", "Custom Edge Case"),
            "test_code": ct.get("test_code", ""),
            "is_hidden": False
        })

    # Execute safely
    results = await run_python_tests(req.code, all_tests)

    # Log telemetry event
    if req.session_id:
        if req.session_id not in db.events:
            db.events[req.session_id] = []
        db.events[req.session_id].append({
            "id": f"ev-{len(db.events[req.session_id]) + 101}",
            "timestamp": int(time.time() * 1000),
            "type": "test_run",
            "payload": {
                "passed": results["passed"],
                "passed_count": results["passed_count"],
                "failed_count": results["failed_count"]
            }
        })

    return {"success": True, "results": results}

@router.post("/{challenge_id}/submit")
async def submit_challenge(challenge_id: str, req: SubmitChallengeRequest):
    c = db.challenges.get(challenge_id)
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    all_tests = list(c.get("public_tests", [])) + list(c.get("hidden_tests", []))
    results = await run_python_tests(req.code, all_tests)

    # Retrieve logged events
    session_events = db.events.get(req.session_id, [])
    combined_events = session_events + req.client_events

    # Compute deterministic scores
    scores = compute_deterministic_scores(
        events=combined_events,
        test_results=results,
        calibrated_median_sec=c.get("calibrated_median_seconds", 510)
    )

    # Generate Thought-X-Ray
    thought_xray = generate_thought_xray(combined_events, c["title"])

    # Create & Save Proof Card
    proof_id = f"proof-{uuid.uuid4().hex[:8]}"
    student_id = req.student_id or "prof-student-alex"
    student = db.profiles.get(student_id, {"full_name": "Student Candidate"})

    proof_card = {
        "id": proof_id,
        "token": f"sm-card-{uuid.uuid4().hex[:6]}-verified",
        "student_profile_id": student_id,
        "student_name": student.get("full_name", "Student Candidate"),
        "challenge_id": challenge_id,
        "challenge_title": c["title"],
        "repo_source": c.get("repo_source", "open-source/core"),
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "signals": scores,
        "overall_score": scores["overall_score"],
        "stats": {
            "time_formatted": thought_xray["total_duration"],
            "calibrated_median": f"{c.get('calibrated_median_seconds', 510)//60:02d}:00",
            "test_runs_count": scores["evidence_summary"]["total_runs"],
            "custom_tests_count": scores["evidence_summary"]["custom_tests_count"],
            "hidden_tests_passed": scores["evidence_summary"]["hidden_passed"],
            "total_hidden_tests": scores["evidence_summary"]["total_hidden"],
            "learning_slope": -1.35
        },
        "thought_xray": thought_xray
    }
    db.proof_cards[proof_id] = proof_card

    return {
        "success": True,
        "results": results,
        "proof_card": proof_card
    }

@router.post("/create")
async def create_challenge(req: ChallengeCreateRequest):
    new_id = f"chal-{uuid.uuid4().hex[:8]}"
    new_challenge = {
        "id": new_id,
        "title": req.title,
        "slug": req.title.lower().replace(" ", "-"),
        "organization": "Custom Community Sprint",
        "domain": req.domain,
        "difficulty": req.difficulty,
        "language": req.language,
        "estimated_minutes": req.estimated_minutes,
        "calibrated_median_seconds": req.estimated_minutes * 60,
        "description": req.description,
        "starter_code": req.starter_code,
        "reference_solution": req.reference_solution,
        "public_tests": req.public_tests,
        "hidden_tests": req.hidden_tests,
        "tags": req.tags
    }
    db.challenges[new_id] = new_challenge
    return {"success": True, "challenge": new_challenge}
