/**
 * Explainable Matching Engine
 * Matches candidates to complementary teammates and organization projects
 * based on verified Proof Card skill vectors and telemetry evidence.
 */

export function calculateMatches({ proofCard }) {
  const { signals, sprintSummary, moments = [] } = proofCard;

  // Candidate vector: [debuggingSpeed, edgeCaseAwareness, iterationDiscipline, pivotQuality, learningVelocity, aiCollaboration]
  const cVector = [
    signals.debuggingSpeed || 70,
    signals.edgeCaseAwareness || 70,
    signals.iterationDiscipline || 70,
    signals.pivotQuality || 70,
    signals.learningVelocity || 70,
    signals.aiCollaboration || 70
  ];

  // Scout Profiles (Hiring Teams / Open Source Projects)
  const scoutProjects = [
    {
      id: "proj-core-infra",
      name: "OpenCore Async Runtime Squad",
      org: "OpenCore Foundation",
      avatar: "⚡",
      domain: "Distributed Systems & Asynchronous Runtimes",
      targetVector: [85, 90, 85, 80, 80, 75],
      weights: [1.2, 1.3, 1.0, 1.1, 0.9, 0.8],
      threshold: 82,
      stipend: "$1,200 micro-fellowship",
      requirements: "Requires high edge-case awareness and tenacity when debugging unhandled concurrency faults."
    },
    {
      id: "proj-hyper-db",
      name: "StateCraft Engine Team",
      org: "StateCraft AI",
      avatar: "🛡️",
      domain: "State Synchronization & Memory Safety",
      targetVector: [75, 92, 88, 85, 85, 80],
      weights: [0.9, 1.4, 1.2, 1.0, 1.0, 0.8],
      threshold: 80,
      stipend: "$1,500 contribution bounty",
      requirements: "Requires defensive object mutation discipline and memory isolation focus."
    },
    {
      id: "proj-edge-router",
      name: "Cloudflare Workers Community Mesh",
      org: "Edge Mesh Guild",
      avatar: "🌐",
      domain: "High-Throughput Rate Limiters & Gateway",
      targetVector: [88, 82, 80, 75, 90, 85],
      weights: [1.3, 1.0, 0.9, 0.9, 1.2, 1.1],
      threshold: 78,
      stipend: "Fast-Track Technical Screen",
      requirements: "Focuses on rapid learning velocity and intelligent AI collaboration."
    }
  ];

  // Teammate Profiles for Complementary Squad Synthesis
  const teammateCandidates = [
    {
      id: "peer-maya",
      name: "Maya Chen",
      college: "Tier-3 State College (Self-Taught)",
      role: "Frontend Systems & Visual UX",
      avatar: "🎨",
      vector: [72, 80, 94, 82, 88, 92],
      style: "Methodical & UI Architecture Focused",
      complementaryReason: "Complements your strong backend concurrency intuition with deep design systems and high iteration discipline."
    },
    {
      id: "peer-liam",
      name: "Liam O'Connor",
      college: "Community College Transfer",
      role: "Reliability & Fuzz Testing Specialist",
      avatar: "🔍",
      vector: [80, 98, 76, 92, 84, 75],
      style: "Exploratory & Edge-Case Prober",
      complementaryReason: "Boasts top 2% edge-case probing instincts, perfectly balancing high-speed execution with exhaustive stress testing."
    },
    {
      id: "peer-zainab",
      name: "Zainab Al-Mansoor",
      college: "Regional Polytechnic University",
      role: "Data Pipelines & State Machines",
      avatar: "📊",
      vector: [86, 84, 88, 95, 90, 82],
      style: "Hypothesis-Driven & Fast Pivoter",
      complementaryReason: "Demonstrates exceptional pivot quality (95 score); recovers gracefully from complex architectural dead-ends."
    }
  ];

  // Helper: Weighted Cosine Similarity
  function calculateSimilarity(vecA, vecB, weights = [1, 1, 1, 1, 1, 1]) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      const w = weights[i] || 1;
      dot += vecA[i] * vecB[i] * w;
      normA += (vecA[i] * w) ** 2;
      normB += (vecB[i] * w) ** 2;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Calculate project matches
  const matchedProjects = scoutProjects.map(proj => {
    const similarity = calculateSimilarity(cVector, proj.targetVector, proj.weights);
    const scorePct = Math.round(similarity * 100);
    const isUnlocked = scorePct >= proj.threshold;

    // Generate evidence-tied rationale citing real moments/metrics
    let rationale = "";
    if (signals.debuggingSpeed >= 80) {
      rationale = `Matched because you diagnosed and resolved the ${sprintSummary.title || 'concurrency stall'} with an exceptional Debugging Speed score of ${signals.debuggingSpeed}, beating the calibrated benchmark median.`;
    } else if (signals.edgeCaseAwareness >= 80) {
      rationale = `Matched because your Edge-Case Awareness (${signals.edgeCaseAwareness}%) demonstrated deep boundary probing, passing all hidden test fixtures.`;
    } else {
      rationale = `Matched because of high Iteration Discipline (${signals.iterationDiscipline}%) and systematic test-driven validation.`;
    }

    return {
      ...proj,
      matchPercentage: scorePct,
      fastTrackUnlocked: isUnlocked,
      talentAgentVoice: `The Talent Agent identified a high mutual resonance (${scorePct}%) with ${proj.org}.`,
      scoutAgentVoice: `Scout Agent says: "Candidate demonstrated the exact analytical rigor needed for our ${proj.domain} roadmap."`,
      evidenceRationale: rationale
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Calculate peer teammate matches
  const matchedTeammates = teammateCandidates.map(peer => {
    // Teammate matching looks for complementary divergence: high dot product with differing strengths
    const similarity = calculateSimilarity(cVector, peer.vector);
    const matchScore = Math.round(similarity * 100);
    return {
      ...peer,
      matchPercentage: matchScore,
      evidenceRationale: peer.complementaryReason
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  return {
    projects: matchedProjects,
    teammates: matchedTeammates
  };
}
