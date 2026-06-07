import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, SignUpButton } from '@clerk/clerk-react';
import { TIERS } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Pricing() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (tier) => {
    if (!isSignedIn) {
      return navigate('/');
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
    <div className="min-h-screen bg-[#080a0c]">
      <header className="glass border-b border-[#1f2937] px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-white">P</div>
          <span className="font-bold text-sm">PromptMaster</span>
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-sm font-semibold text-amber-500 tracking-[0.2em] uppercase mb-3">Pricing</h1>
          <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-[#6b7280] max-w-xl mx-auto">Start free. Upgrade when you need more power. No hidden fees, cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
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

                {tier.priceId ? (
                  <button
                    onClick={() => handleCheckout(tier)}
                    disabled={loading === tier.name}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 mb-8 ${
                      tier.featured
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'glass border border-[#1f2937] hover:border-amber-600/30 text-[#9ca3af] hover:text-white'
                    } ${loading === tier.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === tier.name ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Redirecting...
                      </span>
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 mb-8 glass border border-[#1f2937] hover:border-amber-600/30 text-[#9ca3af] hover:text-white">
                      {tier.cta}
                    </button>
                  </SignUpButton>
                )}

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
    </div>
  );
}
