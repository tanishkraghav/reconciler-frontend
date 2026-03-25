import { useState, useEffect } from 'react';
import Layout from '../components/layout/layout';
import api from '../utils/api';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions/summary').then(r => setStats(r.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Transactions', value: stats.total, icon: '📋', color: '#4d9fff' },
    { label: 'Matched', value: stats.by_status?.matched || 0, icon: '✅', color: '#00e5a0' },
    { label: 'Unmatched', value: stats.by_status?.unmatched || 0, icon: '⚠️', color: '#ffb830' },
    { label: 'Exceptions', value: stats.by_status?.exception || 0, icon: '🚨', color: '#ff5c6a' },
    { label: 'Bank Balance', value: '$' + Math.abs(stats.bank_balance || 0).toLocaleString(), icon: '🏦', color: '#00e5a0' },
    { label: 'Variance', value: stats.variance === 0 ? 'None' : '$' + Math.abs(stats.variance).toLocaleString(), icon: '📊', color: stats.variance === 0 ? '#00e5a0' : '#ff5c6a' },
  ] : [];

  const categories = stats?.by_category ? Object.entries(stats.by_category).sort((a,b) => b[1].count - a[1].count) : [];

  return (
    <Layout>
      <div className="px-8 py-7 max-w-5xl">
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-extrabold text-white">Admin Portal</h1>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#12172a] text-[#4d9fff] border border-[#1a2a4a]">Admin</span>
          </div>
          <p className="text-sm text-[#5a6270]">System overview and management tools</p>
        </div>

        {loading ? <div className="py-16 text-center text-[#5a6270]">Loading…</div> : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {cards.map(c => (
                <div key={c.label} className="bg-[#191d22] border border-[#252a32] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-[#5a6270] uppercase tracking-widest font-mono">{c.label}</span>
                    <span className="text-lg">{c.icon}</span>
                  </div>
                  <div className="text-2xl font-extrabold" style={{ color: c.color }}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            {categories.length > 0 && (
              <div className="bg-[#191d22] border border-[#252a32] rounded-2xl overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-[#252a32]">
                  <span className="text-sm font-bold text-white">Spending by Category</span>
                </div>
                <div className="divide-y divide-[#252a32]">
                  {categories.map(([cat, data]) => (
                    <div key={cat} className="flex items-center gap-4 px-5 py-3">
                      <span className="text-sm text-white flex-1">{cat}</span>
                      <span className="text-xs text-[#5a6270] font-mono">{data.count} transactions</span>
                      <span className={`text-sm font-mono font-semibold ${data.total < 0 ? 'text-[#ff5c6a]' : 'text-[#00e5a0]'}`}>
                        {data.total < 0 ? '-' : '+'}${Math.abs(data.total).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System info */}
            <div className="bg-[#191d22] border border-[#252a32] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-4">System Info</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['API Status', '🟢 Live'],
                  ['Database', '🟢 MongoDB Atlas'],
                  ['Auth', '🟢 JWT Active'],
                  ['Environment', '🟢 Production'],
                  ['Backend', 'Node/Express v2.0'],
                  ['Frontend', 'React + Vite'],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between items-center p-3 bg-[#13161a] border border-[#252a32] rounded-lg">
                    <span className="text-xs text-[#5a6270]">{k}</span>
                    <span className="text-xs text-white font-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
