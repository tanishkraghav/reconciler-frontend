import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/layout';
import StatusPill from '../components/StatusPill';
import api from '../utils/api';

const fmt = (n, currency = 'USD') => {
  const symbols = { USD:'$', GBP:'£', EUR:'€', INR:'₹', AUD:'A$', CAD:'C$', SGD:'S$', AED:'AED ' };
  return (symbols[currency] || currency + ' ') + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currency = localStorage.getItem('reconciler_currency') || 'USD';

  const [summary, setSummary]   = useState(null);
  const [ledger, setLedger]     = useState([]);
  const [tab, setTab]           = useState('bank');
  const [statusF, setStatusF]   = useState('');
  const [catF, setCatF]         = useState('');
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null);
  const [reconciling, setRecon] = useState(false);
  const [reconMsg, setReconMsg] = useState('');
  const [adding, setAdding]     = useState(false);
  const [form, setForm]         = useState({ date: '', description: '', amount: '', reference: '', source: 'bank', category: '' });
  const [formErr, setFormErr]   = useState('');
  const [loading, setLoading]   = useState(true);

  const loadData = useCallback(async () => {
    try {
      const src = tab === 'all' ? 'bank' : tab;
      const [s, l] = await Promise.all([
        api.get('/transactions/summary'),
        api.get(`/transactions/ledger?source=${src}`)
      ]);
      setSummary(s.data); setLedger(l.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { loadData(); }, [loadData]);

  const reconcile = async () => {
    setRecon(true); setReconMsg('');
    try {
      const { data } = await api.post('/transactions/reconcile');
      setReconMsg(`✓ Matched ${data.matched} · ${data.unmatched} unmatched · ${data.exceptions} exceptions`);
      await loadData();
    } catch { setReconMsg('Failed'); } finally { setRecon(false); }
  };

  const deleteTx = async (id) => {
    try { await api.delete(`/transactions/${id}`); setExpanded(null); await loadData(); } catch {}
  };

  const addTx = async (e) => {
    e.preventDefault(); setFormErr('');
    try {
      await api.post('/transactions', { ...form, amount: parseFloat(form.amount) });
      setAdding(false);
      setForm({ date: '', description: '', amount: '', reference: '', source: 'bank', category: '' });
      await loadData();
    } catch (err) { setFormErr(err.response?.data?.message || 'Failed'); }
  };

  const filtered = ledger.filter(r => {
    if (statusF && r.status !== statusF) return false;
    if (catF && r.category !== catF) return false;
    if (search && !r.description.toLowerCase().includes(search.toLowerCase()) &&
        !(r.reference||'').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const cats = [...new Set(ledger.map(t => t.category).filter(Boolean))].sort();

  return (
    <Layout>
      <div className="px-8 py-7 max-w-6xl">

        {/* Page title */}
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
          <p className="text-sm text-[#5a6270] mt-1">Your transaction reconciliation overview</p>
        </div>

        {/* Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
            {[
              { label: 'Matched',      value: summary.by_status?.matched || 0,   sub: 'Reconciled pairs',  color: '#00e5a0' },
              { label: 'Unmatched',    value: summary.by_status?.unmatched || 0, sub: 'Needs review',      color: '#ffb830' },
              { label: 'Exceptions',   value: summary.by_status?.exception || 0, sub: 'No reference',      color: '#ff5c6a' },
              { label: 'Bank Balance', value: fmt(summary.bank_balance || 0, currency), sub: `Variance: ${summary.variance === 0 ? 'None' : fmt(summary.variance, currency)}`, color: '#4d9fff' },
            ].map(s => (
              <div key={s.label} className="bg-[#191d22] border border-[#252a32] rounded-xl p-5" style={{ borderTopColor: s.color, borderTopWidth: 2 }}>
                <div className="text-[11px] text-[#5a6270] uppercase tracking-widest font-mono">{s.label}</div>
                <div className="text-3xl font-extrabold mt-1.5 mb-1 leading-none" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-[#5a6270]">{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Reconcile banner */}
        <div className="bg-gradient-to-r from-[#0d2620] to-[#0c1a2e] border border-[#1a3d2c] rounded-xl p-4 mb-6 flex items-center gap-4">
          <span className="text-2xl">🔄</span>
          <div>
            <p className="text-sm font-bold text-white">Run Reconciliation</p>
            <p className="text-xs text-[#5a6270]">Auto-match bank vs internal transactions</p>
          </div>
          <div className="flex-1" />
          {reconMsg && <span className="text-xs text-[#00e5a0] font-mono hidden md:block">{reconMsg}</span>}
          <button onClick={reconcile} disabled={reconciling}
            className="px-5 py-2 bg-[#00e5a0] hover:bg-[#00fdb5] text-black font-bold rounded-lg text-sm transition-colors disabled:opacity-50 flex-shrink-0">
            {reconciling ? 'Running…' : 'Reconcile Now'}
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex bg-[#13161a] border border-[#252a32] rounded-xl p-1 gap-1">
            {['bank','internal','all'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab===t?'bg-[#252a32] text-white':'text-[#5a6270]'}`}>
                {t==='bank'?'🏦 Bank':t==='internal'?'📒 Internal':'All'}
              </button>
            ))}
          </div>
          <select value={statusF} onChange={e=>setStatusF(e.target.value)}
            className="bg-[#13161a] border border-[#252a32] text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-[#00e5a0]">
            <option value="">All Statuses</option>
            {['matched','unmatched','exception','duplicate','pending'].map(s=>(
              <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
            ))}
          </select>
          <select value={catF} onChange={e=>setCatF(e.target.value)}
            className="bg-[#13161a] border border-[#252a32] text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-[#00e5a0]">
            <option value="">All Categories</option>
            {cats.map(c=><option key={c}>{c}</option>)}
          </select>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            className="bg-[#13161a] border border-[#252a32] text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-[#00e5a0] min-w-[180px]" />
          <div className="flex-1" />
          <button onClick={()=>setAdding(true)}
            className="px-4 py-2 bg-[#00e5a0] text-black text-sm font-bold rounded-lg hover:bg-[#00fdb5] transition-colors">
            + Add Transaction
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#191d22] border border-[#252a32] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#252a32]">
            <span className="font-bold text-white text-sm">{tab==='bank'?'Bank Ledger':tab==='internal'?'Internal Ledger':'All Transactions'}</span>
            <span className="text-xs text-[#5a6270] font-mono bg-[#13161a] border border-[#252a32] px-3 py-1 rounded-full">{filtered.length} entries</span>
          </div>
          {loading ? (
            <div className="py-16 text-center text-[#5a6270] text-sm">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center"><div className="text-4xl mb-3">🔍</div><p className="text-[#5a6270] text-sm">No transactions found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#252a32]">
                    {['Date','Description','Category','Debit','Credit','Balance','Status'].map(h=>(
                      <th key={h} className={`px-4 py-2.5 text-[11px] text-[#5a6270] uppercase tracking-wider font-medium ${['Debit','Credit','Balance'].includes(h)?'text-right':'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r=>(
                    <>
                      <tr key={r.id} onClick={()=>setExpanded(expanded===r.id?null:r.id)}
                        className="border-b border-[#252a32] hover:bg-white/[.025] cursor-pointer transition-colors">
                        <td className="px-4 py-3 text-xs text-[#5a6270] font-mono whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium max-w-[200px]">
                          <div className="truncate">{r.description}</div>
                          {r.reference&&<div className="text-[11px] text-[#5a6270] font-mono">{r.reference}</div>}
                        </td>
                        <td className="px-4 py-3">{r.category&&<span className="text-[11px] bg-[#13161a] border border-[#252a32] rounded-full px-2.5 py-0.5 text-[#5a6270]">{r.category}</span>}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-[#ff5c6a]">{r.debit?fmt(r.debit,currency):''}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-[#00e5a0]">{r.credit?fmt(r.credit,currency):''}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-[#5a6270]">{fmt(r.balance,currency)}</td>
                        <td className="px-4 py-3"><StatusPill status={r.status}/></td>
                      </tr>
                      {expanded===r.id&&(
                        <tr key={r.id+'-exp'} className="bg-[#13161a] border-b border-[#252a32]">
                          <td colSpan={7} className="px-5 py-3">
                            <div className="flex flex-wrap gap-5 items-center">
                              <div><div className="text-[10px] text-[#5a6270] uppercase tracking-wider">ID</div><div className="text-xs text-white font-mono">{r.id}</div></div>
                              <div><div className="text-[10px] text-[#5a6270] uppercase tracking-wider">Status</div><div className="text-xs text-white font-mono">{r.status}</div></div>
                              {r.matched_id&&<div><div className="text-[10px] text-[#5a6270] uppercase tracking-wider">Matched With</div><div className="text-xs text-white font-mono">{r.matched_id}</div></div>}
                              <div className="flex-1"/>
                              <button onClick={()=>deleteTx(r.id)} className="px-3 py-1.5 bg-[#2a1316] border border-[#3d1a1e] text-[#ff5c6a] text-xs rounded-lg hover:bg-[#3d1a1e] transition-colors">🗑 Delete</button>
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

      {/* Add Modal */}
      {adding&&(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={e=>e.target===e.currentTarget&&setAdding(false)}>
          <div className="bg-[#191d22] border border-[#252a32] rounded-2xl p-7 w-full max-w-md">
            <h2 className="text-base font-bold text-white mb-5">Add Transaction</h2>
            {formErr&&<div className="bg-[#2a1316] border border-[#3d1a1e] text-[#ff5c6a] text-xs rounded-lg px-3 py-2 mb-4">{formErr}</div>}
            <form onSubmit={addTx} className="space-y-4">
              <div className="flex gap-3">
                {['bank','internal'].map(s=>(
                  <button type="button" key={s} onClick={()=>setForm(f=>({...f,source:s}))}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${form.source===s?'border-[#00e5a0] text-[#00e5a0] bg-[#0d2620]':'border-[#252a32] text-[#5a6270] bg-[#13161a]'}`}>
                    {s==='bank'?'🏦 Bank':'📒 Internal'}
                  </button>
                ))}
              </div>
              {[
                {label:'Date',key:'date',type:'date',req:true},
                {label:'Description',key:'description',type:'text',req:true,ph:'e.g. NEFT/SALARY'},
                {label:'Amount (negative = debit)',key:'amount',type:'number',req:true,ph:'-1500 or 85000'},
                {label:'Reference (optional)',key:'reference',type:'text',ph:'REF12345'},
                {label:'Category (optional)',key:'category',type:'text',ph:'Income, Food…'},
              ].map(f=>(
                <div key={f.key}>
                  <label className="block text-[11px] text-[#5a6270] uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input type={f.type} required={f.req} placeholder={f.ph} value={form[f.key]}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                    className="w-full bg-[#13161a] border border-[#252a32] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#00e5a0]"/>
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 bg-[#00e5a0] hover:bg-[#00fdb5] text-black font-bold py-2.5 rounded-lg text-sm">Add</button>
                <button type="button" onClick={()=>setAdding(false)} className="px-5 py-2.5 bg-[#252a32] text-white text-sm font-semibold rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
