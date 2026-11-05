# SkillMirror AI — Discover Your Talent. Prove Your Skills. Unlock Your Future.

> A complete, production-grade full-stack platform designed to close the **Talent–Opportunity Gap**. Instead of filtering by college brand or traditional resumes, SkillMirror AI lets students prove their skills through 5–10 minute real-world **Ghost-Sprints**, generates tamper-evident, evidence-backed **Proof Cards**, reconstructs cognitive problem-solving via **Thought-X-Ray™**, and unlocks explainable **Opportunity Matches** and **Squad Synthesis**.

---

## ⚡ Highlights

- **Ghost-Sprints (Real Work, Not Synthetic Puzzles)**: Production tasks sourced from open-source repositories and partner orgs (Python & JavaScript). Evaluated with fail-to-pass hidden test harnesses and async timeout protection.
- **Deterministic Signal Engine**: 8 comprehensive skill signals computed purely via deterministic mathematical formulas (`problem_solving`, `debugging`, `logical_reasoning`, `edge_case_awareness`, `iteration_discipline`, `pivot_quality`, `learning_velocity`, `ai_collaboration`). **Zero LLM score fabrication.**
- **Thought-X-Ray™ Replay**: Interactive solution scrubber and playback timeline mapping cognitive phases (`READ`, `HYPOTHESIZE`, `EDIT`, `TEST`, `PIVOT`, `RESOLVE`) with event-ID citations (`[ev-101]`).
- **AI Career Assistant & Mentor**: Built with Google Gemini API (`gemini-2.5-flash`), with resilient local fallback for instant career guidance, code analysis, and solution narration.
- **Explainable Matching**: Algorithmic compatibility scoring for companies and complementary teammates (Squad Synthesizer), featuring transparent matching evidence and Fast-Track interview unlocks.
- **Unified Full-Stack Architecture**: Python FastAPI backend with Pydantic validation, Supabase PostgreSQL schema with Row-Level Security (RLS) and local in-memory fallback store, paired with a React.js (Vite, Tailwind CSS, Recharts) light-theme dashboard.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts (Radar, Velocity Line, Compatibility Charts), Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | Supabase PostgreSQL, 15 tables with RLS + In-Memory Fallback store |
| **AI Integration** | Google Gemini API with smart offline heuristic narration |
| **Code Execution** | Async Python test runner with sandbox timeouts & stdout/stderr interception |

---

## 🚀 Running Locally

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### 2. Install Dependencies & Build
```bash
# Install Python backend dependencies
pip install -r requirements.txt

# Install frontend dependencies and build
cd client
npm install
npm run build
cd ..
```

### 3. Start Full-Stack Server
```bash
# Starts unified FastAPI server serving both API and compiled React SPA
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Visit: **`http://localhost:8000`**

---

## 🧪 Automated Test Suite

Run the full engine test suite (code evaluator, deterministic scoring, Thought-X-Ray citations, explainable matcher):

```bash
python -m unittest tests/test_engine.py
```

All 4 test suites execute with 100% pass rate.

---

## 🚢 Deployment Guide

### Deploy to Render
1. Connect your repository to [Render](https://render.com).
2. Use the included `render.yaml` or create a Web Service:
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt && cd client && npm install && npm run build && cd ..`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - **Health Check Path**: `/api/health`

### Deploy with Docker
```bash
# Build multi-stage Docker container
docker build -t skillmirror-ai .

# Run container
docker run -p 8000:8000 skillmirror-ai
```

---

## 🔑 Demo Access (One-Click In UI)

The login dialog provides instant 1-click test credentials:
- **Demo Student**: `alex@student.edu` (Pre-seeded with Alex Rivera's verified Proof Cards and radar charts)
- **Demo Organization**: `talent@opencore.io` (OpenCore Foundation recruiter portal with applicants)
- **Demo Admin**: `admin@skillmirror.ai` (Platform oversight and organization verification)

---

## 📄 License
MIT License. Created for the SkillMirror AI Platform.
