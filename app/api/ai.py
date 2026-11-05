from fastapi import APIRouter
from app.core.database import db
from app.schemas.models import AiChatRequest, AiAssistRequest
from app.services.ollama_service import (
    ask_ollama_career_assistant,
    ask_ollama_code_assistant,
    get_ollama_status
)

router = APIRouter(prefix="/ai", tags=["AI"])

@router.get("/status")
async def check_ai_status():
    """
    Returns the status of the local Ollama LLM engine and active model.
    """
    status = await get_ollama_status()
    return {
        "success": True,
        **status
    }

@router.post("/chat")
async def chat_with_career_assistant(req: AiChatRequest):
    student = db.profiles.get(req.profile_id or "prof-student-alex")
    proof_cards = [pc for pc in db.proof_cards.values() if pc.get("student_profile_id") == (student["id"] if student else "")]
    latest_proof = proof_cards[0] if proof_cards else list(db.proof_cards.values())[0]

    response = await ask_ollama_career_assistant(
        prompt=req.message,
        student_profile=student,
        proof_card=latest_proof,
        context_code=req.context_code
    )

    return {
        "success": True,
        "response": response["text"],
        "suggested_snippet": response.get("suggested_snippet"),
        "suggested_prompts": response.get("suggested_prompts", []),
        "model_used": response.get("model_used"),
        "source": response.get("source")
    }

@router.post("/assist")
async def assist_with_code(req: AiAssistRequest):
    """
    In-sandbox MirrorCopilot assistant for live Ghost-Sprint coding challenges.
    """
    result = await ask_ollama_code_assistant(
        prompt=req.prompt,
        current_code=req.currentCode,
        challenge_id=req.sprintId
    )
    return result
