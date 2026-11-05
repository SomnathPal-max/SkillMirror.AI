import React, { useState } from 'react';
import { X, Lock, Mail, User, Building, GraduationCap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register_student' | 'register_org'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' 
      ? { email, password }
      : {
          full_name: fullName || (mode === 'register_org' ? orgName : 'New Student'),
          email,
          password,
          role: mode === 'register_org' ? 'organization' : 'student',
          college: college || 'State Engineering College',
          organization_name: orgName,
          industry
        };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setError(data.detail || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Operating in offline demo fallback.');
    } finally {
      setLoading(false);
    }
  }

  // Quick Demo Access Presets
  function handleQuickDemo(role) {
    if (role === 'student') {
      setEmail('alex@skillmirror.ai');
      setPassword('password123');
    } else if (role === 'org') {
      setEmail('sarah@opencore.io');
      setPassword('password123');
    } else {
      setEmail('admin@skillmirror.ai');
      setPassword('password123');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs font-mono">
              SM
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {mode === 'login' ? 'Welcome to SkillMirror AI' : mode === 'register_student' ? 'Student Registration' : 'Organization Registration'}
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                {mode === 'login' ? 'Sign in to access your Proof Cards' : 'Create an evidence-based profile'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 text-xs font-mono p-1 bg-slate-100/60">
          <button
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-1.5 rounded-md font-medium transition ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register_student'); setError(null); }}
            className={`flex-1 py-1.5 rounded-md font-medium transition ${mode === 'register_student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Student Sign Up
          </button>
          <button
            onClick={() => { setMode('register_org'); setError(null); }}
            className={`flex-1 py-1.5 rounded-md font-medium transition ${mode === 'register_org' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Organization
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {mode !== 'login' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {mode === 'register_student' ? 'Full Name' : 'Contact Person Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={mode === 'register_student' ? 'Alex Rivera' : 'Sarah Jenkins'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </div>
          )}

          {mode === 'register_student' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">College or Institution</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. State Institute of Technology (Any Tier)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </div>
          )}

          {mode === 'register_org' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Organization Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. OpenCore Foundation"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Cloud Infrastructure, AI Systems"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs font-mono transition flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to SkillMirror' : 'Create Free Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Login Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2 text-xs">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
            One-Click Demo Roles:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickDemo('student')}
              className="flex-1 py-1 px-2 rounded border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono text-[11px] transition text-center"
            >
              Demo Student
            </button>
            <button
              onClick={() => handleQuickDemo('org')}
              className="flex-1 py-1 px-2 rounded border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 font-mono text-[11px] transition text-center"
            >
              Demo Org
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="flex-1 py-1 px-2 rounded border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] transition text-center"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
