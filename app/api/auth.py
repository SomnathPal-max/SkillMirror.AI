from fastapi import APIRouter, HTTPException, Depends
from app.core.database import db
from app.schemas.models import RegisterRequest, LoginRequest
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register(req: RegisterRequest):
    # Check if user already exists
    for prof in db.profiles.values():
        if prof.get("email") == req.email.lower():
            raise HTTPException(status_code=400, detail="User with this email already exists")

    new_id = f"prof-{uuid.uuid4().hex[:8]}"
    new_profile = {
        "id": new_id,
        "full_name": req.full_name,
        "email": req.email.lower(),
        "role": req.role,
        "college": req.college or "Self-Taught / Open Source",
        "education_level": req.education_level or "Undergraduate",
        "skills": req.skills or ["Python", "FastAPI"],
        "career_interests": req.career_interests or ["Software Engineering"],
        "preferred_domains": req.preferred_domains or ["Web & Cloud"],
        "profile_completed_pct": 80,
        "availability": "Immediate",
        "bio": f"Passionate {req.role} on SkillMirror AI."
    }
    db.profiles[new_id] = new_profile

    # If organization registration
    if req.role == "organization" and req.organization_name:
        org_id = f"org-{uuid.uuid4().hex[:8]}"
        db.organizations[org_id] = {
            "id": org_id,
            "owner_profile_id": new_id,
            "name": req.organization_name,
            "industry": req.industry or "Technology",
            "description": f"{req.organization_name} on SkillMirror AI",
            "contact_email": req.email.lower(),
            "verified": False,
            "required_skills": req.skills
        }

    return {
        "success": True,
        "user": new_profile,
        "token": f"sm-jwt-{new_id}"
    }

@router.post("/login")
async def login(req: LoginRequest):
    email = req.email.lower()
    for prof in db.profiles.values():
        if prof.get("email") == email:
            return {
                "success": True,
                "user": prof,
                "token": f"sm-jwt-{prof['id']}"
            }
    
    # Return demo student if not found
    default_student = list(db.profiles.values())[0]
    return {
        "success": True,
        "user": default_student,
        "token": f"sm-jwt-{default_student['id']}"
    }

@router.post("/logout")
async def logout():
    return {"success": True, "message": "Successfully logged out"}

@router.get("/me")
async def get_current_user():
    return {"success": True, "user": list(db.profiles.values())[0]}
