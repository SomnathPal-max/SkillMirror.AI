import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings

# Import API Routers
from app.api.auth import router as auth_router
from app.api.students import router as students_router
from app.api.challenges import router as challenges_router
from app.api.proof_cards import router as proof_cards_router
from app.api.opportunities import router as opportunities_router
from app.api.matching import router as matching_router
from app.api.teams import router as teams_router
from app.api.ai import router as ai_router
from app.api.admin import router as admin_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SkillMirror AI — Full-Stack AI Talent Discovery, Skill Assessment, Proof-of-Work, and Opportunity Matching Platform."
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(students_router, prefix=settings.API_PREFIX)
app.include_router(challenges_router, prefix=settings.API_PREFIX)
app.include_router(proof_cards_router, prefix=settings.API_PREFIX)
app.include_router(opportunities_router, prefix=settings.API_PREFIX)
app.include_router(matching_router, prefix=settings.API_PREFIX)
app.include_router(teams_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)
app.include_router(admin_router, prefix=settings.API_PREFIX)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SkillMirror AI Engine",
        "version": settings.VERSION,
        "mode": "deterministic_scoring_active"
    }

# Serve Frontend static assets if available
dist_dir = os.path.join(os.path.dirname(__file__), "..", "client", "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/"):
            return {"error": "Not found"}
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Client not built yet"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
