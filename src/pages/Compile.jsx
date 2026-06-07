import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { EXAMPLES, STAGE_CONFIG } from '../utils/constants';
import { parsePrompts } from '../utils/parsePrompts';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Compile() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [input, setInput] = useState('');
  const [prompts, setPrompts] = useState({ p1: '', p2: '', p3: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [streaming, setStreaming] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [userData, setUserData] = useState(null);
  const outputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setUserData(await res.json());
      } catch {}
    };
    fetchUser();
  }, [user]);

  const isFree = userData?.tier === 'free' || !userData?.tier;

  const handleCompile = async () => {
    if (!input.trim()) return;

    setStatus('loading');
    setError('');
    setPrompts({ p1: '', p2: '', p3: '' });
    setStreaming('');
    setIsStreaming(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/compile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ input: input.trim() }),
        signal: controller.signal,
      });

      if (res.status === 429) {
        const data = await res.json();
        throw new Error(data.message || 'Rate limit exceeded');
      }

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data:'));
        for (const line of lines) {
          const data = line.replace('data:', '').trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              full += parsed.text;
              setStreaming(full);
            }
            if (parsed.done && parsed.parsed) {
              setPrompts(parsed.parsed);
              setStreaming('');
            }
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') throw e;
          }
        }
      }

      const parsed = parsePrompts(full);
      if (parsed.p1 || parsed.p2 || parsed.p3) {
        setPrompts(parsed);
      }
      setStatus('success');
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out after 60 seconds. Please try again.');
      } else {
        setError(err.message);
      }
      setStatus('error');
    } finally {
      clearTimeout(timeoutId);
      setIsStreaming(false);
    }
  };

  const handleCopyAll = () => {
    const text = `PROMPT 1 — PLANNING & ARCHITECTURE\n\n${prompts.p1}\n\nPROMPT 2 — IMPLEMENTATION\n\n${prompts.p2}\n\nPROMPT 3 — REVIEW & OPTIMIZATION\n\n${prompts.p3}`;
    navigator.clipboard.writeText(text);
  };

  const handleExport = (format) => {
    const data = { p1: prompts.p1, p2: prompts.p2, p3: prompts.p3 };
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'prompts.json'; a.click();
      URL.revokeObjectURL(url);
    } else {
      const text = `# PromptMaster Compilation\n\n## Prompt 1: Planning & Architecture\n\n${prompts.p1}\n\n## Prompt 2: Implementation\n\n${prompts.p2}\n\n## Prompt 3: Review & Optimization\n\n${prompts.p3}`;
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'prompts.md'; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const hasOutput = prompts.p1 || prompts.p2 || prompts.p3;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Compile</h1>
        <p className="text-sm text-[#6b7280]">Describe your project and get three production-grade prompts.</p>
      </div>

      <div className="glass rounded-2xl border border-[#1f2937] p-6 mb-6">
        <label className="text-xs text-[#6b7280] mb-3 block font-mono tracking-wider">// DESCRIBE YOUR PROJECT OR IDEA</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your idea, project, problem, or concept..."
          className="w-full min-h-[140px] bg-[#080a0c] border border-[#1f2937] rounded-xl p-4 text-sm text-[#e2e8f0] placeholder-[#374151] focus:outline-none focus:border-amber-600/40 focus:ring-1 focus:ring-amber-600/20 transition-all resize-none font-mono mb-4"
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setInput(ex)}
              className="text-[10px] px-3 py-1.5 rounded-lg border border-[#1f2937] text-[#4b5563] hover:border-[#374151] hover:text-[#9ca3af] transition-all font-mono"
            >
              {ex.length > 35 ? ex.slice(0, 35) + '...' : ex}
            </button>
          ))}
        </div>

        <button
          onClick={handleCompile}
          disabled={status === 'loading' || !input.trim()}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-amber-600 hover:bg-amber-500 text-white active:scale-[0.99]"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Compiling...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
              </svg>
              Compile Prompts
            </span>
          )}
        </button>
      </div>

      {isStreaming && streaming && (
        <div className="glass rounded-2xl border border-amber-600/20 p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-mono text-amber-500 tracking-wider">LIVE OUTPUT</span>
          </div>
          <pre className="text-xs text-[#6b7280] font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">{streaming}</pre>
        </div>
      )}

      {error && (
        <div className="glass rounded-2xl border border-red-500/20 bg-red-500/5 p-5 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="text-sm text-red-400 font-medium mb-1">Compilation Error</p>
              <p className="text-xs text-red-400/70">{error}</p>
            </div>
          </div>
        </div>
      )}

      {hasOutput && !isStreaming && (
        <div ref={outputRef} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-[#6b7280] tracking-wider uppercase">// Compiled Prompts</h2>
            <div className="flex items-center gap-2">
              {!isFree && (
                <>
                  <button onClick={handleCopyAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1f2937] text-[10px] text-[#6b7280] hover:text-white hover:border-[#374151] transition-all">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy All
                  </button>
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1f2937] text-[10px] text-[#6b7280] hover:text-white hover:border-[#374151] transition-all">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-28 glass border border-[#1f2937] rounded-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button onClick={() => handleExport('json')} className="block w-full text-left px-3 py-1.5 text-[10px] text-[#6b7280] hover:text-white hover:bg-[#0d1117]">Export JSON</button>
                      <button onClick={() => handleExport('md')} className="block w-full text-left px-3 py-1.5 text-[10px] text-[#6b7280] hover:text-white hover:bg-[#0d1117]">Export Markdown</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {[1, 2, 3].map((num) => {
            const key = `p${num}`;
            const content = prompts[key];
            const cfg = STAGE_CONFIG[num];
            if (!content) return null;

            return (
              <div key={num} className="glass rounded-xl border border-[#1f2937] overflow-hidden hover:border-[#374151] transition-all" style={{ borderLeftColor: cfg.accent, borderLeftWidth: 2 }}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#1f2937]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: cfg.bg, border: `1px solid ${cfg.accent}20` }}>
                      <span>{cfg.icon}</span>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#4b5563] tracking-wider font-mono">STAGE {num}</p>
                      <p className="text-xs font-semibold" style={{ color: cfg.accent }}>{cfg.label}</p>
                    </div>
                  </div>
                  <CopyButton content={content} />
                </div>
                <div className="p-5 max-h-[350px] overflow-y-auto">
                  <pre className="text-xs text-[#9ca3af] font-mono whitespace-pre-wrap leading-relaxed">{content}</pre>
                </div>
              </div>
            );
          })}

          {isFree && (
            <div className="glass rounded-xl border border-amber-600/20 p-6 text-center">
              <p className="text-sm text-amber-400 font-semibold mb-1">Upgrade to remove watermark</p>
              <p className="text-xs text-[#6b7280] mb-4">Get unlimited compilations, no watermark, and advanced features.</p>
              <a href="/pricing" className="inline-block px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors">
                Upgrade to Pro
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CopyButton({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] transition-all ${
        copied
          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
          : 'border-[#1f2937] text-[#4b5563] hover:border-[#374151] hover:text-[#9ca3af]'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="20,6 9,17 4,12" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}
