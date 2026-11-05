import React, { useState, useEffect } from 'react';
import { Users, Plus, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, UserPlus, MessageSquare } from 'lucide-react';

export default function TeamFinderView({ onConnectTeammate }) {
  const [teams, setTeams] = useState([]);
  const [recommendedTeammates, setRecommendedTeammates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newProjectGoal, setNewProjectGoal] = useState('');
  const [newRequiredRole, setNewRequiredRole] = useState('Frontend & Design Systems Architect');
  const [joinedTeams, setJoinedTeams] = useState({});

  useEffect(() => {
    Promise.all([
      fetch('/api/teams').then(r => r.json()),
      fetch('/api/matching/results').then(r => r.json())
    ])
    .then(([teamsRes, matchRes]) => {
      if (teamsRes.success) setTeams(teamsRes.teams || []);
      if (matchRes.success) setRecommendedTeammates(matchRes.teammates || []);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  async function handleCreateTeam(e) {
    e.preventDefault();
    if (!newTeamName || !newProjectGoal) return;

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName,
          project_goal: newProjectGoal,
          required_roles: [newRequiredRole, "Testing & Reliability Engineer"],
          creator_id: "prof-student-alex"
        })
      });
      const data = await res.json();
      if (data.success) {
        setTeams(prev => [data.team, ...prev]);
        setShowCreateModal(false);
        setNewTeamName('');
        setNewProjectGoal('');
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleJoin(teamId) {
    setJoinedTeams(prev => ({ ...prev, [teamId]: true }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded font-bold">
              AI Squad Synthesizer
            </span>
            <span className="text-xs text-slate-500 font-mono">Complementary Skill Synergy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Team Finder & Hackathon Squads
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal leading-relaxed">
            Form high-performing engineering squads. SkillMirror AI calculates skill complementarity—pairing your backend concurrency strengths with UI architecture, testing rigor, and data pipeline specialists.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs font-mono transition flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Project Squad</span>
        </button>
      </div>

      {/* Section 1: AI-Recommended Complementary Teammates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-sans">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>RECOMMENDED COMPLEMENTARY TEAMMATES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedTeammates.map((peer) => (
            <div
              key={peer.id}
              className="bg-white border border-slate-200 hover:border-purple-300 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition">
                      {peer.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-sans">{peer.college}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {peer.synergy_score}% Synergy
                  </span>
                </div>

                <div className="mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    {peer.role_type}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3 space-y-1">
                  <div className="text-[10px] font-mono text-purple-600 font-bold uppercase">
                    Complementary Balance:
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">
                    {peer.complementary_reason}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {(peer.skills || []).map((sk, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Proof Card Verified</span>
                <button
                  onClick={() => alert(`Invitation sent to ${peer.name}!`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-purple-600 text-white font-mono text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite to Squad</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Active Recruiting Squads */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 font-sans">
          <Users className="w-4 h-4 text-teal-600" />
          <span>ACTIVE RECRUITING SQUADS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((tm) => (
            <div key={tm.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-[10px] font-mono text-purple-600 uppercase font-semibold">
                      {tm.target_hackathon}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{tm.name}</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                    Recruiting
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {tm.project_goal}
                </p>

                <div className="space-y-1.5 mb-3">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Looking for roles:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(tm.required_roles || []).map((r, i) => (
                      <span key={i} className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-mono">
                  Members: {(tm.members || []).map(m => m.name).join(', ')}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">Founded by Student Lead</span>
                <button
                  onClick={() => handleJoin(tm.id)}
                  disabled={joinedTeams[tm.id]}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 ${
                    joinedTeams[tm.id]
                      ? 'bg-teal-50 text-teal-700 border border-teal-300'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-sm'
                  }`}
                >
                  {joinedTeams[tm.id] ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Request Sent</span>
                    </>
                  ) : (
                    <>
                      <span>Apply to Join Squad</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create a New Project Squad</h3>
            <p className="text-xs text-slate-500 font-sans">
              Define your project goal and required roles. SkillMirror AI will automatically recommend complementary teammates.
            </p>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Squad / Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Mesh Guild"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project Goal & Vision</label>
                <textarea
                  required
                  placeholder="What are you building? (e.g. Building a self-healing microservice mesh with real-time consensus for edge nodes)"
                  value={newProjectGoal}
                  onChange={(e) => setNewProjectGoal(e.target.value)}
                  className="w-full h-24 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Key Complementary Role Needed</label>
                <select
                  value={newRequiredRole}
                  onChange={(e) => setNewRequiredRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-mono"
                >
                  <option value="Frontend & Design Systems Architect">Frontend & Design Systems Architect</option>
                  <option value="Fuzzing & Reliability Engineer">Fuzzing & Reliability Engineer</option>
                  <option value="Data Pipeline & Streaming Engineer">Data Pipeline & Streaming Engineer</option>
                  <option value="AI / LLM Infrastructure Specialist">AI / LLM Infrastructure Specialist</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-mono text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-semibold shadow-sm"
                >
                  Publish Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
