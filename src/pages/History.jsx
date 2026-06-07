import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function History() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [compilations, setCompilations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const limit = 10;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const params = new URLSearchParams({ page, limit });
      if (search) params.set('search', search);
      const res = await fetch(`${API_URL}/api/history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCompilations(data.compilations || []);
        setTotal(data.total || 0);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchHistory(); }, [page, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleDelete = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCompilations(prev => prev.filter(c => c.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch {}
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">History</h1>
        <p className="text-sm text-[#6b7280]">Browse and manage your past compilations.</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search compilations..."
            className="w-full bg-[#0d1117] border border-[#1f2937] rounded-xl py-3 pl-10 pr-4 text-sm text-[#e2e8f0] placeholder-[#374151] focus:outline-none focus:border-amber-600/40 transition-all"
          />
        </div>
      </form>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : compilations.length === 0 ? (
            <div className="glass rounded-xl border border-[#1f2937] p-10 text-center">
              <p className="text-sm text-[#6b7280] mb-2">No compilations yet</p>
              <a href="/compile" className="text-xs text-amber-500 hover:text-amber-400 transition-colors">Create your first compilation →</a>
            </div>
          ) : (
            compilations.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`glass rounded-xl p-4 border cursor-pointer transition-all ${
                  selected?.id === c.id ? 'border-amber-600/40' : 'border-[#1f2937] hover:border-[#374151]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{c.input.slice(0, 100)}</p>
                    <p className="text-[10px] text-[#4b5563] mt-1">{new Date(c.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                    className="text-[#4b5563] hover:text-red-400 transition-colors shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-[#1f2937] text-[10px] text-[#6b7280] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-[10px] text-[#4b5563]">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-[#1f2937] text-[10px] text-[#6b7280] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div>
          {selected ? (
            <div className="glass rounded-xl border border-[#1f2937] p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-[#4b5563] font-mono">{new Date(selected.created_at).toLocaleString()}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(`INPUT\n${selected.input}\n\nPROMPT 1\n${selected.p1}\n\nPROMPT 2\n${selected.p2}\n\nPROMPT 3\n${selected.p3}`)}
                  className="text-[10px] px-3 py-1.5 rounded-lg border border-[#1f2937] text-[#6b7280] hover:text-white transition-all"
                >
                  Copy All
                </button>
              </div>

              <div className="mb-4 p-3 rounded-lg bg-[#080a0c] border border-[#1f2937]">
                <p className="text-[10px] text-[#4b5563] font-mono mb-1">INPUT</p>
                <p className="text-xs text-[#6b7280]">{selected.input}</p>
              </div>

              <div className="space-y-4">
                {selected.p1 && (
                  <div className="border-l-2 border-l-amber-500 pl-4">
                    <p className="text-[10px] font-mono text-amber-500 mb-1">STAGE 1 — PLANNING</p>
                    <pre className="text-xs text-[#9ca3af] font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">{selected.p1}</pre>
                  </div>
                )}
                {selected.p2 && (
                  <div className="border-l-2 border-l-emerald-500 pl-4">
                    <p className="text-[10px] font-mono text-emerald-500 mb-1">STAGE 2 — IMPLEMENTATION</p>
                    <pre className="text-xs text-[#9ca3af] font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">{selected.p2}</pre>
                  </div>
                )}
                {selected.p3 && (
                  <div className="border-l-2 border-l-violet-500 pl-4">
                    <p className="text-[10px] font-mono text-violet-500 mb-1">STAGE 3 — REVIEW</p>
                    <pre className="text-xs text-[#9ca3af] font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">{selected.p3}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl border border-[#1f2937] p-10 text-center sticky top-20">
              <svg className="w-10 h-10 text-[#1f2937] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm text-[#6b7280]">Select a compilation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
