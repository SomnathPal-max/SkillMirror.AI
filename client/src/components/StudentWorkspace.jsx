import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, Bot, CheckCircle2, XCircle, 
  Clock, Shield, Send, Plus, ChevronRight, Check,
  FileCode, Terminal as TerminalIcon, Sparkles, BookOpen, AlertCircle, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StudentWorkspace({ onFinishSprint, currentSprintId, onSelectDifferentSprint }) {
  const [sprints, setSprints] = useState([]);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [code, setCode] = useState('');
  const [initialCode, setInitialCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  
  // Left Sidebar tabs: 'brief' | 'tests' | 'custom' | 'hints'
  const [leftTab, setLeftTab] = useState('brief');

  // Custom tests authored by student
  const [customTests, setCustomTests] = useState([]);
  const [newCustomTestName, setNewCustomTestName] = useState('');
  const [newCustomTestCode, setNewCustomTestCode] = useState('');

  // Hints state (progressive disclosure)
  const [revealedHints, setRevealedHints] = useState({});

  // In-Sandbox AI Assistant (MirrorCopilot)
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChat, setAiChat] = useState([
    {
      role: 'assistant',
      text: "I'm MirrorCopilot, your in-sandbox assistant. Feel free to ask about this codebase, error causes, or test ideas. Remember: SkillMirror.AI evaluates your AI collaboration judgment—critique and adapt suggestions rather than blind-pasting.",
      timestamp: '00:00'
    }
  ]);
  const [aiThinking, setAiThinking] = useState(false);

  // Session & Telemetry
  const [sessionId] = useState(() => `sess-${Math.random().toString(36).substring(2, 9)}`);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [runCount, setRunCount] = useState(0);
  const [clientEvents, setClientEvents] = useState([]);
  const timerRef = useRef(null);

  // Load Sprints
  useEffect(() => {
    fetch('/api/sprints')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.sprints.length > 0) {
          setSprints(data.sprints);
          const targetId = currentSprintId || data.sprints[0].id;
          loadSprint(targetId);
        }
      })
      .catch(err => console.error('Failed to load sprints:', err))
      .finally(() => setLoading(false));
  }, [currentSprintId]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  function logEvent(type, payload = {}) {
    const ev = {
      id: `ev-${clientEvents.length + 101}`,
      timestamp: Date.now(),
      type,
      payload
    };
    setClientEvents(prev => [...prev, ev]);

    fetch('/api/telemetry/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, sprintId: currentSprint?.id, event: ev })
    }).catch(e => console.warn('Telemetry sync error:', e));
  }

  function loadSprint(sprintId) {
    setLoading(true);
    fetch(`/api/sprints/${sprintId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setCurrentSprint(data.sprint);
          const starter = Object.values(data.sprint.files || {})[0] || '';
          setCode(starter);
          setInitialCode(starter);
          setTestResults(null);
          setElapsedSeconds(0);
          setRunCount(0);
          setRevealedHints({});
          logEvent('sandbox_init', { sprintId });
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }

  function handleCodeChange(newVal) {
    setCode(newVal);
    if (Math.random() < 0.25) {
      logEvent('code_edit', { length: newVal.length });
    }
  }

  function handleRevert() {
    if (window.confirm("Revert your code back to the starting pre-fix commit? This will be recorded as a strategic pivot in your replay.")) {
      setCode(initialCode);
      logEvent('revert_to_checkpoint', { target: 'initial_state' });
    }
  }

  async function handleRunTests() {
    if (!currentSprint) return;
    setRunning(true);
    const newRunCount = runCount + 1;
    setRunCount(newRunCount);

    logEvent('test_run_initiated', { runNumber: newRunCount });

    try {
      const res = await fetch('/api/sandbox/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId: currentSprint.id,
          code,
          customTests,
          includeHidden: true,
          sessionId
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestResults(data.results);
        logEvent('test_run_completed', {
          passed: data.results.passed,
          passedCount: data.results.passedCount,
          failedCount: data.results.failedCount
        });

        if (data.results.passed) {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  }

  function handleAddCustomTest() {
    if (!newCustomTestName || !newCustomTestCode) return;
    const ct = {
      id: `ct-${customTests.length + 1}`,
      name: newCustomTestName,
      code: newCustomTestCode
    };
    setCustomTests(prev => [...prev, ct]);
    logEvent('custom_test_added', { name: newCustomTestName });
    setNewCustomTestName('');
    setNewCustomTestCode('');
    setLeftTab('tests');
  }

  function handleRevealHint(hintIndex) {
    setRevealedHints(prev => ({ ...prev, [hintIndex]: true }));
    logEvent('hint_viewed', { hintIndex });
  }

  async function handleSendAiPrompt() {
    if (!aiPrompt.trim()) return;
    const userMsg = aiPrompt;
    setAiPrompt('');
    setAiThinking(true);

    const nowTimeStr = formatSeconds(elapsedSeconds);
    setAiChat(prev => [...prev, { role: 'user', text: userMsg, timestamp: nowTimeStr }]);
    logEvent('ai_prompt', { prompt: userMsg });

    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          currentCode: code,
          sprintId: currentSprint?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiChat(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            text: data.response, 
            snippet: data.suggestedSnippet, 
            timestamp: formatSeconds(elapsedSeconds) 
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiThinking(false);
    }
  }

  function handleInsertAiSnippet(snippet) {
    setCode(prev => prev + '\n\n' + snippet);
    logEvent('ai_code_modified', { snippetLength: snippet.length });
  }

  async function handleSubmitSprint() {
    if (!currentSprint) return;
    setRunning(true);
    try {
      const res = await fetch('/api/telemetry/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sprintId: currentSprint.id,
          studentName: 'Candidate (Self-Verified)',
          clientEvents
        })
      });
      const data = await res.json();
      if (data.success && data.proofCard) {
        onFinishSprint(data.proofCard);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  }

  function formatSeconds(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  if (loading && !currentSprint) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-500 font-mono text-xs">Initializing sandbox container...</span>
        </div>
      </div>
    );
  }

  const calibratedSec = currentSprint?.calibratedMedianSeconds || 500;
  const isPassing = testResults && testResults.passed;

  // Extract hints for this sprint
  const sprintHints = [
    "Inspect the exact lifecycle in _process(). Count each code branch where this.running is modified.",
    "Notice how errors are handled. If an asynchronous task rejects or throws, does the concurrency counter decrement?",
    "Consider decoupling state cleanup from resolve/reject by wrapping worker completion in a guaranteed execution block."
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      {/* Top Header / Status Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3.5 mb-4 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Sprint Identification */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-emerald-400">
                {currentSprint?.repo}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-[11px] font-mono text-zinc-400">
                PR Ground Truth #{currentSprint?.id?.slice(-4) || '412'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                {currentSprint?.difficulty}
              </span>
            </div>
            <h1 className="text-sm font-semibold text-white tracking-tight mt-0.5">
              {currentSprint?.title}
            </h1>
          </div>
        </div>

        {/* Center: Live Telemetry Metrics */}
        <div className="flex items-center gap-5 text-xs font-mono">
          {/* Timer */}
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <div>
              <span className="font-semibold text-white">{formatSeconds(elapsedSeconds)}</span>
              <span className="text-zinc-500 text-[10px] ml-1.5">/ {formatSeconds(calibratedSec)} median</span>
            </div>
          </div>

          {/* Runs */}
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>Runs:</span>
            <span className="text-white font-semibold">#{runCount}</span>
          </div>

          {/* Test Status Indicator */}
          <div className="flex items-center gap-1.5">
            {testResults ? (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono ${
                testResults.passed 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {testResults.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span>{testResults.passedCount}/{testResults.totalTests} Passed</span>
              </span>
            ) : (
              <span className="text-zinc-500 text-[11px]">Tests not executed</span>
            )}
          </div>
        </div>

        {/* Right: Primary Action */}
        <div className="flex items-center gap-2">
          {isPassing ? (
            <button
              onClick={handleSubmitSprint}
              disabled={running}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs font-mono transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Submit & View Proof Card</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleRunTests}
              disabled={running}
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-semibold text-xs font-mono transition flex items-center gap-1.5 shadow-sm"
            >
              {running ? (
                <>
                  <div className="w-3 h-3 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run Tests</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main IDE Workspace (Split Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Context, Brief, Public Tests, Hints */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[650px]">
          {/* Tab Bar */}
          <div className="flex border-b border-zinc-800 bg-zinc-950 px-2 pt-2 gap-1 text-xs font-mono">
            {[
              { id: 'brief', label: 'Brief', icon: BookOpen },
              { id: 'tests', label: 'Tests', icon: CheckCircle2 },
              { id: 'hints', label: 'Hints', icon: HelpCircle },
              { id: 'custom', label: '+ Custom', icon: Plus }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = leftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLeftTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md transition text-xs ${
                    isActive 
                      ? 'bg-zinc-900 text-white border-t border-x border-zinc-800 font-medium' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Left Panel Content */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs leading-relaxed">
            {leftTab === 'brief' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-white mb-1.5 text-sm">Task Overview</h3>
                  <p className="text-zinc-400 leading-relaxed">{currentSprint?.description}</p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="text-[11px] font-mono font-medium text-emerald-400">Ground-Truth Expectations</div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                    <li>Must resolve all public unit tests without altering function signatures.</li>
                    <li>Must pass PR hidden regression fixtures on async error propagation.</li>
                    <li>Concurrency limit must not stall under unhandled exceptions.</li>
                  </ul>
                </div>

                <div className="pt-2 text-[11px] font-mono text-zinc-500">
                  Tip: Use the MirrorCopilot drawer if you want architectural guidance.
                </div>
              </div>
            )}

            {leftTab === 'tests' && (
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                  Public & Regression Test Suite
                </div>

                <div className="space-y-2 font-mono">
                  {(currentSprint?.publicTests || []).map((t, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-200 font-medium">{t.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">Public</span>
                      </div>
                      <pre className="text-[10px] text-zinc-500 overflow-x-auto whitespace-pre-wrap">{t.code}</pre>
                    </div>
                  ))}

                  {(currentSprint?.hiddenTests || []).map((h, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-zinc-300">{h.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-400 font-mono">
                        PR Hidden Fixture
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {leftTab === 'hints' && (
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                  Progressive Hints (Revealing is recorded)
                </div>

                {sprintHints.map((hint, idx) => {
                  const isRevealed = revealedHints[idx];
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-zinc-300 font-medium">Hint #{idx + 1}</span>
                        {!isRevealed && (
                          <button
                            onClick={() => handleRevealHint(idx)}
                            className="text-[10px] font-mono text-emerald-400 hover:underline"
                          >
                            Reveal Hint
                          </button>
                        )}
                      </div>
                      {isRevealed ? (
                        <p className="text-zinc-300 text-xs leading-relaxed">{hint}</p>
                      ) : (
                        <p className="text-zinc-600 text-xs italic">Hidden to preserve initial hypothesis score.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {leftTab === 'custom' && (
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                  Author Custom Edge-Case Assertion
                </div>
                <p className="text-zinc-400 text-xs">
                  Proactively testing edge cases demonstrates high Edge-Case Awareness in your Proof Card.
                </p>

                <input
                  type="text"
                  placeholder="Test Name (e.g. Burst crash recovery)"
                  value={newCustomTestName}
                  onChange={(e) => setNewCustomTestName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />

                <textarea
                  placeholder="async function run(Target) { ... if (!valid) throw new Error('Failed'); return true; }"
                  value={newCustomTestCode}
                  onChange={(e) => setNewCustomTestCode(e.target.value)}
                  className="w-full h-28 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                />

                <button
                  onClick={handleAddCustomTest}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono font-medium transition"
                >
                  Save & Include in Test Run
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center & Right Column: Editor + Terminal */}
        <div className="lg:col-span-8 flex flex-col h-[650px] gap-3">
          {/* Editor Container */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col flex-1 shadow-lg relative">
            {/* Editor Tab Bar & Controls */}
            <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-mono text-zinc-200 font-medium">solution.js</span>
                <span className="text-[10px] font-mono text-zinc-600 hidden sm:inline">JavaScript (ESM)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRevert}
                  title="Revert to baseline commit"
                  className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition font-mono flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Revert</span>
                </button>

                <button
                  onClick={() => setShowAiDrawer(!showAiDrawer)}
                  className={`px-2.5 py-1 text-xs rounded transition font-mono flex items-center gap-1.5 ${
                    showAiDrawer 
                      ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>MirrorCopilot</span>
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="relative flex-1 bg-[#09090b]">
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                spellCheck="false"
                className="w-full h-full p-4 bg-transparent text-zinc-100 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-emerald-500/20"
                style={{ tabSize: 2 }}
              />

              {/* In-Sandbox AI Drawer (Copilot Chat Style) */}
              {showAiDrawer && (
                <div className="absolute top-0 right-0 bottom-0 w-80 bg-zinc-950 border-l border-zinc-800 shadow-xl flex flex-col z-20">
                  <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-white font-mono">MirrorCopilot</span>
                    </div>
                    <button 
                      onClick={() => setShowAiDrawer(false)}
                      className="text-zinc-500 hover:text-zinc-300 text-xs font-mono"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs font-sans">
                    {aiChat.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-zinc-900 text-zinc-200 ml-4 border border-zinc-800'
                            : 'bg-zinc-900/60 text-zinc-300 border border-zinc-800/80 mr-2'
                        }`}
                      >
                        <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                          <span>{msg.role === 'user' ? 'You' : 'MirrorCopilot'}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p>{msg.text}</p>
                        {msg.snippet && (
                          <div className="mt-2 bg-zinc-950 p-2 rounded border border-zinc-800 font-mono text-[11px] text-emerald-400">
                            <pre className="overflow-x-auto whitespace-pre">{msg.snippet}</pre>
                            <button
                              onClick={() => handleInsertAiSnippet(msg.snippet)}
                              className="mt-1.5 px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[10px] font-mono flex items-center gap-1"
                            >
                              <Plus className="w-2.5 h-2.5" /> Insert snippet
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {aiThinking && (
                      <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5 p-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span>MirrorCopilot is analyzing AST...</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-zinc-800 bg-zinc-950 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Ask for guidance or error analysis..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendAiPrompt()}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSendAiPrompt}
                      className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Terminal Output */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-52 flex flex-col shadow-lg">
            <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-semibold text-zinc-300">Terminal & Test Runner Output</span>
              </div>
              <div className="text-[11px] text-zinc-500">
                {testResults ? `${testResults.durationMs}ms execution time` : 'Ready'}
              </div>
            </div>

            <div className="p-3.5 flex-1 overflow-y-auto font-mono text-xs space-y-2">
              {!testResults ? (
                <div className="h-full flex items-center justify-center text-zinc-600">
                  Click "Run Tests" to execute against public and hidden test fixtures.
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    {testResults.tests.map((t, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          {t.passed ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span className={t.passed ? 'text-zinc-300' : 'text-rose-300 font-medium'}>
                            {t.name}
                          </span>
                        </div>
                        <span className="text-zinc-600 text-[10px]">{t.durationMs}ms</span>
                      </div>
                    ))}
                  </div>

                  {testResults.stdout && (
                    <div className="mt-2 pt-2 border-t border-zinc-800 text-zinc-400 text-[11px] whitespace-pre-wrap">
                      {testResults.stdout}
                    </div>
                  )}

                  {testResults.stderr && (
                    <div className="mt-1 text-rose-400 text-[11px] whitespace-pre-wrap">
                      {testResults.stderr}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
