import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { TIERS, FAQ_ITEMS, TESTIMONIALS, EXAMPLES } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Landing() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080a0c] overflow-hidden">
      <Navbar isSignedIn={isSignedIn} navigate={navigate} />
      <HeroSection />
      <LiveDemoSection />
      <FeaturesSection />
      <HowItWorks />
      <TestimonialsSection />
      <PricingSection isSignedIn={isSignedIn} navigate={navigate} />
      <FAQSection />
      <Footer />
    </div>
  );
}

function Navbar({ isSignedIn, navigate }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-[#1f2937]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-white">
            P
          </div>
          <span className="font-bold text-sm tracking-tight">PromptMaster</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-xs text-[#6b7280] hover:text-[#e2e8f0] transition-colors">Features</a>
          <a href="#pricing" className="text-xs text-[#6b7280] hover:text-[#e2e8f0] transition-colors">Pricing</a>
          <a href="#faq" className="text-xs text-[#6b7280] hover:text-[#e2e8f0] transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all duration-200"
            >
              Dashboard
            </button>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-xs font-medium text-[#6b7280] hover:text-white transition-colors">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all duration-200">Get Started Free</button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-amber-500/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-violet-500/8 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-amber-500/3 blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-600/20 bg-amber-500/5 text-amber-400 text-xs font-medium mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Now powering 500+ developers
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-slide-up">
          <span className="text-gradient-white">Turn Any Idea Into a</span>
          <br />
          <span className="text-gradient">Production AI Workflow</span>
        </h1>

        <p className="text-lg md:text-xl text-[#6b7280] max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up animate-delay-100">
          Describe your project once. Get three production-grade prompts —{' '}
          <span className="text-amber-400">Plan</span>,{' '}
          <span className="text-emerald-400">Build</span>,{' '}
          <span className="text-violet-400">Optimize</span> — ready for any AI tool.
        </p>

        <div className="flex items-center justify-center gap-4 animate-slide-up animate-delay-200">
          <SignUpButton mode="modal">
            <button className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 hover:shadow-[0_0_30px_rgba(217,119,6,0.3)] active:scale-[0.98]">
              Start Compiling Free
            </button>
          </SignUpButton>
          <a
            href="#demo"
            className="px-8 py-3.5 glass border-glow rounded-xl text-sm font-medium text-[#9ca3af] hover:text-white transition-all duration-200 hover:border-amber-600/30"
          >
            See Live Demo
          </a>
        </div>

        <div className="mt-12 flex items-center justify-center gap-10 text-[#4b5563] text-xs animate-fade-in animate-delay-500">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polyline points="20,6 9,17 4,12" />
            </svg>
            No credit card
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polyline points="20,6 9,17 4,12" />
            </svg>
            5 free compilations/day
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <polyline points="20,6 9,17 4,12" />
            </svg>
            Cancel anytime
          </span>
        </div>
      </div>
    </section>
  );
}

function LiveDemoSection() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [selectedExample, setSelectedExample] = useState('');

  const handleExample = (ex) => {
    setInput(ex);
    setSelectedExample(ex);
  };

  const handleCompile = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput(null);
    setStreaming('');

    try {
      const res = await fetch(`${API_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'placeholder',
          messages: [{ role: 'user', content: input.trim() }],
        }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

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
            if (parsed.text) {
              full += parsed.text;
              setStreaming(full);
            }
            if (parsed.done) {
              setOutput(parsed.parsed || { p1: 'Demo output — sign in for full access', p2: '', p3: '' });
              setStreaming('');
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error(err);
      setStreaming('');
      setOutput({ p1: 'Demo mode — sign in to compile', p2: '', p3: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="demo" className="relative px-6 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-sm font-semibold text-amber-500 tracking-[0.2em] uppercase mb-3">Live Demo</h2>
          <p className="text-3xl md:text-4xl font-bold">See it in action</p>
        </div>

        <div className="glass rounded-2xl border border-[#1f2937] overflow-hidden glow-amber">
          <div className="p-1 bg-gradient-to-r from-amber-600/20 via-transparent to-violet-600/20" />
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <label className="text-xs text-[#6b7280] mb-3 block font-mono">// DESCRIBE YOUR PROJECT</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your idea, project, or problem..."
                className="w-full min-h-[120px] bg-[#080a0c] border border-[#1f2937] rounded-xl p-4 text-sm text-[#e2e8f0] placeholder-[#374151] focus:outline-none focus:border-amber-600/40 focus:ring-1 focus:ring-amber-600/20 transition-all resize-none font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleExample(ex)}
                  className={`text-[10px] px-3 py-1.5 rounded-lg border transition-all font-mono ${
                    selectedExample === ex
                      ? 'border-amber-600/40 text-amber-400 bg-amber-500/10'
                      : 'border-[#1f2937] text-[#4b5563] hover:border-[#374151] hover:text-[#9ca3af]'
                  }`}
                >
                  {ex.length > 40 ? ex.slice(0, 40) + '...' : ex}
                </button>
              ))}
            </div>

            <button
              onClick={handleCompile}
              disabled={loading || !input.trim()}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-amber-600 hover:bg-amber-500 text-white active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Compiling...
                </span>
              ) : (
                'Compile Prompts'
              )}
            </button>

            {(streaming || output) && (
              <div className="mt-6 space-y-4">
                {streaming && (
                  <div className="glass rounded-xl p-5 border border-amber-600/20">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-mono text-amber-500 tracking-wider">LIVE OUTPUT</span>
                    </div>
                    <pre className="text-xs text-[#6b7280] font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">{streaming}</pre>
                  </div>
                )}
                {output && !streaming && (
                  <>
                    {[1, 2, 3].map((num) => {
                      const key = `p${num}`;
                      const content = output[key];
                      if (!content) return null;
                      return (
                        <div key={num} className="glass rounded-xl p-5 border-l-2 border-l-amber-500 border-[#1f2937]">
                          <div className="text-[10px] font-mono text-amber-500 tracking-wider mb-2">STAGE {num}</div>
                          <pre className="text-xs text-[#6b7280] font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">{content}</pre>
                        </div>
                      );
                    })}
                    <div className="text-center pt-4">
                      <SignUpButton mode="modal">
                        <button className="text-xs text-amber-500 hover:text-amber-400 transition-colors underline underline-offset-4">
                          Sign up free to compile unlimited prompts →
                        </button>
                      </SignUpButton>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Plan",
      subtitle: "ARCHITECTURE PHASE",
      description: "Get a comprehensive architecture blueprint — requirements, tech stack, database design, API structure, and development roadmap.",
      gradient: "from-amber-500/20 to-amber-600/5",
      accent: "text-amber-400",
      border: "border-amber-600/20 hover:border-amber-500/40",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      ),
      title: "Build",
      subtitle: "IMPLEMENTATION PHASE",
      description: "Production-ready implementation instructions with complete code guidance, validation, error handling, and best practices.",
      gradient: "from-emerald-500/20 to-emerald-600/5",
      accent: "text-emerald-400",
      border: "border-emerald-600/20 hover:border-emerald-500/40",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: "Optimize",
      subtitle: "REVIEW PHASE",
      description: "Thorough code review, security audit, performance optimization, edge-case analysis, and production readiness validation.",
      gradient: "from-violet-500/20 to-violet-600/5",
      accent: "text-violet-400",
      border: "border-violet-600/20 hover:border-violet-500/40",
    },
  ];

  return (
    <section id="features" className="relative px-6 pb-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-amber-500 tracking-[0.2em] uppercase mb-3">Features</h2>
          <p className="text-3xl md:text-4xl font-bold mb-4">Three stages to production perfection</p>
          <p className="text-[#6b7280] max-w-xl mx-auto">
            Every compilation goes through our proprietary three-stage pipeline, designed by prompt engineers and refined by thousands of compilations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group relative glass rounded-2xl border ${f.border} transition-all duration-500 hover:-translate-y-1 overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative p-8">
                <div className={`w-12 h-12 rounded-xl bg-[#080a0c] border border-[#1f2937] flex items-center justify-center mb-6 ${f.accent} group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <div className={`text-[10px] font-semibold tracking-[0.2em] mb-2 ${f.accent}`}>{f.subtitle}</div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Describe Your Idea', desc: 'Type or paste your project idea, problem, or concept in plain English. One sentence or a full spec — PromptMaster handles it all.' },
    { num: '02', title: 'AI Compiles Your Prompts', desc: 'Our engine analyzes your input and generates three interconnected, production-grade prompts using LLaMA 3.3 70B.' },
    { num: '03', title: 'Execute With Any AI Tool', desc: 'Copy, paste, and run your prompts in ChatGPT, Claude, Cursor, Windsurf, Copilot, or any AI system. Start building immediately.' },
  ];

  return (
    <section className="relative px-6 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-amber-500 tracking-[0.2em] uppercase mb-3">How It Works</h2>
          <p className="text-3xl md:text-4xl font-bold">From idea to execution in 3 steps</p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-[120px] top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/30 via-amber-500/10 to-transparent" />
          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={i} className="relative flex items-start gap-8">
                <div className="hidden md:flex w-16 h-16 rounded-2xl glass border border-[#1f2937] items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-gradient">{step.num}</span>
                </div>
                <div className="glass rounded-2xl p-8 border border-[#1f2937] flex-1 hover:border-amber-600/20 transition-all duration-300">
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="relative px-6 pb-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-amber-500 tracking-[0.2em] uppercase mb-3">Testimonials</h2>
          <p className="text-3xl md:text-4xl font-bold">Loved by developers worldwide</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="glass rounded-2xl p-8 border border-[#1f2937] hover:border-amber-600/20 transition-all duration-300">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-[#6b7280]">{t.role}</div>
                </div>
              </div>
              <p className="text-sm text-[#9ca3af] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection({ isSignedIn, navigate }) {
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (tier) => {
    if (!isSignedIn) {
      return navigate('/auth/sign-up');
    }
    setLoading(tier.name);
    try {
      await new Promise(r => setTimeout(r, 800));
      alert(`Stripe Checkout for ${tier.name} tier — configure STRIPE_SECRET_KEY and price IDs to activate.`);
    } catch {
      //
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="relative px-6 pb-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-amber-500 tracking-[0.2em] uppercase mb-3">Pricing</h2>
          <p className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</p>
          <p className="text-[#6b7280] max-w-xl mx-auto">Start free. Upgrade when you need more power. No hidden fees.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border transition-all duration-300 ${
                tier.featured
                  ? 'border-amber-600/40 bg-gradient-to-b from-amber-500/5 to-[#0d1117] scale-[1.02] md:scale-105 glow-amber'
                  : 'glass border-[#1f2937] hover:border-[#374151]'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-600 to-amber-500 rounded-full text-[10px] font-semibold text-white tracking-wider">
                  MOST POPULAR
                </div>
              )}
              <div className="p-8">
                <h3 className={`text-lg font-bold mb-2 ${tier.featured ? 'text-amber-400' : ''}`}>{tier.name}</h3>
                <p className="text-sm text-[#6b7280] mb-6">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-sm text-[#6b7280]">{tier.period}</span>
                </div>

                <button
                  onClick={() => handleCheckout(tier)}
                  disabled={loading === tier.name}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 mb-8 ${
                    tier.featured
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.2)]'
                      : 'glass border border-[#1f2937] hover:border-amber-600/30 text-[#9ca3af] hover:text-white'
                  } ${loading === tier.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === tier.name ? 'Redirecting...' : !tier.priceId ? tier.cta : 'Subscribe'}
                </button>

                <ul className="space-y-3">
                  {tier.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-[#9ca3af]">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="relative px-6 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-amber-500 tracking-[0.2em] uppercase mb-3">FAQ</h2>
          <p className="text-3xl md:text-4xl font-bold">Frequently asked questions</p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="glass rounded-xl border border-[#1f2937] overflow-hidden transition-all duration-300 hover:border-[#374151]">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-medium pr-4">{item.q}</span>
                <svg
                  className={`w-4 h-4 text-[#6b7280] shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="px-5 pb-5 text-sm text-[#6b7280] leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1f2937] px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-white">P</div>
              <span className="font-bold text-sm">PromptMaster</span>
            </div>
            <p className="text-sm text-[#6b7280] max-w-sm">
              Transform any idea into production-grade AI execution workflows. Plan, Build, Optimize — in 60 seconds.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#4b5563] tracking-wider uppercase mb-4">Product</h4>
            <div className="space-y-2">
              <a href="#features" className="block text-sm text-[#6b7280] hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="block text-sm text-[#6b7280] hover:text-white transition-colors">Pricing</a>
              <a href="#demo" className="block text-sm text-[#6b7280] hover:text-white transition-colors">Live Demo</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#4b5563] tracking-wider uppercase mb-4">Company</h4>
            <div className="space-y-2">
              <span className="block text-sm text-[#6b7280]">Twitter / X</span>
              <span className="block text-sm text-[#6b7280]">GitHub</span>
              <span className="block text-sm text-[#6b7280]">hello@promptmaster.dev</span>
            </div>
          </div>
        </div>
        <div className="border-t border-[#1f2937] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4b5563]">&copy; 2026 PromptMaster. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-[#4b5563]">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
