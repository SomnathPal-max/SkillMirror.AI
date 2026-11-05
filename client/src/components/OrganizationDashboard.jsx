import React, { useState, useEffect } from 'react';
import { Building, Plus, Briefcase, Eye, CheckCircle2, Users, ArrowRight, ShieldCheck, GitPullRequest } from 'lucide-react';
import SprintIngestor from './SprintIngestor';

export default function OrganizationDashboard({ onInspectCandidate }) {
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' | 'post_opportunity' | 'ingest_pr'
  const [opportunities, setOpportunities] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [showCreateOpModal, setShowCreateOpModal] = useState(false);

  // New Opportunity Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [opportunityType, setOpportunityType] = useState('Internship');
  const [location, setLocation] = useState('Remote (Global)');
  const [stipend, setStipend] = useState('$1,200/month');
  const [requiredSkills, setRequiredSkills] = useState('Python, AsyncIO, Testing');
  const [fastTrackThreshold, setFastTrackThreshold] = useState(80);
  const [invited, setInvited] = useState({});

  useEffect(() => {
    Promise.all([
      fetch('/api/opportunities').then(r => r.json()),
      fetch('/api/scout/candidates').then(r => r.json())
    ])
    .then(([oppsRes, candsRes]) => {
      if (oppsRes.success) setOpportunities(oppsRes.opportunities || []);
      if (candsRes.success) setCandidates(candsRes.candidates || []);
    })
    .catch(err => console.error(err));
  }, []);

  async function handleCreateOpportunity(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          opportunity_type: opportunityType,
          location,
          is_remote: true,
          duration: '3-6 Months',
          stipend,
          required_skills: requiredSkills.split(',').map(s => s.trim()),
          fast_track_threshold: Number(fastTrackThreshold)
        })
      });
      const data = await res.json();
      if (data.success) {
        setOpportunities(prev => [data.opportunity, ...prev]);
        setShowCreateOpModal(false);
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleInvite(candId) {
    setInvited(prev => ({ ...prev, [candId]: true }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold">
              Organization Hiring Hub
            </span>
            <span className="text-xs text-slate-500 font-mono">Pedigree-Free Talent Discovery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            OpenCore Foundation Portal
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl font-normal leading-relaxed">
            Review applicant proof-of-work, inspect 30-second Thought-X-Ray replays, publish opportunities, and turn real pull requests into 10-minute Ghost-Sprints.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-mono">
          <button
            onClick={() => setActiveTab('applicants')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'applicants' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Verified Applicants ({candidates.length})
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'opportunities' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Opportunities ({opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('ingest_pr')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'ingest_pr' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <GitPullRequest className="w-3.5 h-3.5 text-purple-600" />
            <span>PR Ingestor</span>
          </button>
        </div>
      </div>

      {activeTab === 'ingest_pr' && (
        <SprintIngestor />
      )}

      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 font-sans">Active Positions & Bounties</h3>
            <button
              onClick={() => setShowCreateOpModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Opportunity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map(op => (
              <div key={op.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {op.opportunity_type}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{op.title}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-600">{op.stipend}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{op.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Fast-Track Threshold: <strong className="text-slate-900">{op.fast_track_threshold || 80}/100</strong></span>
                  <span className="text-emerald-600 font-medium">Status: Open</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'applicants' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">Verified Candidate Submissions</h3>
              <p className="text-xs text-slate-500 font-mono">Ranked by demonstrated capability signals, not resumes</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{candidates.length} Profiles Available</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((cand) => {
              const overall = Math.round(Object.values(cand.signals || {}).reduce((a, b) => a + b, 0) / 6);
              const isInvited = invited[cand.id];

              return (
                <div key={cand.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{cand.studentName}</h4>
                        <p className="text-xs text-slate-500 font-mono">{cand.sprintSummary?.repo}</p>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        {overall} Index
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono py-2 bg-slate-50 rounded-xl my-2 border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Speed</span>
                        <strong className="text-slate-800 text-xs">{cand.signals?.debuggingSpeed || cand.signals?.debugging}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Edge-Case</span>
                        <strong className="text-teal-600 text-xs">{cand.signals?.edgeCaseAwareness || cand.signals?.edge_case_awareness}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Pivot</span>
                        <strong className="text-purple-600 text-xs">{cand.signals?.pivotQuality || cand.signals?.pivot_quality}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-2">
                      Solved: {cand.sprintSummary?.title} in {cand.stats?.timeFormatted || '06:22'}. Passed all PR hidden assertions.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onInspectCandidate(cand)}
                      className="text-xs font-mono text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Replay</span>
                    </button>

                    <button
                      onClick={() => handleInvite(cand.id)}
                      disabled={isInvited}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                        isInvited 
                          ? 'bg-teal-50 text-teal-700 border border-teal-300' 
                          : 'bg-slate-900 hover:bg-purple-600 text-white shadow-sm'
                      }`}
                    >
                      {isInvited ? 'Screen Invited' : 'Fast-Track Screen'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Post Opportunity Modal */}
      {showCreateOpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Post an Engineering Opportunity</h3>
            <p className="text-xs text-slate-500 font-sans">
              Candidates who beat your calibrated fast-track threshold bypass resume screening and trigger a direct conversation.
            </p>

            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Fellow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description & Roadmap</label>
                <textarea
                  required
                  placeholder="Describe the projects, tech stack, and what the candidate will work on..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={opportunityType}
                    onChange={(e) => setOpportunityType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Project Bounty">Project Bounty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Stipend / Comp</label>
                  <input
                    type="text"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    placeholder="e.g. $1,500/month"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Fast-Track Score Threshold (out of 100)</label>
                <input
                  type="number"
                  min="60"
                  max="98"
                  value={fastTrackThreshold}
                  onChange={(e) => setFastTrackThreshold(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateOpModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-mono text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-semibold shadow-sm"
                >
                  Publish Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
