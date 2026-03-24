import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';
import Layout from './components/layout/Layout';
import api from '../utils/api';

const fmt = (n) =>
  '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [tab, setTab] = useState('bank');
  const [statusFilter, setStatus] = useState('');
  const [catFilter, setCat] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [reconciling, setRecon] = useState(false);
  const [reconMsg, setReconMsg] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    date: '',
    description: '',
    amount: '',
    reference: '',
    source: 'bank',
    category: '',
  });

  const [formErr, setFormErr] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [sumRes, ledRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get(`/transactions/ledger?source=${tab === 'all' ? 'bank' : tab}`),
      ]);

      setSummary(sumRes.data);
      setLedger(ledRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reconcile = async () => {
    setRecon(true);
    setReconMsg('');

    try {
      const { data } = await api.post('/transactions/reconcile');

      setReconMsg(
        `✓ Matched ${data.matched} · ${data.unmatched} unmatched · ${data.exceptions} exceptions`
      );

      await loadData();
    } catch (e) {
      setReconMsg('Reconciliation failed');
    } finally {
      setRecon(false);
    }
  };

  const deleteTx = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setExpanded(null);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = ledger.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (catFilter && r.category !== catFilter) return false;

    if (
      search &&
      !r.description.toLowerCase().includes(search.toLowerCase()) &&
      !(r.reference || '').toLowerCase().includes(search.toLowerCase())
    )
      return false;

    return true;
  });

  const cats = [...new Set(ledger.map((t) => t.category).filter(Boolean))];

  return (
    <Layout>
      <div className="min-h-screen bg-bg">

        {/* HEADER */}
        <header className="px-8 py-4 border-b border-border flex items-center gap-4">

          <h1 className="text-white font-bold">
            Dashboard
          </h1>

          <div className="flex-1" />

          <span className="text-sm text-muted">
            Hi {user?.name}
          </span>

          <button
            onClick={() => navigate('/import')}
            className="px-4 py-2 bg-border rounded"
          >
            Import
          </button>

          <button
            onClick={reconcile}
            className="px-4 py-2 bg-accent rounded"
          >
            Reconcile
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 rounded"
          >
            Logout
          </button>

        </header>

        {/* STATS */}
        {summary && (
          <div className="p-6 grid grid-cols-4 gap-4">

            <div className="bg-card p-4">
              Matched
              <div>{summary.by_status?.matched}</div>
            </div>

            <div className="bg-card p-4">
              Unmatched
              <div>{summary.by_status?.unmatched}</div>
            </div>

            <div className="bg-card p-4">
              Exception
              <div>{summary.by_status?.exception}</div>
            </div>

            <div className="bg-card p-4">
              Balance
              <div>{fmt(summary.bank_balance)}</div>
            </div>

          </div>
        )}

        {/* TABLE */}
        <div className="p-6">

          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>

                {filtered.map((r) => (
                  <tr key={r.id}>

                    <td>{r.date}</td>
                    <td>{r.description}</td>
                    <td>
                      <StatusPill status={r.status} />
                    </td>
                    <td>{fmt(r.debit || r.credit)}</td>

                  </tr>
                ))}

              </tbody>

            </table>
          )}

        </div>

      </div>
    </Layout>
  );
}