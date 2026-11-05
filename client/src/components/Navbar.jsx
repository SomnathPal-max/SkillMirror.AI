import React, { useState } from 'react';
import { 
  Terminal, ShieldCheck, Sparkles, UserCheck, Compass, 
  Home, Play, Users, Bot, Shield, LayoutDashboard, Building, LogIn, User
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, onOpenAuthModal, onStartDefaultTrial }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNav = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sprints', label: 'Skill Challenges', icon: Compass },
    { id: 'workspace', label: 'Sandbox IDE', icon: Terminal },
    { id: 'thoughtXRay', label: 'Proof Cards', icon: ShieldCheck },
    { id: 'matching', label: 'Opportunities', icon: Sparkles },
    { id: 'teams', label: 'Team Finder', icon: Users },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'org', label: 'For Orgs', icon: Building },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          {/* Abstract SkillMirror Reflection Mark */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-teal-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-3.5 h-3.5 border-2 border-white/90 rotate-45 rounded-sm"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                SkillMirror <span className="text-purple-600">AI</span>
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold hidden sm:inline">
                Proof-of-work
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden md:block">
              Discover Your Talent. Prove Your Skills.
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                  isActive
                    ? 'text-purple-700 bg-purple-50 font-bold border border-purple-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA / User Menu */}
        <div className="flex items-center gap-2.5">
          {activeTab !== 'workspace' && (
            <button
              onClick={() => {
                if (onStartDefaultTrial) onStartDefaultTrial();
                else setActiveTab('workspace');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold font-mono transition flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Launch Trial</span>
            </button>
          )}

          {currentUser ? (
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-purple-300 cursor-pointer transition text-xs font-mono"
            >
              <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-slate-800 font-medium hidden sm:inline">{currentUser.full_name?.split(' ')[0]}</span>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-mono font-semibold transition flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-3 space-y-1 font-mono text-xs shadow-lg animate-fade-in">
          {mainNav.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                activeTab === item.id ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-4 h-4 text-purple-600" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
