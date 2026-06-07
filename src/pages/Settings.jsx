import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Settings() {
  const { user } = useUser();
  const { getToken } = useAuth();
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

  const handlePortal = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/api/stripe/create-portal-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clerkId: user.id }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      }
    } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-[#6b7280]">Manage your account and billing.</p>
      </div>

      <div className="space-y-6">
        <div className="glass rounded-xl border border-[#1f2937] p-6">
          <h2 className="text-sm font-semibold mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-lg font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-[#6b7280]">{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl border border-[#1f2937] p-6">
          <h2 className="text-sm font-semibold mb-4">Plan & Billing</h2>
          {userData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#6b7280] mb-0.5">Current Plan</p>
                  <p className="text-sm font-semibold capitalize">{userData.tier}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-semibold ${
                  userData.tier === 'free' ? 'bg-[#1f2937] text-[#6b7280]' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {userData.tier === 'free' ? 'Free' : 'Active'}
                </div>
              </div>

              {userData.stripe_customer_id && (
                <button
                  onClick={handlePortal}
                  className="w-full py-2.5 rounded-xl border border-[#1f2937] text-xs font-medium text-[#9ca3af] hover:text-white hover:border-[#374151] transition-all"
                >
                  Manage Billing (Stripe Portal)
                </button>
              )}

              {userData.tier === 'free' && (
                <Link
                  to="/pricing"
                  className="block text-center py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors"
                >
                  Upgrade to Pro
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
