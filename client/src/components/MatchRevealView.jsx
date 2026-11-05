import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Building2, CheckCircle2, Award, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function MatchRevealView({ proofCard }) {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!proofCard) return;

    fetch('/api/matching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proofCard })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setMatches(data.matches);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [proofCard]);

  if (!proofCard) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-zinc-500 font-mono text-xs">
        No Proof Card loaded. Complete a Ghost-Sprint in the Sandbox to reveal explainable matches.
      </div>
    );
  }

  if (loading || !matches) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-500 font-mono text-xs">Computing explainable evidence alignments...</span>
        </div>
      </div>
    );
  }

  const { projects = [], teammates = [] } = matches;
  const hasFastTrack = projects.some(p => p.fastTrackUnlocked);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Fast-Track Review Banner */}
      {hasFastTrack && (
        <div className="bg-zinc-900 border border-emerald-500/40 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0 font-bold font-mono text-sm">
              FT
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded font-bold">
                  Fast-Track Review Unlocked
                </span>
                <span className="text-xs text-zinc-400 font-mono">Benchmark Exceeded</span>
              </div>
              <h3 className="text-base font-semibold text-white">Direct Engineering Screen Queued</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Your debugging speed and hidden edge-case awareness beat the calibrated median. You skip automated screening directly to an engineering lead conversation.
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-medium flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
          Explainable Matching Engine
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Aligned Teams & Complementary Squads</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Every match carries a transparent rationale backed directly by your Proof Card telemetry.
        </p>
      </div>

      {/* Section 1: Hiring Organizations & Open-Source Projects */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Matched Projects & Organizations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className={`bg-zinc-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                proj.fastTrackUnlocked 
                  ? 'border-emerald-500/30 hover:border-emerald-500/50' 
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-tight">{proj.name}</h4>
                    <span className="text-[11px] text-zinc-500 font-mono">{proj.org}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono font-bold text-emerald-400">{proj.matchPercentage}%</span>
                    <span className="text-[10px] text-zinc-500 font-mono block">Resonance</span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                    {proj.domain}
                  </span>
                </div>

                {/* Evidence Quote */}
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 mb-3 space-y-1">
                  <div className="text-[10px] font-mono text-emerald-400 font-medium">Why Matched:</div>
                  <p className="text-xs text-zinc-300 leading-snug">
                    "{proj.evidenceRationale}"
                  </p>
                </div>

                <div className="text-[11px] text-zinc-500 italic mb-2">
                  {proj.scoutAgentVoice}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-300 font-medium">
                  {proj.stipend}
                </span>

                <button className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs font-mono rounded-md transition flex items-center gap-1">
                  <span>Connect</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Complementary Squad Teammates */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Complementary Teammates (Squad Synthesizer)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {teammates.map((peer) => (
            <div
              key={peer.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{peer.name}</h4>
                    <p className="text-[11px] text-zinc-500">{peer.college}</p>
                  </div>
                  <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-800/60 px-2 py-0.5 rounded">
                    {peer.matchPercentage}% Synergy
                  </span>
                </div>

                <div className="mb-2.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-zinc-800">
                    {peer.role}
                  </span>
                </div>

                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 mb-3 space-y-1">
                  <div className="text-[10px] font-mono text-cyan-400 font-medium">Skill Complement:</div>
                  <p className="text-xs text-zinc-300 leading-snug">
                    {peer.evidenceRationale}
                  </p>
                </div>

                <div className="text-[11px] text-zinc-500 font-mono">
                  Style: <span className="text-zinc-300">{peer.style}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end">
                <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md text-xs font-mono transition">
                  Invite to Hackathon Squad
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
