# SkillMirror AI Production Multi-Stage Dockerfile
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Python FastAPI Runner
FROM python:3.11-slim AS runner
WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY app/ ./app
COPY supabase/ ./supabase

# Copy compiled frontend from Stage 1
COPY --from=frontend-builder /app/client/dist ./client/dist

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
