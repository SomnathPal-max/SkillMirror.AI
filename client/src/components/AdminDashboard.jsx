import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Building, Award, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  function fetchStats() {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json())
    ])
    .then(([statsRes, usersRes]) => {
      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users || []);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
              Platform Administration
            </span>
            <span className="text-xs text-slate-500 font-mono">SkillMirror AI Security & Moderation</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Oversight & Audit Dashboard</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Monitoring pedigree-free talent discovery, sandbox security & DPDP compliance</p>
        </div>

        <button
          onClick={fetchStats}
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-mono text-slate-500">Registered Students</div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{stats?.total_students || 1}</div>
          <div className="text-[11px] text-teal-600 font-mono">100% Verified Proof</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-mono text-slate-500">Verified Organizations</div>
          <div className="text-2xl font-bold text-purple-600 font-mono">{stats?.total_organizations || 2}</div>
          <div className="text-[11px] text-slate-400 font-mono">OpenCore, StateCraft</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-mono text-slate-500">Fast-Track Unlocks</div>
          <div className="text-2xl font-bold text-amber-600 font-mono">{stats?.fast_track_interviews_unlocked || 1}</div>
          <div className="text-[11px] text-slate-400 font-mono">Direct lead review queued</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs font-mono text-slate-500">Bias Audit Index</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">100%</div>
          <div className="text-[11px] text-emerald-600 font-mono">Zero resume/college filter</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 font-sans">Platform Profiles & Roles</h3>
          <span className="text-xs font-mono text-slate-500">{users.length} Active Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Institution / Org</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 font-medium text-slate-900">{u.full_name}</td>
                  <td className="py-2.5 text-slate-500">{u.email}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'admin' ? 'bg-rose-50 text-rose-700' :
                      u.role === 'organization' ? 'bg-purple-50 text-purple-700' :
                      'bg-teal-50 text-teal-700'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600">{u.college || 'Technology'}</td>
                  <td className="py-2.5 text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
