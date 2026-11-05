import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runInSandbox } from './execution/sandboxRunner.js';
import { computeSignals } from './telemetry/signalEngine.js';
import { generateThoughtXRay } from './telemetry/thoughtXRay.js';
import { calculateMatches } from './matching/explainableMatcher.js';
import { ingestGitHubIssueOrPR } from './github/ingestor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint for cloud platforms (Render, Railway, Fly.io, Cloud Run)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '2.4.0'
  });
});

// In-memory + file persistence for sprints, sessions, proofs
const sprintsPath = path.join(__dirname, 'data', 'sprints.json');
let sprints = JSON.parse(fs.readFileSync(sprintsPath, 'utf8'));

// Store active telemetry sessions: sessionId -> { sprintId, events: [], startTime }
const telemetrySessions = new Map();

// Store generated Proof Cards: proofId -> proofCard
const proofCards = new Map();

// Seed initial demo proof card for instant viewing / recruiter review
const demoProofId = 'proof-sample-talent-01';
proofCards.set(demoProofId, {
  id: demoProofId,
  studentName: "Alex Rivera",
  sprintId: "sprint-async-queue",
  sprintSummary: {
    title: "Fix Unhandled Promise Rejection Stall in AsyncQueue",
    repo: "open-core/async-flow",
    difficulty: "Intermediate",
    benchmarkMedianSeconds: 510
  },
  createdAt: new Date().toISOString(),
  signals: {
    debuggingSpeed: 88,
    edgeCaseAwareness: 94,
    iterationDiscipline: 86,
    pivotQuality: 92,
    learningVelocity: 85,
    aiCollaboration: 89
  },
  stats: {
    solveDurationMs: 382000,
    timeFormatted: "06:22",
    testRunsCount: 5,
    customTestsCount: 2,
    aiPromptsCount: 2,
    revertsCount: 1,
    passedHiddenTests: 3,
    totalHiddenTests: 3
  },
  thoughtXRay: {
    totalDurationFormatted: "06:22",
    phases: [
      { name: 'Read & Contextualize', startPercent: 0, endPercent: 18, color: '#38bdf8' },
      { name: 'Hypothesize & Diagnostic', startPercent: 18, endPercent: 38, color: '#a855f7' },
      { name: 'Iterative Implementation', startPercent: 38, endPercent: 64, color: '#f59e0b' },
      { name: 'Pivot & Refactor', startPercent: 64, endPercent: 82, color: '#ec4899' },
      { name: 'Edge Case Hardening', startPercent: 82, endPercent: 100, color: '#10b981' }
    ],
    moments: [
      { id: 'ev-102', timeStr: '01:45', title: 'First Diagnostic Run', type: 'test_fail', description: 'Encountered promise rejection stall: queue hung after item 2 crashed.' },
      { id: 'ev-118', timeStr: '03:10', title: 'AI Assistant Consultation', type: 'ai_critique', description: 'Queried AI regarding finally() semantics, vetted the output, and adapted error decoupling.' },
      { id: 'ev-129', timeStr: '04:15', title: 'Strategic Revert & Pivot', type: 'pivot', description: 'Reverted nested try/catch patch after recognizing persistent state desync.' },
      { id: 'ev-142', timeStr: '05:30', title: 'Boundary Probing', type: 'custom_test', description: 'Created custom test checking 10 rapid concurrent rejections.' },
      { id: 'ev-155', timeStr: '06:22', title: 'All Tests Green', type: 'all_pass', description: 'All 2 public and 3 hidden edge-case tests passed cleanly.' }
    ],
    narrative: [
      { eventId: 'ev-101', time: '00:15', phase: 'READ', text: 'Inspected queue concurrency architecture and baseline unit test failure.' },
      { eventId: 'ev-102', time: '01:45', phase: 'HYPOTHESIZE', text: 'First diagnostic run isolated the stalled concurrency slot on worker rejection.' },
      { eventId: 'ev-118', time: '03:10', phase: 'AI_COLLABORATION', text: 'Consulted in-sandbox AI; revised the suggested snippet to prevent duplicate dequeue.' },
      { eventId: 'ev-129', time: '04:15', phase: 'PIVOT', text: 'Identified anti-pattern in first attempt; executed clean pivot to a unified finally block.' },
      { eventId: 'ev-142', time: '05:30', phase: 'VERIFY', text: 'Authored custom boundary tests to confirm rapid burst recovery.' },
      { eventId: 'ev-155', time: '06:22', phase: 'RESOLVE', text: 'Successfully passed all hidden test fixtures in 6m 22s (calibrated median: 8m 30s).' }
    ]
  }
});

// 1. GET ALL SPRINTS
app.get('/api/sprints', (req, res) => {
  const publicSprints = sprints.map(s => ({
    id: s.id,
    title: s.title,
    organization: s.organization,
    repo: s.repo,
    difficulty: s.difficulty,
    calibratedMedianSeconds: s.calibratedMedianSeconds,
    description: s.description,
    publicTestsCount: (s.publicTests || []).length,
    hiddenTestsCount: (s.hiddenTests || []).length
  }));
  res.json({ success: true, sprints: publicSprints });
});

// 2. GET SINGLE SPRINT
app.get('/api/sprints/:id', (req, res) => {
  const sprint = sprints.find(s => s.id === req.params.id);
  if (!sprint) {
    return res.status(404).json({ success: false, error: 'Sprint not found' });
  }

  // Hide the exact hidden test assertion code from client inspect, but provide names
  const clientSprint = {
    ...sprint,
    hiddenTests: (sprint.hiddenTests || []).map(h => ({
      id: h.id,
      name: h.name,
      isHidden: true
    }))
  };

  res.json({ success: true, sprint: clientSprint });
});

// 3. EXECUTE CODE IN SECURE SANDBOX
app.post('/api/sandbox/run', async (req, res) => {
  try {
    const { sprintId, code, customTests = [], includeHidden = true, sessionId } = req.body;
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) {
      return res.status(404).json({ success: false, error: 'Sprint not found' });
    }

    const runResult = await runInSandbox({
      code,
      sprint,
      customTests,
      includeHidden
    });

    // If active session, automatically log test_run event
    if (sessionId && telemetrySessions.has(sessionId)) {
      const session = telemetrySessions.get(sessionId);
      session.events.push({
        id: `ev-${Date.now().toString().slice(-4)}`,
        timestamp: Date.now(),
        type: 'test_run',
        payload: {
          passed: runResult.passed,
          passedCount: runResult.passedCount,
          failedCount: runResult.failedCount,
          tests: runResult.tests.map(t => ({ id: t.id, name: t.name, passed: t.passed, isHidden: t.isHidden }))
        }
      });
    }

    res.json({ success: true, results: runResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. TELEMETRY: LOG EVENT
app.post('/api/telemetry/event', (req, res) => {
  const { sessionId, sprintId, event } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Missing sessionId' });
  }

  if (!telemetrySessions.has(sessionId)) {
    telemetrySessions.set(sessionId, {
      sessionId,
      sprintId,
      startTime: Date.now(),
      events: []
    });
  }

  const session = telemetrySessions.get(sessionId);
  const newEvent = {
    id: `ev-${session.events.length + 100}`,
    timestamp: Date.now(),
    ...event
  };
  session.events.push(newEvent);

  res.json({ success: true, eventId: newEvent.id });
});

// 5. TELEMETRY: FINISH SPRINT & GENERATE PROOF CARD
app.post('/api/telemetry/finish', (req, res) => {
  try {
    const { sessionId, sprintId, studentName = 'Anonymous Candidate', clientEvents = [] } = req.body;
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) {
      return res.status(404).json({ success: false, error: 'Sprint not found' });
    }

    // Combine server-logged events with any batched client events
    const session = telemetrySessions.get(sessionId) || { events: [] };
    const allEvents = [...session.events, ...clientEvents];

    // Compute deterministic signals
    const { signals, meta } = computeSignals({ events: allEvents, sprint });

    // Generate Thought-X-Ray segmentation and narrative
    const thoughtXRay = generateThoughtXRay({ events: allEvents, signals, sprint });

    const proofId = `proof-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const proofCard = {
      id: proofId,
      studentName,
      sprintId,
      sprintSummary: {
        title: sprint.title,
        repo: sprint.repo,
        difficulty: sprint.difficulty,
        benchmarkMedianSeconds: sprint.calibratedMedianSeconds
      },
      createdAt: new Date().toISOString(),
      signals,
      stats: {
        solveDurationMs: meta.solveDurationMs,
        timeFormatted: thoughtXRay.totalDurationFormatted,
        testRunsCount: meta.testRunsCount,
        customTestsCount: meta.customTestsCount,
        aiPromptsCount: meta.aiPromptsCount,
        revertsCount: meta.revertsCount,
        learningSlope: meta.learningSlope,
        passedHiddenTests: meta.testRunsCount > 0 ? (sprint.hiddenTests || []).length : 0,
        totalHiddenTests: (sprint.hiddenTests || []).length
      },
      thoughtXRay
    };

    proofCards.set(proofId, proofCard);

    res.json({ success: true, proofCard });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GET PERSISTED PROOF CARD
app.get('/api/proofs/:id', (req, res) => {
  const proof = proofCards.get(req.params.id);
  if (!proof) {
    return res.status(404).json({ success: false, error: 'Proof Card not found' });
  }
  res.json({ success: true, proofCard: proof });
});

// 7. GET ALL CANDIDATE PROOF CARDS (For Scout / Recruiter View)
app.get('/api/scout/candidates', (req, res) => {
  const allProofs = Array.from(proofCards.values()).reverse();
  res.json({ success: true, candidates: allProofs });
});

// 8. EXPLAINABLE MATCHING REVEAL
app.post('/api/matching', (req, res) => {
  const { proofCard } = req.body;
  if (!proofCard || !proofCard.signals) {
    return res.status(400).json({ success: false, error: 'Valid proofCard required' });
  }

  const matches = calculateMatches({ proofCard });
  res.json({ success: true, matches });
});

// 9. GHOST-SPRINT GENERATOR / GITHUB INGESTION
app.post('/api/sprints/ingest', async (req, res) => {
  try {
    const { repoUrl, issueOrPrNumber } = req.body;
    const result = await ingestGitHubIssueOrPR({ repoUrl, issueOrPrNumber });

    // Optionally publish to sprints store
    if (req.body.publishImmediately && result.package) {
      sprints.push({
        id: result.package.id,
        title: result.package.title,
        organization: `GitHub PR #${result.package.prNumber}`,
        repo: result.package.repo,
        difficulty: result.package.verification.estimatedDifficulty,
        calibratedMedianSeconds: result.package.benchmarkMedianSec,
        description: result.package.summary,
        files: { 'solution.js': result.package.starterCode },
        publicTests: result.package.publicTests,
        hiddenTests: result.package.hiddenTests
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. IN-SANDBOX AI ASSISTANT (MirrorCopilot)
app.post('/api/ai/assist', (req, res) => {
  const { prompt, currentCode, sprintId } = req.body;
  const promptLower = (prompt || '').toLowerCase();

  let response = "";
  let suggestedSnippet = null;

  if (promptLower.includes('error') || promptLower.includes('catch') || promptLower.includes('reject') || promptLower.includes('stall')) {
    response = "When a worker task rejects, the promise chain in `_process()` triggers `.catch(err => item.reject(err))`. Notice that `this.running--` and the recursive `this._process()` call were only placed in the `.then()` handler! This means any error leaves the concurrency counter permanently incremented. To fix this cleanly, leverage `.finally(() => { this.running--; this._process(); })`.";
    suggestedSnippet = `.finally(() => {\n  this.running--;\n  this._process();\n});`;
  } else if (promptLower.includes('hint') || promptLower.includes('how to start')) {
    response = "Look closely at the lifecycle of a task in `_process()`. Count every path where `this.running` is incremented. Does every single completion path (success AND error) decrement it and trigger the next queued item?";
  } else if (promptLower.includes('test') || promptLower.includes('edge case')) {
    response = "Consider testing an edge case where 5 tasks in a row throw synchronously or reject immediately. Does the queue drain all pending items without hanging?";
    suggestedSnippet = `// Edge Case Test Candidate\nawait q.push(async () => { throw new Error('Rapid crash'); });`;
  } else {
    response = `Analyzing your current implementation... Ensure state mutations remain idempotent and all async branches resolve or reject gracefully.`;
  }

  res.json({
    success: true,
    response,
    suggestedSnippet,
    timestamp: Date.now()
  });
});

// SERVE STATIC CLIENT IN PRODUCTION
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[SkillMirror.AI Server] Listening on http://localhost:${PORT}`);
});
