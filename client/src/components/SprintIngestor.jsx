import React, { useState } from 'react';
import { GitPullRequest, CheckCircle2, AlertCircle, Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export default function SprintIngestor({ onSprintPublished }) {
  const [repoUrl, setRepoUrl] = useState('https://github.com/expressjs/express/pull/4820');
  const [loading, setLoading] = useState(false);
  const [ingestedSprint, setIngestedSprint] = useState(null);
  const [orgApproved, setOrgApproved] = useState(true);
  const [published, setPublished] = useState(false);

  const presets = [
    { label: 'Express.js (Async Error Propagation)', url: 'https://github.com/expressjs/express/pull/4820' },
    { label: 'Lodash (Prototype Pollution Guard)', url: 'https://github.com/lodash/lodash/pull/5129' },
    { label: 'Node.js Undici (HTTP/2 Stream Lock)', url: 'https://github.com/nodejs/undici/pull/1420' }
  ];

  async function handleIngest(urlToUse) {
    const targetUrl = urlToUse || repoUrl;
    if (!targetUrl.trim()) return;
    setLoading(true);
    setPublished(false);

    try {
      const res = await fetch('/api/sprints/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: targetUrl })
      });
      const data = await res.json();
      if (data.success && data.package) {
        setIngestedSprint(data.package);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!ingestedSprint) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sprints/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          publishImmediately: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setPublished(true);
        if (onSprintPublished) onSprintPublished(data.package);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700/80 px-2 py-0.5 rounded font-medium">
            Ghost-Sprint Ingestion Pipeline
          </span>
          <span className="text-xs text-zinc-500 font-mono">For Open-Source Maintainers & Orgs</span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight mb-2">Package Any Merged Pull Request into a 10-Minute Trial</h3>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
          SkillMirror.AI pulls the commit prior to the fix, sets the PR's test files as ground truth, confirms tests fail on baseline, and verifies they pass with the merged patch.
        </p>

        {/* URL Input */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Paste public GitHub closed issue or merged PR URL..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleIngest()}
            disabled={loading}
            className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs font-mono rounded-lg transition flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Ingest & Verify</span>
              </>
            )}
          </button>
        </div>

        {/* Presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-zinc-500 font-mono">Verified repository presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => { setRepoUrl(p.url); handleIngest(p.url); }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verified Package Preview */}
      {ingestedSprint && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-5 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fail-to-Pass Verification Passed
                </span>
                <span className="text-xs text-zinc-500 font-mono">Repo: {ingestedSprint.repo}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{ingestedSprint.title}</h3>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orgApproved}
                  onChange={(e) => setOrgApproved(e.target.checked)}
                  className="rounded border-zinc-700 text-emerald-600 focus:ring-0"
                />
                <span>Organization Consent Approved</span>
              </label>

              <button
                onClick={handlePublish}
                disabled={loading || published || !orgApproved}
                className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 ${
                  published
                    ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-sm'
                }`}
              >
                {published ? 'Published to Sprint Directory!' : 'Publish Ghost-Sprint'}
              </button>
            </div>
          </div>

          {/* Verification Pipeline Checks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Baseline Commit</div>
              <div className="text-xs font-bold text-rose-400 font-mono mt-0.5">Tests Fail (Verified)</div>
              <div className="text-[9px] text-zinc-500 font-mono mt-1">Starting state isolated</div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">PR Patch Suite</div>
              <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">Tests Pass (Verified)</div>
              <div className="text-[9px] text-zinc-500 font-mono mt-1">Ground truth verified</div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Diff Scope</div>
              <div className="text-xs font-bold text-white font-mono mt-0.5">{ingestedSprint.verification.diffLineCount} Lines Changed</div>
              <div className="text-[9px] text-zinc-500 font-mono mt-1">Self-contained trial</div>
            </div>

            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Benchmark Target</div>
              <div className="text-xs font-bold text-zinc-200 font-mono mt-0.5">{Math.floor(ingestedSprint.benchmarkMedianSec / 60)}m Median</div>
              <div className="text-[9px] text-zinc-500 font-mono mt-1">Calibrated benchmark</div>
            </div>
          </div>

          {/* Extracted Brief & Code Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="text-xs font-mono font-medium text-zinc-300 uppercase mb-2">Synthesized Problem Brief</div>
              <p className="text-xs text-zinc-400 leading-relaxed">{ingestedSprint.summary}</p>
            </div>

            <div className="p-3.5 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="text-xs font-mono font-medium text-zinc-300 uppercase mb-2">Baseline Code Starter</div>
              <pre className="text-[11px] font-mono text-zinc-300 max-h-32 overflow-y-auto whitespace-pre">{ingestedSprint.starterCode}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
