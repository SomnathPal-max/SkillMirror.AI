from fastapi import APIRouter
from app.core.database import db
from app.services.matcher import match_student_with_opportunities, match_complementary_teammates

router = APIRouter(prefix="/matching", tags=["Matching"])

@router.get("/results")
async def get_matching_results(student_id: str = "prof-student-alex"):
    student = db.profiles.get(student_id) or list(db.profiles.values())[0]
    proof_cards = [pc for pc in db.proof_cards.values() if pc.get("student_profile_id") == student["id"]]
    latest_proof = proof_cards[0] if proof_cards else list(db.proof_cards.values())[0]

    matched_opportunities = match_student_with_opportunities(
        student_profile=student,
        proof_card=latest_proof,
        all_opportunities=list(db.opportunities.values())
    )

    matched_teammates = match_complementary_teammates(
        student_profile=student,
        proof_card=latest_proof,
        all_profiles=list(db.profiles.values())
    )

    return {
        "success": True,
        "opportunities": matched_opportunities,
        "teammates": matched_teammates
    }
