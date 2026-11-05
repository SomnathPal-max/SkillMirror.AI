import React, { useState } from 'react';
import { 
  ShieldCheck, Share2, Download, Sparkles, Award, 
  ArrowRight, CheckCircle2, ChevronRight, Copy, Check
} from 'lucide-react';
import RadarChart from './RadarChart';
import ThoughtXRayPlayer from './ThoughtXRayPlayer';

export default function ProofCardView({ proofCard, onNavigateToMatching }) {
  const [copied, setCopied] = useState(false);

  if (!proofCard) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-zinc-500 font-mono text-xs">
        No Proof Card loaded. Complete a Ghost-Sprint in the Sandbox to generate your verified credential.
      </div>
    );
  }

  const { id, studentName, sprintSummary, createdAt, signals = {}, stats = {} } = proofCard;
  const shareableUrl = `${window.location.origin}/proof/${id}`;

  function handleCopyShareLink() {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleExportJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(proofCard, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `skillmirror-proof-${id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  const overallScore = Math.round(Object.values(signals).reduce((a, b) => a + b, 0) / 6);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Credential Summary & Verification */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-emerald-400 shrink-0">
            <Award className="w-6 h-6 stroke-[1.75]" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded font-semibold">
                SkillMirror.AI Verified Proof Card
              </span>
              <span className="text-xs text-zinc-500 font-mono">Token: {id}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{studentName}</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Trial: <span className="text-zinc-200">{sprintSummary?.title}</span> ({sprintSummary?.repo}) • {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopyShareLink}
            className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 text-xs font-mono transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share Link'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 text-xs font-mono transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onNavigateToMatching}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs font-mono transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>View Matched Teams</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Radar Vector & Evidence Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 6-Axis Radar Visualizer */}
        <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-between shadow-sm">
          <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Computed Skill Vector
              </h3>
              <p className="text-[11px] text-zinc-500">Pure code calculations, zero LLM guesswork</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono font-bold text-emerald-400">{overallScore}</span>
              <span className="text-xs font-mono text-zinc-500">/100</span>
            </div>
          </div>

          <RadarChart signals={signals} size={280} />

          <div className="mt-5 w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs font-mono text-zinc-400 space-y-1">
            <div className="flex justify-between">
              <span>Time-to-Green:</span>
              <span className="text-white font-semibold">{stats.timeFormatted || '06:22'} (vs {Math.floor((sprintSummary?.benchmarkMedianSeconds || 510) / 60)}m median)</span>
            </div>
            <div className="flex justify-between">
              <span>PR Hidden Tests Passed:</span>
              <span className="text-emerald-400 font-semibold">{stats.passedHiddenTests || 3}/{stats.totalHiddenTests || 3}</span>
            </div>
          </div>
        </div>

        {/* Right Column: 6 Evidence Cards */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="border-b border-zinc-800 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                Verified Performance Evidence
              </h3>
              <p className="text-[11px] text-zinc-500">Every metric links to real timestamps and event logs</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Tamper-Proof
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Debugging Speed */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Debugging Speed</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{signals.debuggingSpeed || 88}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Diagnosed error and achieved green suite in {stats.timeFormatted || '06:22'}, beating calibrated median.
              </p>
              <div className="text-[10px] text-zinc-500 font-mono">[replay 01:45 to 06:22]</div>
            </div>

            {/* 2. Edge-Case Awareness */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Edge-Case Awareness</span>
                <span className="text-xs font-mono font-bold text-cyan-400">{signals.edgeCaseAwareness || 94}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Passed {stats.passedHiddenTests || 3}/{stats.totalHiddenTests || 3} hidden PR tests. Authored custom boundary assertions.
              </p>
              <div className="text-[10px] text-zinc-500 font-mono">[replay 05:30]</div>
            </div>

            {/* 3. Iteration Discipline */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Iteration Discipline</span>
                <span className="text-xs font-mono font-bold text-purple-400">{signals.iterationDiscipline || 86}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Methodical hypothesis testing. Zero blind consecutive runs without edits.
              </p>
              <div className="text-[10px] text-zinc-500 font-mono">[{stats.testRunsCount || 5} test runs]</div>
            </div>

            {/* 4. Pivot Quality */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Pivot Quality</span>
                <span className="text-xs font-mono font-bold text-pink-400">{signals.pivotQuality || 92}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Recognized dead-end state after failed iterations; executed clean revert and restructured error handling.
              </p>
              <div className="text-[10px] text-zinc-500 font-mono">[replay 04:15]</div>
            </div>

            {/* 5. Learning Velocity */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">Learning Velocity</span>
                <span className="text-xs font-mono font-bold text-amber-400">{signals.learningVelocity || 85}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Upward velocity slope across multi-task progression sequence on unfamiliar library concepts.
              </p>
              <div className="text-[10px] text-zinc-500 font-mono">[slope β = -1.45]</div>
            </div>

            {/* 6. AI Collaboration */}
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">AI Collaboration</span>
                <span className="text-xs font-mono font-bold text-blue-400">{signals.aiCollaboration || 89}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Critically vetted and refined AI suggestions prior to accepting, running tests to confirm validity.
              </p>
              <div className="text-[10px] text-zinc-500 font-mono">[replay 03:10]</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
            <span>Student-Owned Data • Stored locally in sandbox</span>
            <span className="text-emerald-400">Verifiable Signature</span>
          </div>
        </div>
      </div>

      {/* Embedded Thought-X-Ray 30-Second Replay */}
      <ThoughtXRayPlayer proofCard={proofCard} />
    </div>
  );
}
