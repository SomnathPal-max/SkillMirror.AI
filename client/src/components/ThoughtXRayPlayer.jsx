import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, ShieldCheck, Tag } from 'lucide-react';

export default function ThoughtXRayPlayer({ proofCard }) {
  if (!proofCard || !proofCard.thoughtXRay) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs">
        No active Thought-X-Ray replay trace found. Complete a sprint in the Sandbox to generate a replay.
      </div>
    );
  }

  const { thoughtXRay, sprintSummary, studentName } = proofCard;
  const { phases = [], moments = [], narrative = [], totalDurationFormatted } = thoughtXRay;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0); // 0 to 100
  const [activeMoment, setActiveMoment] = useState(moments[0] || null);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          const next = prev + 1;
          const match = moments.find(m => {
            const pct = getPercentFromTimeStr(m.timeStr, totalDurationFormatted);
            return Math.abs(pct - next) < 2;
          });
          if (match) setActiveMoment(match);
          return next;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying, moments, totalDurationFormatted]);

  function getPercentFromTimeStr(timeStr, totalStr) {
    if (!timeStr || !totalStr) return 0;
    const [m1, s1] = timeStr.split(':').map(Number);
    const [m2, s2] = totalStr.split(':').map(Number);
    const t1 = (m1 * 60) + s1;
    const t2 = Math.max(1, (m2 * 60) + s2);
    return Math.min(100, Math.round((t1 / t2) * 100));
  }

  function handleJumpToMoment(moment) {
    const pct = getPercentFromTimeStr(moment.timeStr, totalDurationFormatted);
    setCurrentProgress(pct);
    setActiveMoment(moment);
    setIsPlaying(false);
  }

  function handleNarrativeClick(item) {
    const pct = getPercentFromTimeStr(item.time, totalDurationFormatted);
    setCurrentProgress(pct);
    const m = moments.find(x => x.id === item.eventId) || {
      id: item.eventId,
      timeStr: item.time,
      title: item.phase,
      description: item.text
    };
    setActiveMoment(m);
    setIsPlaying(false);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700/80 px-2 py-0.5 rounded font-medium">
              Thought-X-Ray™ Replay
            </span>
            <span className="text-xs text-zinc-500 font-mono">Process-Over-Outcome Observability</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Problem-Solving Trajectory: <span className="text-emerald-400">{studentName || 'Candidate'}</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Sprint: {sprintSummary?.title} • Real trial duration: {totalDurationFormatted}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => { setCurrentProgress(0); setIsPlaying(true); }}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
            title="Reset from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-md font-mono text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play 30s Replay'}</span>
          </button>
        </div>
      </div>

      {/* Scrubber & Phase Ribbon */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-xs font-mono text-zinc-500">
          <span>00:00 (Contextualization)</span>
          <span className="text-zinc-300 font-medium">{Math.round((currentProgress / 100) * 30)}s Replay Scrub</span>
          <span>{totalDurationFormatted} (Complete)</span>
        </div>

        {/* Multi-segmented Phase Bar */}
        <div className="relative h-6 bg-zinc-950 rounded-lg overflow-hidden flex border border-zinc-800">
          {phases.map((ph, idx) => (
            <div
              key={idx}
              style={{
                width: `${ph.endPercent - ph.startPercent}%`,
                backgroundColor: ph.color,
                opacity: 0.2
              }}
              className="h-full border-r border-zinc-900 flex items-center justify-center text-[10px] font-mono text-zinc-300 font-medium truncate px-1"
              title={`${ph.name} (${ph.startPercent}% - ${ph.endPercent}%)`}
            >
              {ph.name}
            </div>
          ))}

          {/* Scrubber Thumb */}
          <div
            style={{ left: `${currentProgress}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm z-10 transition-all duration-75"
          ></div>
        </div>

        {/* Clickable Moment Markers */}
        <div className="relative h-7">
          {moments.map((m, idx) => {
            const pct = getPercentFromTimeStr(m.timeStr, totalDurationFormatted);
            const isSelected = activeMoment?.id === m.id;
            return (
              <button
                key={idx}
                onClick={() => handleJumpToMoment(m)}
                style={{ left: `${pct}%` }}
                className={`absolute -translate-x-1/2 top-0 px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                  isSelected
                    ? 'bg-zinc-100 text-zinc-950 border-white font-semibold z-20'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 z-10'
                }`}
              >
                [{m.timeStr}]
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column View: Current Moment Card & Evidence-Linked Narration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Moment Focus */}
        <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-medium">
                Event: {activeMoment?.id || 'ev-snapshot'}
              </span>
              <span className="text-xs font-mono text-zinc-500">{activeMoment?.timeStr || '00:00'}</span>
            </div>

            <h4 className="text-sm font-semibold text-white mb-1.5">{activeMoment?.title || 'Telemetry Snapshot'}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              {activeMoment?.description || 'Candidate inspecting codebase files and running baseline tests.'}
            </p>

            <div className="bg-zinc-900/60 border border-zinc-800/80 p-2.5 rounded text-xs font-mono text-zinc-500">
              <div className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Strict Event Provenance</div>
              <p className="text-zinc-400 text-[11px]">
                Every observation strictly cites a logged event ID from the sandbox. The narration engine is barred from generating arbitrary numbers.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Integrity:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Deterministic Event Log
            </span>
          </div>
        </div>

        {/* Right: Chronological Narrative with Linked Event IDs */}
        <div className="lg:col-span-6 bg-zinc-950 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-400 font-mono">
              Evidence-Linked Narration
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">Click item to scrub</span>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {narrative.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleNarrativeClick(item)}
                className="p-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition flex flex-col gap-1 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      [{item.time}]
                    </span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-950 text-zinc-500 group-hover:text-zinc-300">
                      {item.eventId}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{item.phase}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
