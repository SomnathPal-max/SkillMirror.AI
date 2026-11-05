import React, { useState } from 'react';
import { 
  Play, ArrowRight, ShieldCheck, CheckCircle2, Code2, Terminal, 
  Sparkles, Users, Award, TrendingUp, Building, HelpCircle, ChevronDown, ChevronUp, Lock
} from 'lucide-react';

export default function LandingHero({ onDiscoverSkills, onExploreOpportunities, onLaunchChallenge }) {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How does SkillMirror AI evaluate my skills without a resume?",
      a: "Instead of scanning keywords on a CV, SkillMirror AI gives you 10-minute Ghost-Sprints from real open-source repositories. You fix the bug in a live sandbox, and our deterministic scoring engine measures your debugging speed, edge-case probing, and iteration discipline."
    },
    {
      q: "Does SkillMirror AI use an LLM to guess my numerical score?",
      a: "No! All quantitative skill metrics (Debugging, Edge-Case Awareness, Iteration Discipline, Learning Velocity) are calculated by transparent, deterministic code from timestamped sandbox telemetry. The AI only assists in contextual guidance and process narration citing exact event IDs."
    },
    {
      q: "Are my trials private and student-owned?",
      a: "Yes. SkillMirror AI uses zero browser/IDE extensions and monitors nothing outside the active sandbox. You own your telemetry, can delete it at any time, and choose who receives your verified Proof Card link."
    },
    {
      q: "How do organizations connect with me?",
      a: "Organizations set benchmark thresholds on their Ghost-Sprints. When your Proof Card beats their calibrated median, a Fast-Track invitation is automatically queued for direct review with an engineering lead, bypassing resume filters completely."
    }
  ];

  return (
    <div className="space-y-24 py-12 animate-fade-in font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-xs font-mono text-purple-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Proof-of-work hiring for modern software engineers</span>
            <span className="text-purple-300">•</span>
            <span className="font-bold">No resume filters</span>
          </div>

          {/* Headline & Subheadline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Your Talent Deserves <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
                to Be Seen.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Prove your skills through real-world challenges. Discover your hidden strengths. Connect with opportunities that recognize your ability, not just your resume.
            </p>
          </div>

          {/* Core Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onDiscoverSkills}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white font-semibold text-sm font-mono shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Discover My Skills</span>
            </button>

            <button
              onClick={onExploreOpportunities}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-mono font-medium shadow-xs transition flex items-center gap-2"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Interactive SkillMirror AI Dashboard Preview Card */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden text-left space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-mono font-bold text-sm">
                    AR
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Alex Rivera</h3>
                    <p className="text-xs text-slate-500 font-mono">B.Tech (3rd Year) • State Technical Institute</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-mono font-bold">
                    Fast-Track Unlocked (92/100)
                  </div>
                  <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-mono">
                    Token: sm-card-9812-verified
                  </div>
                </div>
              </div>

              {/* 3 Interactive Feature Modules */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="text-[11px] font-mono text-purple-700 uppercase font-bold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" /> Demonstrated Capability
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">92/100 Debugging</div>
                  <p className="text-xs text-slate-600 leading-snug">
                    Diagnosed AsyncQueue slot leak in 6m 22s, beating calibrated median (08:30).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="text-[11px] font-mono text-teal-700 uppercase font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Learning Velocity
                  </div>
                  <div className="text-xl font-extrabold text-teal-600 font-mono">+14% Upward</div>
                  <p className="text-xs text-slate-600 leading-snug">
                    Time-to-green dropped systematically across 3 consecutive sprint tasks.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="text-[11px] font-mono text-indigo-700 uppercase font-bold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Matched Resonance
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">94% OpenCore</div>
                  <p className="text-xs text-slate-600 leading-snug">
                    Matched because candidate demonstrated boundary exception decoupling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE TALENT-OPPORTUNITY GAP PROBLEM */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-purple-600 font-bold">The Problem We Solve</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">The Talent–Opportunity Gap</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Talented students remain invisible because hiring systems evaluate pedigree rather than real capability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-mono uppercase text-rose-600 font-bold">Failure 1</div>
            <h3 className="text-lg font-bold text-slate-900">Resumes are Broken</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI-polished resumes all look identical. They hide genuine problem-solvers who lack formal credentials or elite college tags.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-mono uppercase text-rose-600 font-bold">Failure 2</div>
            <h3 className="text-lg font-bold text-slate-900">The Experience Catch-22</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Companies ask for prior production experience, but practical experience can only be gained if someone offers a first opportunity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="text-xs font-mono uppercase text-rose-600 font-bold">Failure 3</div>
            <h3 className="text-lg font-bold text-slate-900">Synthetic Screening</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              LeetCode puzzles reward memorized dynamic programming, completely disconnected from how engineers navigate production codebases.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW SKILLMIRROR AI WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-teal-600 font-bold">The Solution</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How SkillMirror AI Works</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Real organizational work becomes verified proof-of-work. Matching follows the evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 font-mono font-bold text-sm flex items-center justify-center">1</div>
            <h4 className="text-sm font-bold text-slate-900">Real Pull Requests</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We ingest closed issues and merged PRs. Starting state is the pre-fix commit; PR tests act as hidden ground truth.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-mono font-bold text-sm flex items-center justify-center">2</div>
            <h4 className="text-sm font-bold text-slate-900">Private Sandbox</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Solve inside an isolated browser sandbox. Timestamped telemetry records your hypothesis formulation and test runs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-sm flex items-center justify-center">3</div>
            <h4 className="text-sm font-bold text-slate-900">Deterministic Scoring</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Code calculates 8 verified skills. AI only narrates the trajectory with strict citations to event IDs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 font-mono font-bold text-sm flex items-center justify-center">4</div>
            <h4 className="text-sm font-bold text-slate-900">Fast-Track Match</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Beat the benchmark to unlock direct technical screening with companies and connect with complementary squad peers.
            </p>
          </div>
        </div>
      </section>

      {/* 4. GHOST-SPRINT CHALLENGES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold">10-Minute Ghost-Sprints</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Real-World Challenges, Ground-Truth Answers</h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Unlike online coding quizzes, every Ghost-Sprint is a self-contained trial extracted from actual production repositories (Express, Lodash, Undici, AsyncQueue).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
              <div className="text-xs font-mono text-teal-300 font-bold">Concurrency & Queues</div>
              <h4 className="text-sm font-semibold">AsyncQueue Slot Leaks</h4>
              <p className="text-xs text-slate-300">Fix unhandled promise rejection starvation in Python asyncio.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
              <div className="text-xs font-mono text-purple-300 font-bold">Memory & Immutability</div>
              <h4 className="text-sm font-semibold">deepMerge Prototype Guard</h4>
              <p className="text-xs text-slate-300">Prevent source object mutations and prototype pollution in state utils.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2">
              <div className="text-xs font-mono text-amber-300 font-bold">Rate Limiting & APIs</div>
              <h4 className="text-sm font-semibold">TokenBucket Time Drift</h4>
              <p className="text-xs text-slate-300">Fix fractional refill drops in high-throughput rate limiters.</p>
            </div>
          </div>

          <button
            onClick={() => onLaunchChallenge('chal-async-queue')}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-mono text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Try 10-Minute Ghost-Sprint Demo</span>
          </button>
        </div>
      </section>

      {/* 5. TESTIMONIALS (Clearly Labeled Sample Content) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-purple-600 font-bold">Student Stories</div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Proven by Students, Trusted by Teams</h2>
          <p className="text-slate-500 text-xs font-mono">[Clearly Labeled Pilot Sample Content]</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "I come from a tier-3 college with no campus placements. After passing the AsyncQueue Ghost-Sprint, OpenCore invited me to an engineering screen based on my Thought-X-Ray replay."
            </p>
            <div className="text-xs font-mono">
              <strong className="text-slate-900 block">Karan Verma</strong>
              <span className="text-slate-500">Tier-3 Polytechnic Student • Backend Fellow</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "We screened 500 AI-written resumes and couldn't tell who actually knew async programming. SkillMirror gave us 4 candidates with verified 10-minute proof cards."
            </p>
            <div className="text-xs font-mono">
              <strong className="text-slate-900 block">Sarah Jenkins</strong>
              <span className="text-slate-500">Staff Infrastructure Lead • OpenCore Foundation</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The Squad Synthesizer paired me with an amazing UI designer from another college who complemented my backend strengths. We won second place in our national hackathon!"
            </p>
            <div className="text-xs font-mono">
              <strong className="text-slate-900 block">Priya Sharma</strong>
              <span className="text-slate-500">Self-Taught Systems Developer</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-purple-600 font-bold">Frequently Asked Questions</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Everything You Need to Know</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-10 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Your College Name Doesn't Define Your Potential. <br className="hidden sm:inline" />
            <span className="text-teal-400">Your Demonstrated Skills Do.</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Join thousands of student problem-solvers proving their ability through real-world work.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={onDiscoverSkills}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-teal-400 text-slate-950 font-bold text-xs font-mono shadow-md transition"
            >
              Start Free Trial Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
