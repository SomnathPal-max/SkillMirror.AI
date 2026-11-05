import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import StudentDashboard from './components/StudentDashboard';
import SprintCatalog from './components/SprintCatalog';
import StudentWorkspace from './components/StudentWorkspace';
import ProofCardView from './components/ProofCardView';
import MatchRevealView from './components/MatchRevealView';
import TeamFinderView from './components/TeamFinderView';
import AiCareerAssistantView from './components/AiCareerAssistantView';
import OrganizationDashboard from './components/OrganizationDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import { ShieldCheck, Code2, Users, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); 
  // 'home' | 'dashboard' | 'sprints' | 'workspace' | 'thoughtXRay' | 'matching' | 'teams' | 'ai' | 'org' | 'admin'

  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState('chal-async-queue');
  const [activeProofCard, setActiveProofCard] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Load user and demo data on load
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.user) setCurrentUser(d.user);
      })
      .catch(err => console.warn('User session check:', err));

    fetch('/api/challenges')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.challenges) {
          setSprints(d.challenges);
          if (d.challenges.length > 0) setSelectedSprintId(d.challenges[0].id);
        }
      })
      .catch(err => console.error(err));

    fetch('/api/proof-cards')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.proof_cards?.length > 0) {
          setActiveProofCard(d.proof_cards[0]);
        }
      })
      .catch(err => console.warn('Proof cards load:', err));
  }, []);

  function handleSelectSprintFromCatalog(sprintId) {
    setSelectedSprintId(sprintId);
    setActiveTab('workspace');
  }

  function handleFinishSprint(newProofCard) {
    setActiveProofCard(newProofCard);
    setActiveTab('thoughtXRay');
  }

  function handleInspectCandidate(candidateProof) {
    setActiveProofCard(candidateProof);
    setActiveTab('thoughtXRay');
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onStartDefaultTrial={() => {
          setSelectedSprintId(sprints[0]?.id || 'chal-async-queue');
          setActiveTab('workspace');
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <LandingHero
            onDiscoverSkills={() => setActiveTab('dashboard')}
            onExploreOpportunities={() => setActiveTab('matching')}
            onLaunchChallenge={(sprintId) => {
              setSelectedSprintId(sprintId || 'chal-async-queue');
              setActiveTab('workspace');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <StudentDashboard
            studentProfile={currentUser}
            onLaunchChallenge={(id) => {
              setSelectedSprintId(id);
              setActiveTab('workspace');
            }}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'sprints' && (
          <SprintCatalog
            sprints={sprints}
            onSelectSprint={handleSelectSprintFromCatalog}
          />
        )}

        {activeTab === 'workspace' && (
          <StudentWorkspace
            currentSprintId={selectedSprintId}
            onFinishSprint={handleFinishSprint}
            onSelectDifferentSprint={() => setActiveTab('sprints')}
          />
        )}

        {activeTab === 'thoughtXRay' && (
          <ProofCardView
            proofCard={activeProofCard}
            onNavigateToMatching={() => setActiveTab('matching')}
          />
        )}

        {activeTab === 'matching' && (
          <MatchRevealView
            proofCard={activeProofCard}
          />
        )}

        {activeTab === 'teams' && (
          <TeamFinderView
            onConnectTeammate={() => alert('Invitation sent to squad member!')}
          />
        )}

        {activeTab === 'ai' && (
          <AiCareerAssistantView
            studentProfile={currentUser}
          />
        )}

        {activeTab === 'org' && (
          <OrganizationDashboard
            onInspectCandidate={handleInspectCandidate}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      {/* Modern Light Theme Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 px-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-teal-500 flex items-center justify-center text-white font-bold text-[10px]">
              SM
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm font-sans">SkillMirror AI</span>
              <p className="text-[11px] text-slate-400">"Discover Your Talent. Prove Your Skills. Unlock Your Future."</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              100% Opt-In Sandbox
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Code2 className="w-3.5 h-3.5 text-purple-600" />
              Deterministic Code Scoring
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-600" />
              DPDP Act Aligned
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            SkillMirror AI Core v2.4.0 • Production Build
          </div>
        </div>
      </footer>
    </div>
  );
}
