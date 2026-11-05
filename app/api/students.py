from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.schemas.models import ProfileUpdateRequest

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/me")
async def get_my_profile():
    # Return primary demo student profile
    student = db.profiles.get("prof-student-alex") or list(db.profiles.values())[0]
    return {"success": True, "profile": student}

@router.put("/me")
async def update_my_profile(req: ProfileUpdateRequest):
    student = db.profiles.get("prof-student-alex") or list(db.profiles.values())[0]
    update_data = req.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        if v is not None:
            student[k] = v
    return {"success": True, "profile": student}

@router.get("/skills")
async def get_my_skills():
    student = db.profiles.get("prof-student-alex") or list(db.profiles.values())[0]
    proof_cards = [pc for pc in db.proof_cards.values() if pc.get("student_profile_id") == student["id"]]
    
    # Compute aggregate skills from Proof Cards
    latest_proof = proof_cards[0] if proof_cards else None
    signals = latest_proof.get("signals") if latest_proof else {
        "problem_solving": 88,
        "debugging": 92,
        "logical_reasoning": 86,
        "edge_case_awareness": 94,
        "iteration_discipline": 86,
        "pivot_quality": 92,
        "learning_velocity": 85,
        "ai_collaboration": 89
    }

    learning_progress = {
        "completed_challenges": len(proof_cards) or 1,
        "total_active_trials": len(db.challenges),
        "learning_velocity_trend": [
            {"trial": "Trial #1", "time_sec": 680, "score": 78},
            {"trial": "Trial #2", "time_sec": 520, "score": 84},
            {"trial": "Trial #3", "time_sec": 382, "score": 89}
        ],
        "strengths": [
            "Asynchronous Error Decoupling",
            "Hidden Boundary Edge-Case Probing",
            "Disciplined Hypothesis-Driven Iteration"
        ],
        "development_areas": [
            "Distributed Consensus Algorithms",
            "Memory Profiling Under High Load"
        ]
    }

    return {
        "success": True,
        "signals": signals,
        "learning_progress": learning_progress
    }
