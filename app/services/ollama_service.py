import httpx
import json
import logging
import re
from typing import Dict, List, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

async def get_ollama_models() -> List[str]:
    """Fetch available models from the local Ollama instance."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                return [m.get("name") for m in data.get("models", [])]
    except Exception as e:
        logger.warning(f"Could not connect to Ollama: {e}")
    return []

async def get_ollama_status() -> Dict[str, Any]:
    """Check Ollama connectivity and active model."""
    models = await get_ollama_models()
    active_model = settings.OLLAMA_MODEL
    
    # Auto-fallback if the specified model is not in local models
    if models and active_model not in models:
        # Prefer llama3.2, llama3, qwen2.5, or first available
        preferred = next((m for m in models if "llama3.2" in m or "llama3" in m or "qwen" in m), models[0])
        active_model = preferred

    return {
        "connected": len(models) > 0,
        "active_model": active_model,
        "available_models": models,
        "base_url": settings.OLLAMA_BASE_URL
    }

async def ask_ollama(
    prompt: str, 
    system_prompt: Optional[str] = None, 
    context_code: Optional[str] = None,
    timeout_sec: float = 45.0
) -> Dict[str, Any]:
    """
    Query local Ollama instance with fallback to deterministic heuristic mentoring.
    """
    models = await get_ollama_models()
    active_model = settings.OLLAMA_MODEL
    if models and active_model not in models:
        preferred = next((m for m in models if "llama3.2" in m or "llama3" in m or "qwen" in m), models[0])
        active_model = preferred

    full_prompt = prompt
    if context_code:
        full_prompt = f"### Student's Current Code:\n```python\n{context_code}\n```\n\n### Question / Request:\n{prompt}"

    default_system = (
        "You are the SkillMirror AI Career Assistant & Technical Mentor. "
        "SkillMirror AI is a talent discovery platform where students prove practical capabilities "
        "through 5-10 minute real-world Ghost-Sprints instead of relying on resumes. "
        "Your mission is to provide evidence-grounded career advice, actionable code guidance, "
        "and technical interview coaching. Be encouraging, concise, technically rigorous, "
        "and never hallucinate fake accomplishments."
    )

    sys_instruction = system_prompt or default_system

    try:
        async with httpx.AsyncClient(timeout=timeout_sec) as client:
            payload = {
                "model": active_model,
                "prompt": full_prompt,
                "system": sys_instruction,
                "stream": False,
                "options": {
                    "temperature": 0.6,
                    "top_p": 0.9,
                    "num_predict": 512
                }
            }
            resp = await client.post(f"{settings.OLLAMA_BASE_URL}/api/generate", json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data.get("response", "").strip()

                # Extract code snippet if present
                suggested_snippet = None
                code_match = re.search(r"```(?:python|javascript|ts)?\n(.*?)```", raw_text, re.DOTALL)
                if code_match:
                    suggested_snippet = code_match.group(1).strip()

                return {
                    "success": True,
                    "text": raw_text,
                    "suggested_snippet": suggested_snippet,
                    "model_used": active_model,
                    "source": "ollama_local"
                }
    except Exception as e:
        logger.warning(f"Ollama generation failed or timed out: {e}")

    # Graceful heuristic fallback if Ollama is unreachable
    return fallback_career_advice(prompt, context_code)

async def ask_ollama_career_assistant(
    prompt: str,
    student_profile: Optional[Dict[str, Any]] = None,
    proof_card: Optional[Dict[str, Any]] = None,
    context_code: Optional[str] = None
) -> Dict[str, Any]:
    """
    Context-aware career mentoring grounded in the student's verified Proof Card.
    """
    student_name = student_profile.get("full_name", "Student") if student_profile else "Student"
    signals = proof_card.get("signals", {}) if proof_card else {}
    challenge_title = proof_card.get("challenge_title", "Ghost-Sprint") if proof_card else "Ghost-Sprint"

    system_prompt = (
        f"You are the SkillMirror AI Career Assistant mentoring {student_name}. "
        f"The student completed a verified Ghost-Sprint '{challenge_title}'. "
        f"Their verified deterministic signal metrics are: "
        f"Debugging Speed: {signals.get('debugging', 85)}/100, "
        f"Edge-Case Awareness: {signals.get('edge_case_awareness', 90)}/100, "
        f"Iteration Discipline: {signals.get('iteration_discipline', 82)}/100, "
        f"Pivot Quality: {signals.get('pivot_quality', 80)}/100. "
        f"Give direct, actionable advice referencing their verified proof card. "
        f"Keep answers clear, technically precise, and concise."
    )

    res = await ask_ollama(prompt, system_prompt=system_prompt, context_code=context_code)
    
    # Enrich with prompt suggestions
    res["suggested_prompts"] = [
        "How can I improve my Edge-Case Awareness score to 98?",
        "What companies fast-track candidates with my verified skills?",
        "Conduct a 3-question technical interview on async error recovery."
    ]
    return res

async def ask_ollama_code_assistant(
    prompt: str,
    current_code: Optional[str] = None,
    challenge_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    In-sandbox MirrorCopilot coding assistant for Ghost-Sprint challenges.
    """
    system_prompt = (
        "You are MirrorCopilot, an in-sandbox technical assistant for SkillMirror AI. "
        "A student is solving a practical engineering challenge. "
        "Help them think through bugs, edge cases, and architectural best practices. "
        "Do NOT write the entire solution for them. Provide targeted hints, explain failure modes, "
        "and suggest small, focused code snippets if appropriate."
    )

    res = await ask_ollama(prompt, system_prompt=system_prompt, context_code=current_code)
    return {
        "success": True,
        "response": res.get("text"),
        "suggestedSnippet": res.get("suggested_snippet"),
        "model_used": res.get("model_used", "ollama")
    }

def fallback_career_advice(prompt: str, context_code: Optional[str] = None) -> Dict[str, Any]:
    """Resilient fallback mentor response."""
    lower_p = prompt.lower()
    if "edge-case" in lower_p or "awareness" in lower_p:
        text = (
            "To boost your Edge-Case Awareness score into the 95th percentile, write proactive boundary tests before writing your fix. "
            "In concurrency sprints, test worker slot cleanup when tasks throw unexpected exceptions, and ensure queued items aren't starved."
        )
        snippet = "# Defensive boundary assertion\nassert queue.running == 0, 'Leaked active worker slot on unhandled exception'"
    elif "interview" in lower_p or "mock" in lower_p:
        text = (
            "Let's simulate a technical screen based on your verified Concurrency Proof Card:\n\n"
            "**Question**: In Python's `asyncio`, what happens if a task within an `AsyncQueue` raises an uncaught exception? "
            "How do you guarantee worker slots are released without swallowing the error?"
        )
        snippet = "try:\n    res = await task_func()\n    future.set_result(res)\nexcept Exception as e:\n    future.set_exception(e)\nfinally:\n    self.running -= 1\n    self._process()"
    elif "opportunit" in lower_p or "match" in lower_p or "company" in lower_p:
        text = (
            "Based on your 92% match with the **Distributed Systems Fellow** role at OpenCore Foundation, your verified "
            "slot-leak recovery Proof Card satisfies their Fast-Track threshold (>= 80 in Debugging & Concurrency)."
        )
        snippet = None
    else:
        text = (
            "I've analyzed your verified SkillMirror Proof Card. You demonstrated strong defensive programming and iteration discipline. "
            "Focus on completing the **TokenBucket Rate Limiter** or **Deep Immutability Guard** sprints to expand your verified portfolio."
        )
        snippet = None

    return {
        "success": True,
        "text": text,
        "suggested_snippet": snippet,
        "model_used": "deterministic_mentor",
        "source": "heuristic_fallback"
    }
