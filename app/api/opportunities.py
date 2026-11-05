from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.schemas.models import OpportunityCreateRequest, ApplicationRequest
import uuid
import time

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

@router.get("")
async def list_opportunities():
    return {"success": True, "opportunities": list(db.opportunities.values())}

@router.post("")
async def create_opportunity(req: OpportunityCreateRequest):
    new_id = f"op-{uuid.uuid4().hex[:8]}"
    new_op = {
        "id": new_id,
        "organization_id": "org-opencore",
        "org_name": "OpenCore Foundation",
        "title": req.title,
        "description": req.description,
        "opportunity_type": req.opportunity_type,
        "location": req.location,
        "is_remote": req.is_remote,
        "duration": req.duration or "3 Months",
        "stipend": req.stipend or "Competitive",
        "required_skills": req.required_skills,
        "fast_track_threshold": req.fast_track_threshold,
        "status": "open",
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    db.opportunities[new_id] = new_op
    return {"success": True, "opportunity": new_op}

@router.post("/{opportunity_id}/apply")
async def apply_to_opportunity(opportunity_id: str, req: ApplicationRequest):
    op = db.opportunities.get(opportunity_id)
    if not op:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    app_id = f"app-{uuid.uuid4().hex[:8]}"
    new_app = {
        "id": app_id,
        "opportunity_id": opportunity_id,
        "opportunity_title": op["title"],
        "student_id": req.student_id,
        "proof_card_id": req.proof_card_id,
        "cover_note": req.cover_note or "Applied via verified SkillMirror Proof Card.",
        "status": "pending_review",
        "applied_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    db.applications[app_id] = new_app

    return {"success": True, "application": new_app, "message": "Application submitted successfully"}

@router.get("/applications/my")
async def get_my_applications():
    return {"success": True, "applications": list(db.applications.values())}
