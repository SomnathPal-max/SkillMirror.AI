from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# AUTH & PROFILES
class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "student"
    college: Optional[str] = None
    education_level: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    career_interests: List[str] = Field(default_factory=list)
    preferred_domains: List[str] = Field(default_factory=list)
    organization_name: Optional[str] = None
    industry: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    college: Optional[str] = None
    education_level: Optional[str] = None
    skills: Optional[List[str]] = None
    career_interests: Optional[List[str]] = None
    preferred_domains: Optional[List[str]] = None
    availability: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    bio: Optional[str] = None

# CHALLENGES & EXECUTION
class RunCodeRequest(BaseModel):
    challenge_id: str
    code: str
    language: str = "python"
    custom_tests: List[Dict[str, Any]] = Field(default_factory=list)
    session_id: Optional[str] = None

class SubmitChallengeRequest(BaseModel):
    challenge_id: str
    code: str
    language: str = "python"
    session_id: Optional[str] = None
    client_events: List[Dict[str, Any]] = Field(default_factory=list)
    student_id: Optional[str] = None

class ChallengeCreateRequest(BaseModel):
    title: str
    description: str
    domain: str
    difficulty: str
    language: str = "python"
    estimated_minutes: int = 10
    starter_code: str
    reference_solution: str
    public_tests: List[Dict[str, Any]] = Field(default_factory=list)
    hidden_tests: List[Dict[str, Any]] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

# TELEMETRY & EVENTS
class TelemetryEventRequest(BaseModel):
    session_id: str
    challenge_id: str
    event: Dict[str, Any]

# OPPORTUNITIES & MATCHING
class OpportunityCreateRequest(BaseModel):
    title: str
    description: str
    opportunity_type: str
    location: str
    is_remote: bool = True
    duration: Optional[str] = None
    stipend: Optional[str] = None
    required_skills: List[str] = Field(default_factory=list)
    fast_track_threshold: int = 80

class ApplicationRequest(BaseModel):
    opportunity_id: str
    student_id: str
    proof_card_id: Optional[str] = None
    cover_note: Optional[str] = None

# TEAMS
class TeamCreateRequest(BaseModel):
    name: str
    project_goal: str
    target_hackathon: Optional[str] = None
    required_roles: List[str] = Field(default_factory=list)
    creator_id: str

# AI CHAT
class AiChatRequest(BaseModel):
    message: str
    profile_id: Optional[str] = None
    challenge_id: Optional[str] = None
    context_code: Optional[str] = None

class AiAssistRequest(BaseModel):
    prompt: str
    currentCode: Optional[str] = None
    sprintId: Optional[str] = None
