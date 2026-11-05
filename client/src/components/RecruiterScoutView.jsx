import React, { useState, useEffect } from 'react';
import { UserCheck, Eye, Filter, CheckCircle2, GitPullRequest, Search, ArrowRight } from 'lucide-react';
import RadarChart from './RadarChart';
import SprintIngestor from './SprintIngestor';

export default function RecruiterScoutView({ onInspectCandidate }) {
  const [activeSubTab, setActiveSubTab] = useState('candidates'); // 'candidates' | 'ingestor'
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minSpeed, setMinSpeed] = useState(70);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [invited, setInvited] = useState({});

  useEffect(() => {
    fetch('/api/scout/candidates')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.candidates) {
          setCandidates(data.candidates);
          if (data.candidates.length > 0) {
            setSelectedCandidate(data.candidates[0]);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  function handleInvite(id) {
    setInvited(prev => ({ ...prev, [id]: true }));
  }

  const filtered = candidates.filter(c => 
    (c.signals?.debuggingSpeed || 0) >= minSpeed
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Sub-Navigation */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
            Recruiter & Maintainer Portal
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Evaluate Demonstrated Engineering Ability</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Inspect candidates based strictly on how they think, diagnose errors, and handle edge cases on real work.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('candidates')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeSubTab === 'candidates' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Verified Talent Pool
          </button>
          <button
            onClick={() => setActiveSubTab('ingestor')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
              activeSubTab === 'ingestor' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>PR Ingestor</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'ingestor' ? (
        <SprintIngestor />
      ) : (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300">Min. Debugging Speed:</span>
              <span className="font-bold text-emerald-400">{minSpeed}</span>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={minSpeed}
                onChange={(e) => setMinSpeed(Number(e.target.value))}
                className="w-32 accent-emerald-500 cursor-pointer"
              />
            </div>

            <span className="text-zinc-500">
              {filtered.length} candidates match threshold
            </span>
          </div>

          {/* Main Grid: Candidate List + Active Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Candidate List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                Candidate Profiles
              </div>

              {filtered.map((c) => {
                const isSelected = selectedCandidate?.id === c.id;
                const isInvited = invited[c.id];
                const avgScore = Math.round(Object.values(c.signals || {}).reduce((a, b) => a + b, 0) / 6);

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900 border-emerald-500/60 shadow-sm'
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white">{c.studentName}</h4>
                        <p className="text-[11px] text-zinc-500 font-mono">{c.sprintSummary?.repo}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                          {avgScore} Index
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono mb-2">
                      <div className="bg-zinc-950 p-1 rounded border border-zinc-800/60">
                        <span className="text-zinc-500">Speed:</span> <span className="text-white font-bold">{c.signals?.debuggingSpeed}</span>
                      </div>
                      <div className="bg-zinc-950 p-1 rounded border border-zinc-800/60">
                        <span className="text-zinc-500">Edge:</span> <span className="text-white font-bold">{c.signals?.edgeCaseAwareness}</span>
                      </div>
                      <div className="bg-zinc-950 p-1 rounded border border-zinc-800/60">
                        <span className="text-zinc-500">Pivot:</span> <span className="text-white font-bold">{c.signals?.pivotQuality}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-zinc-500 font-mono">Time: {c.stats?.timeFormatted || '06:22'}</span>
                      {isInvited ? (
                        <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Invitation Queued
                        </span>
                      ) : (
                        <span className="text-zinc-400 hover:text-white font-mono text-[10px] flex items-center gap-1">
                          Inspect Replay <Eye className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Candidate Detail */}
            <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
              {selectedCandidate ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded font-semibold">
                          Verified Candidate
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">ID: {selectedCandidate.id}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{selectedCandidate.studentName}</h3>
                      <p className="text-xs text-zinc-400">
                        Trial: {selectedCandidate.sprintSummary?.title}
                      </p>
                    </div>

                    <button
                      onClick={() => handleInvite(selectedCandidate.id)}
                      disabled={invited[selectedCandidate.id]}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 ${
                        invited[selectedCandidate.id]
                          ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-sm'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{invited[selectedCandidate.id] ? 'Screen Invitation Sent' : 'Fast-Track Technical Screen'}</span>
                    </button>
                  </div>

                  {/* Radar */}
                  <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col items-center">
                    <RadarChart signals={selectedCandidate.signals} size={260} />
                  </div>

                  {/* Narrative Highlights */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
                      Thought-X-Ray Observations
                    </h4>

                    <div className="space-y-1.5 font-mono text-xs">
                      {(selectedCandidate.thoughtXRay?.narrative || []).map((n, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex gap-2">
                          <span className="text-emerald-400 font-semibold shrink-0">[{n.time}]</span>
                          <span className="text-zinc-300 leading-snug">{n.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onInspectCandidate(selectedCandidate)}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Inspect Full Replay Player</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-16 text-center text-zinc-500 font-mono text-xs">
                  Select a candidate from the left panel to inspect their proof card.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
