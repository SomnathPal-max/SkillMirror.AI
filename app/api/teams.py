from fastapi import APIRouter, HTTPException
from app.core.database import db
from app.schemas.models import TeamCreateRequest
import uuid
import time

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get("")
async def list_teams():
    return {"success": True, "teams": list(db.teams.values())}

@router.post("")
async def create_team(req: TeamCreateRequest):
    new_id = f"team-{uuid.uuid4().hex[:8]}"
    creator = db.profiles.get(req.creator_id, {"full_name": "Student Lead"})
    new_team = {
        "id": new_id,
        "name": req.name,
        "project_goal": req.project_goal,
        "target_hackathon": req.target_hackathon or "National AI Hackathon",
        "required_roles": req.required_roles,
        "creator_profile_id": req.creator_id,
        "is_recruiting": True,
        "members": [
            {"profile_id": req.creator_id, "name": creator.get("full_name"), "role": "Team Founder"}
        ],
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    db.teams[new_id] = new_team
    return {"success": True, "team": new_team}

@router.post("/{team_id}/join")
async def join_team(team_id: str, profile_id: str):
    team = db.teams.get(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    profile = db.profiles.get(profile_id, {"full_name": "Applicant"})
    team["members"].append({
        "profile_id": profile_id,
        "name": profile.get("full_name"),
        "role": "Complementary Contributor"
    })
    return {"success": True, "message": "Joined team successfully", "team": team}
