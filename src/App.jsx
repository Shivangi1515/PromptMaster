import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth, useUser, SignInButton } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import Compile from './pages/Compile';
import History from './pages/History';
import Settings from './pages/Settings';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || '';

function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080a0c]">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout />;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/compile', label: 'Compile', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { path: '/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/pricing', label: 'Pricing', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

function DashboardLayout() {
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);

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
  const usage = userData?.usage || { used: 0, remaining: 5, limit: 5 };
  const usagePercent = usage.limit > 0 ? Math.round((usage.used / usage.limit) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080a0c] flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass border-r border-[#1f2937] transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative`}>
        <div className="flex flex-col h-full p-4">
          <Link to="/dashboard" className="flex items-center gap-2 mb-8 px-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-sm font-bold text-white">P</div>
            <span className="font-bold text-sm">PromptMaster</span>
          </Link>

          {isFree && (
            <div className="mx-3 mb-6 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-600/20">
              <p className="text-[10px] text-amber-400 font-semibold mb-1">FREE TIER</p>
              <p className="text-[10px] text-[#6b7280] mb-2">{usage.used} of {usage.limit} compilations used today</p>
              <div className="h-1.5 rounded-full bg-[#1f2937] overflow-hidden mb-2">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
              </div>
              <Link to="/pricing" className="block text-center text-[10px] font-semibold py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors">
                Upgrade to Pro
              </Link>
            </div>
          )}

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-600/20'
                      : 'text-[#6b7280] hover:text-[#e2e8f0] hover:bg-[#0d1117]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#1f2937] pt-4 px-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.fullName || user?.emailAddresses?.[0]?.emailAddress}</p>
                <p className="text-[10px] text-[#4b5563] capitalize">{userData?.tier || 'free'} tier</p>
              </div>
            </div>
            <button onClick={() => signOut()} className="w-full text-left text-[10px] text-[#4b5563] hover:text-red-400 transition-colors py-1.5">
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 glass border-b border-[#1f2937] px-6 h-14 flex items-center justify-between lg:justify-end shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[#0d1117] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {isFree && (
            <Link to="/pricing" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600/10 border border-amber-600/20 text-amber-400 text-[10px] font-semibold hover:bg-amber-600/20 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {usage.remaining} compilations remaining — Upgrade
            </Link>
          )}
        </header>

        <div className="flex-1 p-6">
          <Outlet context={{ userData, setUserData }} />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<DashboardHome />} />
        </Route>
        <Route path="/compile" element={<ProtectedRoute />}>
          <Route index element={<Compile />} />
        </Route>
        <Route path="/history" element={<ProtectedRoute />}>
          <Route index element={<History />} />
        </Route>
        <Route path="/settings" element={<ProtectedRoute />}>
          <Route index element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function DashboardHome() {
  const { user } = useUser();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${API_URL}/api/history?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRecent(data.compilations || []);
        }
      } catch {}
    };
    fetchRecent();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-[#6b7280]">Welcome back. Start a new compilation or pick up where you left off.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Link to="/compile" className="glass rounded-xl p-5 border border-[#1f2937] hover:border-amber-600/20 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold mb-1">New Compilation</h3>
          <p className="text-[11px] text-[#6b7280]">Turn your idea into prompts</p>
        </Link>

        <Link to="/history" className="glass rounded-xl p-5 border border-[#1f2937] hover:border-emerald-600/20 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold mb-1">View History</h3>
          <p className="text-[11px] text-[#6b7280]">Browse past compilations</p>
        </Link>

        <Link to="/pricing" className="glass rounded-xl p-5 border border-[#1f2937] hover:border-violet-600/20 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold mb-1">Upgrade Plan</h3>
          <p className="text-[11px] text-[#6b7280]">Unlock unlimited access</p>
        </Link>
      </div>

      {recent.length > 0 && (
        <div className="glass rounded-xl border border-[#1f2937] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Compilations</h2>
            <Link to="/history" className="text-[10px] text-amber-500 hover:text-amber-400 transition-colors">View all →</Link>
          </div>
          <div className="space-y-2">
            {recent.map((c) => (
              <Link key={c.id} to={`/history`} className="block p-3 rounded-xl hover:bg-[#0d1117] border border-transparent hover:border-[#1f2937] transition-all">
                <p className="text-xs font-medium truncate">{c.input.slice(0, 80)}</p>
                <p className="text-[10px] text-[#4b5563] mt-0.5">{new Date(c.created_at).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
