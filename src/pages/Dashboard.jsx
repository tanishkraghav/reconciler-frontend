import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';
import api from '../utils/api';

const fmt = (n) => '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary]     = useState(null);
  const [ledger, setLedger]       = useState([]);
  const [tab, setTab]             = useState('bank');
  const [statusFilter, setStatus] = useState('');
  const [catFilter, setCat]       = useState('');
  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState(null);
  const [reconciling, setRecon]   = useState(false);
  const [reconMsg, setReconMsg]   = useState('');
  const [adding, setAdding]       = useState(false);
  const [form, setForm]           = useState({ date: '', description: '', amount: '', reference: '', source: 'bank', category: '' });
  const [formErr, setFormErr]     = useState('');
  const [loading, setLoading]     = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [sumRes, ledRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get(`/transactions/ledger?source=${tab === 'all' ? 'bank' : tab}`)
      ]);
      setSummary(sumRes.data);
      setLedger(ledRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { loadData(); }, [loadData]);

  const reconcile = async () => {
    setRecon(true); setReconMsg('');
    try {
      const { data } = await api.post('/transactions/reconcile');
      setReconMsg(`✓ Matched ${data.matched} pairs · ${data.unmatched} unmatched · ${data.exceptions} exceptions`);
      await loadData();
    } catch (e) { setReconMsg('Reconciliation failed'); }
    finally { setRecon(false); }
  };

  const deleteTx = async (id) => {
    try { await api.delete(`/transactions/${id}`); setExpanded(null); await loadData(); }
    catch (e) { console.error(e); }
  };

  const addTx = async (e) => {
    e.preventDefault(); setFormErr('');
    try {
      await api.post('/transactions', { ...form, amount: parseFloat(form.amount) });
      setAdding(false);
      setForm({ date: '', description: '', amount: '', reference: '', source: 'bank', category: '' });
      await loadData();
    } catch (err) { setFormErr(err.response?.data?.message || 'Failed to add'); }
  };

  const filtered = ledger.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (catFilter && r.category !== catFilter) return false;
    if (search && !r.description.toLowerCase().includes(search.toLowerCase()) &&
        !(r.reference || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const cats = [...new Set(ledger.map(t => t.category).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="px-8 py-4 border-b border-border flex items-center gap-4 sticky top-0 bg-bg/92 backdrop-blur z-10">
        <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center font-mono font-semibold text-black text-base flex-shrink-0">₹≋</div>
        <div>
          <h1 className="text-base font-bold text-white leading-none">Reconciler</h1>
          <span className="text-[11px] text-muted font-mono">Transaction Reconciliation Engine</span>
        </div>
        <div className="flex-1" />
        <span className="text-sm text-muted hidden sm:block">Hi, {user?.name}</span>
        <button onClick={() => navigate('/import')} className="px-4 py-2 rounded-lg bg-border text-sm font-semibold text-white hover:bg-[#2e3540] transition-colors">↑ Import CSV</button>
        <button onClick={() => setAdding(true)} className="px-4 py-2 rounded-lg bg-accent text-black text-sm font-bold hover:bg-[#00fdb5] transition-colors">+ Add</button>
        <button onClick={logout} className="text-muted hover:text-white text-sm transition-colors">Logout</button>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-7">
        {/* Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
            {[
              { label: 'Matched', value: summary.by_status?.matched || 0, sub: 'Reconciled pairs', color: 'border-t-accent' },
              { label: 'Unmatched', value: summary.by_status?.unmatched || 0, sub: 'Needs review', color: 'border-t-warn' },
              { label: 'Exceptions', value: summary.by_status?.exception || 0, sub: 'No reference', color: 'border-t-danger' },
              { label: 'Bank Balance', value: fmt(summary.bank_balance || 0), sub: `Variance: ${summary.variance === 0 ? 'None' : fmt(summary.variance)}`, color: 'border-t-accent2' },
            ].map(s => (
              <div key={s.label} className={`bg-card border border-border border-t-2 ${s.color} rounded-xl p-5`}>
                <div className="text-[11px] text-muted uppercase tracking-widest font-mono">{s.label}</div>
                <div className="text-3xl font-extrabold text-white mt-1.5 mb-1 leading-none">{s.value}</div>
                <div className="text-xs text-muted">{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Reconcile banner */}
        <div className="bg-gradient-to-r from-[#0d2620] to-[#0c1a2e] border border-[#1a3d2c] rounded-xl p-4 mb-6 flex items-center gap-4">
          <span className="text-2xl">🔄</span>
          <div>
            <p className="text-sm font-bold text-white">Run Reconciliation</p>
            <p className="text-xs text-muted">Match bank vs internal transactions automatically</p>
          </div>
          <div className="flex-1" />
          {reconMsg && <span className="text-xs text-accent font-mono hidden md:block">{reconMsg}</span>}
          <button onClick={reconcile} disabled={reconciling}
            className="px-5 py-2 bg-accent hover:bg-[#00fdb5] text-black font-bold rounded-lg text-sm transition-colors disabled:opacity-50 flex-shrink-0">
            {reconciling ? 'Running…' : 'Reconcile Now'}
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex bg-surface border border-border rounded-xl p-1 gap-1">
            {['bank', 'internal', 'all'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-border text-white' : 'text-muted'}`}>
                {t === 'bank' ? '🏦 Bank' : t === 'internal' ? '📒 Internal' : 'All'}
              </button>
            ))}
          </div>
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            className="bg-surface border border-border text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-accent">
            <option value="">All Statuses</option>
            {['matched','unmatched','exception','duplicate','pending'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
            ))}
          </select>
          <select value={catFilter} onChange={e => setCat(e.target.value)}
            className="bg-surface border border-border text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-accent">
            <option value="">All Categories</option>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search description or ref…"
            className="bg-surface border border-border text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-accent min-w-[200px]" />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <span className="font-bold text-white text-sm">{tab === 'bank' ? 'Bank Ledger' : tab === 'internal' ? 'Internal Ledger' : 'All Transactions'}</span>
            <span className="text-xs text-muted font-mono bg-surface border border-border px-3 py-1 rounded-full">{filtered.length} entries</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-muted text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-muted text-sm">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {['Date','Description','Category','Debit','Credit','Balance','Status'].map(h => (
                      <th key={h} className={`px-4 py-2.5 text-[11px] text-muted uppercase tracking-wider font-medium ${['Debit','Credit','Balance'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <>
                      <tr key={r.id} onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                        className="border-b border-border hover:bg-white/[.025] cursor-pointer transition-colors">
                        <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium max-w-[200px]">
                          <div className="truncate">{r.description}</div>
                          {r.reference && <div className="text-[11px] text-muted font-mono">{r.reference}</div>}
                        </td>
                        <td className="px-4 py-3">
                          {r.category && <span className="text-[11px] bg-surface border border-border rounded-full px-2.5 py-0.5 text-muted">{r.category}</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-danger">{r.debit ? fmt(r.debit) : ''}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-accent">{r.credit ? fmt(r.credit) : ''}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-muted">{fmt(r.balance)}</td>
                        <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                      </tr>
                      {expanded === r.id && (
                        <tr key={r.id + '-exp'} className="bg-surface border-b border-border">
                          <td colSpan={7} className="px-5 py-3">
                            <div className="flex flex-wrap gap-5 items-center">
                              <div><div className="text-[10px] text-muted uppercase tracking-wider">ID</div><div className="text-xs text-white font-mono">{r.id}</div></div>
                              <div><div className="text-[10px] text-muted uppercase tracking-wider">Amount</div><div className="text-xs text-white font-mono">{fmt(r.debit || r.credit)}</div></div>
                              <div><div className="text-[10px] text-muted uppercase tracking-wider">Status</div><div className="text-xs text-white font-mono">{r.status}</div></div>
                              {r.matched_id && <div><div className="text-[10px] text-muted uppercase tracking-wider">Matched With</div><div className="text-xs text-white font-mono">{r.matched_id}</div></div>}
                              <div className="flex-1" />
                              <button onClick={() => deleteTx(r.id)}
                                className="px-3 py-1.5 bg-[#2a1316] border border-[#3d1a1e] text-danger text-xs rounded-lg hover:bg-[#3d1a1e] transition-colors">
                                🗑 Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={e => e.target === e.currentTarget && setAdding(false)}>
          <div className="bg-card border border-border rounded-2xl p-7 w-full max-w-md">
            <h2 className="text-base font-bold text-white mb-5">Add Transaction</h2>
            {formErr && <div className="bg-[#2a1316] border border-[#3d1a1e] text-danger text-xs rounded-lg px-3 py-2 mb-4">{formErr}</div>}
            <form onSubmit={addTx} className="space-y-4">
              <div className="flex gap-3">
                {['bank','internal'].map(s => (
                  <button type="button" key={s} onClick={() => setForm(f => ({ ...f, source: s }))}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${form.source === s ? 'border-accent text-accent bg-[#0d2620]' : 'border-border text-muted bg-surface'}`}>
                    {s === 'bank' ? '🏦 Bank' : '📒 Internal'}
                  </button>
                ))}
              </div>
              {[
                { label: 'Date', key: 'date', type: 'date', required: true },
                { label: 'Description', key: 'description', type: 'text', required: true, placeholder: 'e.g. NEFT/SALARY' },
                { label: 'Amount (negative = debit)', key: 'amount', type: 'number', required: true, placeholder: '-1500 or 85000' },
                { label: 'Reference (optional)', key: 'reference', type: 'text', placeholder: 'REF12345' },
                { label: 'Category (optional)', key: 'category', type: 'text', placeholder: 'Income, Food, Housing…' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] text-muted uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input type={f.type} required={f.required} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-accent transition-colors" />
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 bg-accent hover:bg-[#00fdb5] text-black font-bold py-2.5 rounded-lg text-sm transition-colors">Add Transaction</button>
                <button type="button" onClick={() => setAdding(false)} className="px-5 py-2.5 bg-border text-white text-sm font-semibold rounded-lg hover:bg-[#2e3540] transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
