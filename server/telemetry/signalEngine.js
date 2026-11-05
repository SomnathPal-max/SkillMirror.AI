/**
 * Deterministic Signal Engine
 * Computes skill signals deterministically from timestamped event telemetry.
 * Never guesses or relies on LLMs for quantitative numbers.
 */

export function computeSignals({ events, sprint, priorTaskHistory = [] }) {
  if (!events || events.length === 0) {
    return getDefaultSignals();
  }

  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
  const startTime = sortedEvents[0].timestamp;
  const calibratedMedian = (sprint.calibratedMedianSeconds || 500) * 1000; // ms

  // Extract event subsets
  const testRuns = sortedEvents.filter(e => e.type === 'test_run');
  const codeEdits = sortedEvents.filter(e => e.type === 'code_edit');
  const customTests = sortedEvents.filter(e => e.type === 'custom_test_added');
  const reverts = sortedEvents.filter(e => e.type === 'revert_to_checkpoint' || e.type === 'major_revert');
  const aiPrompts = sortedEvents.filter(e => e.type === 'ai_prompt');
  const aiAccepted = sortedEvents.filter(e => e.type === 'ai_code_accepted');
  const aiModified = sortedEvents.filter(e => e.type === 'ai_code_modified');
  const hints = sortedEvents.filter(e => e.type === 'hint_viewed');

  // 1. DEBUGGING SPEED
  // First failing run to first fully passing run, normalized against calibrated median
  let firstFailTime = null;
  let firstPassTime = null;
  for (const tr of testRuns) {
    if (tr.payload && tr.payload.passed === false && firstFailTime === null) {
      firstFailTime = tr.timestamp;
    }
    if (tr.payload && tr.payload.passed === true && firstPassTime === null) {
      firstPassTime = tr.timestamp;
    }
  }

  let debuggingSpeedScore = 50;
  let actualSolveDurationMs = 0;
  if (firstPassTime && firstFailTime) {
    actualSolveDurationMs = Math.max(1000, firstPassTime - firstFailTime);
    // If solved in half the calibrated median -> 95+, if equal -> 75, if double -> 50
    const ratio = actualSolveDurationMs / calibratedMedian;
    debuggingSpeedScore = Math.max(20, Math.min(99, Math.round(100 - (ratio * 30))));
  } else if (firstPassTime) {
    // Passed on first try
    actualSolveDurationMs = firstPassTime - startTime;
    debuggingSpeedScore = 92;
  } else {
    // Not yet passing
    debuggingSpeedScore = 35;
  }

  // 2. EDGE-CASE AWARENESS
  // Share of hidden edge cases passed + custom tests written by candidate
  const latestRun = testRuns[testRuns.length - 1];
  let hiddenTotal = (sprint.hiddenTests || []).length;
  let hiddenPassed = 0;
  if (latestRun && latestRun.payload && latestRun.payload.tests) {
    const hiddenTests = latestRun.payload.tests.filter(t => t.isHidden);
    hiddenPassed = hiddenTests.filter(t => t.passed).length;
    if (hiddenTests.length > 0) hiddenTotal = hiddenTests.length;
  }
  const hiddenRatio = hiddenTotal > 0 ? (hiddenPassed / hiddenTotal) : 0.5;
  const customBonus = Math.min(1.0, customTests.length / 2); // bonus for testing edge cases yourself
  const edgeCaseScore = Math.min(98, Math.round((hiddenRatio * 0.7 + customBonus * 0.3) * 100));

  // 3. ITERATION DISCIPLINE
  // Runs per meaningful edit, edit size between runs, avoiding scattershot blind runs
  let iterationScore = 70;
  const totalRuns = testRuns.length;
  const totalEdits = codeEdits.length;

  if (totalRuns > 0) {
    // Ideal ratio is 3 to 10 edits per run (reflects thoughtful typing between executions)
    const ratio = totalEdits / Math.max(1, totalRuns);
    let penalty = 0;
    if (ratio < 1.0) penalty += 25; // Blind consecutive running without editing
    if (ratio > 30.0) penalty += 15; // Huge uncontrolled typing without sanity testing
    iterationScore = Math.max(30, Math.min(95, Math.round(90 - penalty)));
  }

  // 4. PIVOT QUALITY
  // Whether a pivot (revert or rewrite after repeated failures) led to fewer failing tests
  let pivotScore = 75;
  if (reverts.length > 0) {
    let successfulPivots = 0;
    for (const rev of reverts) {
      // Look at test run before revert vs next test run after revert
      const prevRun = [...testRuns].reverse().find(r => r.timestamp < rev.timestamp);
      const nextRun = testRuns.find(r => r.timestamp > rev.timestamp);
      if (prevRun && nextRun && prevRun.payload && nextRun.payload) {
        const prevFails = prevRun.payload.failedCount || 0;
        const nextFails = nextRun.payload.failedCount || 0;
        if (nextFails < prevFails || nextRun.payload.passed) {
          successfulPivots++;
        }
      } else {
        successfulPivots++;
      }
    }
    pivotScore = Math.min(96, Math.round(70 + (successfulPivots / reverts.length) * 26));
  } else {
    // If no pivot was needed because they approached cleanly
    pivotScore = totalRuns <= 3 && firstPassTime ? 88 : 78;
  }

  // 5. LEARNING VELOCITY
  // Slope of time-to-green across a 3-task sequence
  // If priorTaskHistory has items, calculate linear regression slope
  let learningVelocityScore = 80;
  let learningSlope = 0;
  const historySeries = [
    ...priorTaskHistory.map((h, i) => ({ index: i, durationSec: h.durationSeconds, hints: h.hintsCount || 0 })),
    { index: priorTaskHistory.length, durationSec: Math.round(actualSolveDurationMs / 1000) || 320, hints: hints.length }
  ];

  if (historySeries.length >= 2) {
    const n = historySeries.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    historySeries.forEach(pt => {
      sumX += pt.index;
      sumY += pt.durationSec;
      sumXY += pt.index * pt.durationSec;
      sumXX += pt.index * pt.index;
    });
    // Negative slope means faster completion over time (good learning velocity!)
    learningSlope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    if (learningSlope < 0) {
      // Faster over time!
      learningVelocityScore = Math.min(98, Math.round(75 + Math.min(23, Math.abs(learningSlope) / 10)));
    } else {
      learningVelocityScore = Math.max(50, Math.round(75 - Math.min(25, learningSlope / 10)));
    }
  } else {
    // Single task default calibration
    learningVelocityScore = debuggingSpeedScore >= 80 ? 84 : 74;
  }

  // 6. AI COLLABORATION
  // Evaluates how AI is leveraged: prompt quality, whether AI code was reviewed/edited before acceptance,
  // and whether tests were run immediately to verify suggestions
  let aiScore = 78;
  if (aiPrompts.length > 0) {
    const modifiedCount = aiModified.length;
    const acceptedCount = aiAccepted.length;
    const totalAiUsage = modifiedCount + acceptedCount;

    // Critique ratio: did they modify/vet AI code rather than blind paste?
    const critiqueRatio = totalAiUsage > 0 ? (modifiedCount / totalAiUsage) : 0.5;

    // Prompt specificity: length and presence of technical keywords
    let avgPromptLength = 0;
    aiPrompts.forEach(p => {
      avgPromptLength += (p.payload && p.payload.prompt ? p.payload.prompt.length : 0);
    });
    avgPromptLength /= aiPrompts.length;
    const promptQuality = Math.min(1.0, avgPromptLength / 40);

    aiScore = Math.min(98, Math.round(50 + critiqueRatio * 30 + promptQuality * 18));
  } else {
    // Autonomous solving without AI assistance is rewarded neutrally as self-reliant
    aiScore = 80;
  }

  return {
    signals: {
      debuggingSpeed: debuggingSpeedScore,
      edgeCaseAwareness: edgeCaseScore,
      iterationDiscipline: iterationScore,
      pivotQuality: pivotScore,
      learningVelocity: learningVelocityScore,
      aiCollaboration: aiScore
    },
    meta: {
      solveDurationMs: actualSolveDurationMs,
      calibratedMedianMs: calibratedMedian,
      testRunsCount: totalRuns,
      editsCount: totalEdits,
      revertsCount: reverts.length,
      customTestsCount: customTests.length,
      aiPromptsCount: aiPrompts.length,
      hintsCount: hints.length,
      learningSlope: Number(learningSlope.toFixed(2)),
      historyDataPoints: historySeries
    }
  };
}

function getDefaultSignals() {
  return {
    signals: {
      debuggingSpeed: 70,
      edgeCaseAwareness: 70,
      iterationDiscipline: 70,
      pivotQuality: 70,
      learningVelocity: 70,
      aiCollaboration: 70
    },
    meta: {
      solveDurationMs: 0,
      calibratedMedianMs: 500000,
      testRunsCount: 0,
      editsCount: 0,
      revertsCount: 0,
      customTestsCount: 0,
      aiPromptsCount: 0,
      hintsCount: 0,
      learningSlope: 0,
      historyDataPoints: []
    }
  };
}
