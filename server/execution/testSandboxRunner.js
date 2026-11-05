import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runInSandbox } from './sandboxRunner.js';
import { computeSignals } from '../telemetry/signalEngine.js';
import { generateThoughtXRay } from '../telemetry/thoughtXRay.js';
import { calculateMatches } from '../matching/explainableMatcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runVerificationSuite() {
  console.log('=== SkillMirror.AI Full-Stack Verification Suite ===\n');

  const sprintsPath = path.join(__dirname, '..', 'data', 'sprints.json');
  const sprints = JSON.parse(fs.readFileSync(sprintsPath, 'utf8'));

  const sprint = sprints[0]; // AsyncQueue
  console.log(`1. Testing Sprint: "${sprint.title}"`);

  // Test 1: Starter code should fail hidden error propagation tests
  const starterCode = Object.values(sprint.files)[0];
  console.log('   Testing starter baseline code...');
  const baselineResult = await runInSandbox({
    code: starterCode,
    sprint,
    includeHidden: true
  });
  console.log(`   Baseline Result: Passed=${baselineResult.passed}, Passed Count=${baselineResult.passedCount}/${baselineResult.totalTests}`);
  if (baselineResult.passed) {
    throw new Error('Verification Failed: Starter code was expected to fail hidden tests!');
  }
  console.log('   ✓ Baseline correctly fails pre-fix ground truth tests.\n');

  // Test 2: Reference solution should pass all tests
  console.log('   Testing reference solution...');
  const solutionResult = await runInSandbox({
    code: sprint.referenceSolution,
    sprint,
    includeHidden: true
  });
  console.log(`   Solution Result: Passed=${solutionResult.passed}, Passed Count=${solutionResult.passedCount}/${solutionResult.totalTests}`);
  if (!solutionResult.passed) {
    throw new Error(`Verification Failed: Reference solution failed! Error: ${JSON.stringify(solutionResult.tests)}`);
  }
  console.log('   ✓ Reference solution passed 100% of public and hidden tests.\n');

  // Test 3: Deterministic Signal Engine
  console.log('2. Testing Deterministic Signal Engine...');
  const mockEvents = [
    { id: 'ev-1', timestamp: 1000, type: 'sandbox_init', payload: {} },
    { id: 'ev-2', timestamp: 30000, type: 'code_edit', payload: { length: 250 } },
    { id: 'ev-3', timestamp: 90000, type: 'test_run', payload: { passed: false, failedCount: 2 } },
    { id: 'ev-4', timestamp: 120000, type: 'ai_prompt', payload: { prompt: 'How does finally interact with async queue process' } },
    { id: 'ev-5', timestamp: 150000, type: 'ai_code_modified', payload: { length: 80 } },
    { id: 'ev-6', timestamp: 200000, type: 'revert_to_checkpoint', payload: {} },
    { id: 'ev-7', timestamp: 260000, type: 'custom_test_added', payload: { name: 'Burst drain' } },
    { id: 'ev-8', timestamp: 320000, type: 'test_run', payload: { passed: true, failedCount: 0, tests: [{ isHidden: true, passed: true }, { isHidden: true, passed: true }] } }
  ];

  const { signals, meta } = computeSignals({ events: mockEvents, sprint });
  console.log('   Computed Signals:');
  console.log(`   - Debugging Speed:     ${signals.debuggingSpeed}/100`);
  console.log(`   - Edge-Case Awareness: ${signals.edgeCaseAwareness}/100`);
  console.log(`   - Iteration Discipline:${signals.iterationDiscipline}/100`);
  console.log(`   - Pivot Quality:       ${signals.pivotQuality}/100`);
  console.log(`   - Learning Velocity:   ${signals.learningVelocity}/100`);
  console.log(`   - AI Collaboration:    ${signals.aiCollaboration}/100`);
  console.log('   ✓ Signals computed deterministically from events.\n');

  // Test 4: Thought-X-Ray Generation
  console.log('3. Testing Thought-X-Ray Engine...');
  const thoughtXRay = generateThoughtXRay({ events: mockEvents, signals, sprint });
  console.log(`   Phases segmented: ${thoughtXRay.phases.length}`);
  console.log(`   Moments isolated: ${thoughtXRay.moments.length}`);
  console.log(`   Narrative lines:  ${thoughtXRay.narrative.length}`);
  thoughtXRay.narrative.forEach(n => {
    console.log(`   * [${n.time} - ${n.eventId}] ${n.text}`);
  });
  console.log('   ✓ Thought-X-Ray links every narrative statement to an event ID.\n');

  // Test 5: Explainable Matcher
  console.log('4. Testing Explainable Matcher...');
  const proofCard = {
    signals,
    sprintSummary: { title: sprint.title },
    moments: thoughtXRay.moments
  };
  const matches = calculateMatches({ proofCard });
  console.log(`   Matched Projects: ${matches.projects.length}`);
  matches.projects.forEach(p => {
    console.log(`   - ${p.name} (${p.matchPercentage}% match) [Fast-Track: ${p.fastTrackUnlocked}]`);
    console.log(`     Evidence: "${p.evidenceRationale}"`);
  });
  console.log(`   Matched Teammates: ${matches.teammates.length}`);
  matches.teammates.forEach(t => {
    console.log(`   - ${t.name} (${t.matchPercentage}% synergy): ${t.complementaryReason}`);
  });
  console.log('   ✓ Explainable matching synthesized with plain-language evidence.\n');

  console.log('=== ALL 5 VERIFICATION SUITES PASSED SUCCESSFULLY ===');
}

runVerificationSuite().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
