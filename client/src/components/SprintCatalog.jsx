import React, { useState } from 'react';
import { Search, Filter, Play, Clock, ShieldCheck, GitPullRequest, ArrowRight } from 'lucide-react';

export default function SprintCatalog({ sprints = [], onSelectSprint }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');

  const filtered = sprints.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.repo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'ALL' || s.difficulty.toUpperCase() === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1 font-semibold">
            Ghost-Sprint Directory
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Real-World Engineering Trials</h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Each sprint is a 10-minute trial reconstructed from a merged pull request. Your solution is evaluated against public assertions and hidden PR regression fixtures.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-500">
          Showing {filtered.length} of {sprints.length} available sprints
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by repository, title, or keywords (e.g. concurrency, merge, rate-limit)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
          {['ALL', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setDifficultyFilter(lvl)}
              className={`px-3 py-1.5 rounded-md transition ${
                difficultyFilter === lvl
                  ? 'bg-zinc-800 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Sprint Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((sprint) => {
          const medianMins = Math.floor((sprint.calibratedMedianSeconds || 500) / 60);

          return (
            <div
              key={sprint.id}
              className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between transition-all duration-150 group"
            >
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                    <GitPullRequest className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="truncate max-w-[170px]">{sprint.repo}</span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    sprint.difficulty === 'Advanced'
                      ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                      : 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                  }`}>
                    {sprint.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition mb-2 leading-snug">
                  {sprint.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-4">
                  {sprint.description}
                </p>
              </div>

              <div>
                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono py-2.5 my-3 border-y border-zinc-800/80 text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>~{medianMins}m median</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{sprint.hiddenTestsCount || 3} hidden tests</span>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => onSelectSprint(sprint.id)}
                  className="w-full py-2 px-3 rounded-lg bg-zinc-800 hover:bg-emerald-500 text-zinc-200 hover:text-zinc-950 text-xs font-mono font-medium transition flex items-center justify-center gap-2 group-hover:bg-emerald-500 group-hover:text-zinc-950"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start 10-Min Trial</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
