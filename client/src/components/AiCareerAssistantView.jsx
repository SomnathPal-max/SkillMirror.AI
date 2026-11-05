import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle, Code2, ArrowRight, CheckCircle2, Cpu } from 'lucide-react';

export default function AiCareerAssistantView({ studentProfile }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your SkillMirror AI Career Assistant, running on local Ollama intelligence. I have analyzed your verified Proof Card and technical telemetry on asynchronous error handling. How can I help you today? I can break down your skill metrics, recommend target career paths, prepare you for engineering screens, or suggest your next Ghost-Sprint.",
      suggestedPrompts: [
        "How can I improve my Edge-Case Awareness score to 98?",
        "What opportunities match my verified AsyncIO proof card?",
        "Conduct a mock technical interview for Distributed Systems Fellow."
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState({
    connected: true,
    active_model: 'llama3.2:latest',
    available_models: []
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAiStatus(data);
        }
      })
      .catch(err => console.log('Ollama status check:', err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(textToSend) {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          profile_id: studentProfile?.id || "prof-student-alex"
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [
          ...prev, 
          {
            role: 'assistant',
            text: data.response,
            snippet: data.suggested_snippet,
            suggestedPrompts: data.suggested_prompts || [],
            modelUsed: data.model_used || aiStatus.active_model
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev, 
        {
          role: 'assistant',
          text: "I analyzed your profile and active Ghost-Sprint. To excel in asynchronous systems: wrap worker execution in a unified `try...except...finally` block to prevent slot leaks under unhandled exceptions.",
          suggestedPrompts: ["What opportunities match my skills?", "Show recommended challenges"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 font-sans">SkillMirror AI Career Assistant</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ollama Local ({aiStatus.active_model || 'llama3.2:latest'})
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">Evidence-grounded mentoring, opportunity matching & code guidance powered by Ollama</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-5 overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 ${
              msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-purple-100 text-purple-700'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-sm ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-tr-none'
                : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none font-sans'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.snippet && (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-teal-300">
                  <pre className="overflow-x-auto whitespace-pre">{msg.snippet}</pre>
                </div>
              )}

              {msg.modelUsed && (
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 pt-1">
                  <Cpu className="w-3 h-3 text-purple-500" />
                  <span>Generated via Ollama • {msg.modelUsed}</span>
                </div>
              )}

              {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  {msg.suggestedPrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(p)}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 transition text-left"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 text-xs text-purple-600 font-mono animate-pulse">
            <Bot className="w-4 h-4" />
            <span>Consulting local Ollama model & synthesizing evidence...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Ask advice on your proof card, interview prep, career path, or challenge hints..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-sans focus:outline-none focus:border-purple-600 shadow-sm transition"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-semibold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
