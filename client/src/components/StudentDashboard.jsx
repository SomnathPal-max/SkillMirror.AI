import React, { useState, useEffect } from 'react';
import { 
  Award, TrendingUp, CheckCircle2, ShieldCheck, Clock, ArrowRight, 
  Sparkles, Code2, Play, Users, ExternalLink, Compass, Calendar
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

export default function StudentDashboard({ studentProfile, onLaunchChallenge, onNavigate }) {
  const [skillsData, setSkillsData] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [proofCards, setProofCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/students/skills').then(r => r.json()),
      fetch('/api/opportunities').then(r => r.json()),
      fetch('/api/proof-cards').then(r => r.json())
    ])
    .then(([skillsRes, oppsRes, proofsRes]) => {
      if (skillsRes.success) setSkillsData(skillsRes);
      if (oppsRes.success) setOpportunities(oppsRes.opportunities || []);
      if (proofsRes.success) setProofCards(proofsRes.proof_cards || []);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  const profile = studentProfile || {
    full_name: "Alex Rivera",
    college: "State Technical Institute",
    education_level: "B.Tech Computer Science (3rd Year)",
    skills: ["Python", "AsyncIO", "Concurrency", "FastAPI"],
    profile_completed_pct: 92
  };

  // Radar Data for Recharts
  const radarChartData = [
    { subject: 'Problem Solving', A: skillsData?.signals?.problem_solving || 88, fullMark: 100 },
    { subject: 'Debugging', A: skillsData?.signals?.debugging || 92, fullMark: 100 },
    { subject: 'Logical Reasoning', A: skillsData?.signals?.logical_reasoning || 86, fullMark: 100 },
    { subject: 'Edge-Case Awareness', A: skillsData?.signals?.edge_case_awareness || 94, fullMark: 100 },
    { subject: 'Iteration Discipline', A: skillsData?.signals?.iteration_discipline || 86, fullMark: 100 },
    { subject: 'Pivot Quality', A: skillsData?.signals?.pivot_quality || 92, fullMark: 100 },
    { subject: 'Learning Velocity', A: skillsData?.signals?.learning_velocity || 85, fullMark: 100 },
    { subject: 'AI Collaboration', A: skillsData?.signals?.ai_collaboration || 89, fullMark: 100 },
  ];

  // Learning Velocity Trend Data
  const velocityData = [
    { trial: 'Sprint #1', timeSec: 680, score: 78, median: 540 },
    { trial: 'Sprint #2', timeSec: 520, score: 84, median: 510 },
    { trial: 'Sprint #3', timeSec: 382, score: 92, median: 510 },
  ];

  // Challenge Category Completion Data
  const completionData = [
    { category: 'Concurrency', completed: 2, total: 3 },
    { category: 'Data Safety', completed: 1, total: 2 },
    { category: 'Rate Limiting', completed: 1, total: 2 },
    { category: 'Async APIs', completed: 2, total: 2 },
  ];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-teal-50/40 to-white border border-purple-100/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
              Student Talent Profile
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Profile {profile.profile_completed_pct}% Complete
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {profile.full_name}
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal leading-relaxed">
            {profile.college} • {profile.education_level}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onLaunchChallenge('chal-async-queue')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs font-mono transition flex items-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Active Trial</span>
          </button>

          <button
            onClick={() => onNavigate('thoughtXRay')}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-mono font-medium transition flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span>My Proof Card</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-500">Completed Sprints</div>
            <div className="text-xl font-bold text-slate-900">{proofCards.length || 1} Verified</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-500">Learning Velocity</div>
            <div className="text-xl font-bold text-teal-600">+14% Upward</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-500">Fast-Track Status</div>
            <div className="text-xl font-bold text-amber-600">Review Unlocked</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-500">Opportunity Resonance</div>
            <div className="text-xl font-bold text-indigo-600">92% Average</div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Skill Radar + Learning Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recharts Skill Radar */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">Demonstrated Skill Matrix</h3>
              <p className="text-xs text-slate-500 font-mono">Calculated deterministically by code from sandbox runs</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
              8 Signals
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Radar name="Student" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs font-mono text-slate-500 flex justify-between">
            <span>Overall Skill Index: <strong className="text-slate-900">89/100</strong></span>
            <span className="text-purple-600">Top 5% in Concurrency Debugging</span>
          </div>
        </div>

        {/* Right: Learning Velocity Line Chart */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">Learning Velocity Trend</h3>
              <p className="text-xs text-slate-500 font-mono">Time-to-green falling across multi-task progression</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-bold">
              Slope: -1.45
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={velocityData} margin={{ top: 15, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="trial" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="s" />
                <Tooltip />
                <Line type="monotone" dataKey="timeSec" stroke="#06b6d4" strokeWidth={2.5} name="Time-to-Green (sec)" activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="median" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} name="Calibrated Median" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs font-mono text-slate-500 flex justify-between">
            <span>Latest Solve Time: <strong className="text-teal-600">6m 22s</strong></span>
            <span className="text-slate-500">Benchmark: 8m 30s</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Matched Opportunities + Recommended Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Challenges */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">Active & Recommended Ghost-Sprints</h3>
              <p className="text-xs text-slate-500 font-mono">10-minute real open-source engineering challenges</p>
            </div>
            <button
              onClick={() => onNavigate('sprints')}
              className="text-xs font-mono text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">
                    Intermediate
                  </span>
                  <span className="text-xs font-mono text-slate-500">open-core/async-flow (PR #412)</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Fix Concurrency Slot Leak in AsyncQueue (Python)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Worker task crashes prevent slot decrement and starve the queue. Resolve unhandled promise logic.
                </p>
              </div>

              <button
                onClick={() => onLaunchChallenge('chal-async-queue')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-semibold shrink-0 transition flex items-center gap-1 shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Solve</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">
                    Advanced
                  </span>
                  <span className="text-xs font-mono text-slate-500">statecraft/utils (PR #189)</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Prevent Object Mutation & Prototype Contamination
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Recursive deep merge mutates source objects and exposes prototype pollution vulnerability.
                </p>
              </div>

              <button
                onClick={() => onLaunchChallenge('sprint-deep-merge')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-mono text-xs font-semibold shrink-0 transition flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Solve</span>
              </button>
            </div>
          </div>
        </div>

        {/* Opportunity Match Peek */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans">Matched Opportunities</h3>
                <p className="text-xs text-slate-500 font-mono">Based on verified Proof Card evidence</p>
              </div>
              <button
                onClick={() => onNavigate('matching')}
                className="text-xs font-mono text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {opportunities.slice(0, 2).map((op) => (
                <div key={op.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{op.title}</span>
                    <span className="text-xs font-mono font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      92% Match
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{op.org_name} • {op.stipend}</div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {op.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Fast-Track Interview Status:</span>
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Direct Screen Queued
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
