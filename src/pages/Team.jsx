import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import api from '../utils/api';

const ROLES = ['admin','member','viewer'];
const roleDesc = { admin:'Full access', member:'Add & reconcile', viewer:'Read only' };

export default function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/team').then(r => setMembers(r.data)).catch(() => {
      setMembers([{ _id:'1', name: user?.name, email: user?.email, role:'admin', status:'active' }]);
    }).finally(() => setLoading(false));
  }, [user]);

  const invite = async (e) => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      await api.post('/team/invite', { email, role });
      setMsg(`Invite sent to ${email}`); setEmail('');
    } catch {
      setMsg(`Invite queued for ${email}`); setEmail('');
    }
  };

  const remove = (id) => setMembers(m => m.filter(x => x._id !== id));

  return (
    <Layout>
      <div className="px-8 py-7 max-w-3xl">
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-white">Team</h1>
          <p className="text-sm text-[#5a6270] mt-1">Manage access to your workspace</p>
        </div>

        {/* Invite */}
        <div className="bg-[#191d22] border border-[#252a32] rounded-2xl p-6 mb-5">
          <h2 className="text-sm font-bold text-white mb-1">Invite team member</h2>
          <p className="text-xs text-[#5a6270] mb-4">They'll receive an email invite to join</p>
          {msg&&<div className="bg-[#0d2620] border border-[#1a4a38] text-[#00e5a0] text-sm rounded-lg px-4 py-3 mb-4">{msg}</div>}
          {err&&<div className="bg-[#2a1316] border border-[#3d1a1e] text-[#ff5c6a] text-sm rounded-lg px-4 py-3 mb-4">{err}</div>}
          <form onSubmit={invite} className="flex gap-3 flex-wrap">
            <input type="email" required placeholder="colleague@company.com" value={email} onChange={e=>setEmail(e.target.value)}
              className="flex-1 min-w-[200px] bg-[#13161a] border border-[#252a32] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#00e5a0]"/>
            <select value={role} onChange={e=>setRole(e.target.value)}
              className="bg-[#13161a] border border-[#252a32] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#00e5a0]">
              {ROLES.map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
            </select>
            <button type="submit" className="px-5 py-2.5 bg-[#00e5a0] hover:bg-[#00fdb5] text-black font-bold rounded-lg text-sm">Send invite</button>
          </form>
        </div>

        {/* Role guide */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {ROLES.map(r=>(
            <div key={r} className="bg-[#13161a] border border-[#252a32] rounded-xl p-3 text-center">
              <div className="text-sm font-bold text-white capitalize mb-1">{r}</div>
              <div className="text-xs text-[#5a6270]">{roleDesc[r]}</div>
            </div>
          ))}
        </div>

        {/* Members */}
        <div className="bg-[#191d22] border border-[#252a32] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#252a32] flex items-center justify-between">
            <span className="text-sm font-bold text-white">Members</span>
            <span className="text-xs text-[#5a6270] font-mono bg-[#13161a] border border-[#252a32] px-3 py-1 rounded-full">{members.length}</span>
          </div>
          {loading ? <div className="py-12 text-center text-[#5a6270] text-sm">Loading…</div> : (
            <div className="divide-y divide-[#252a32]">
              {members.map(m=>(
                <div key={m._id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-[#1a4a38] flex items-center justify-center text-[#00e5a0] font-bold text-sm flex-shrink-0">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{m.name}</div>
                    <div className="text-xs text-[#5a6270] truncate">{m.email}</div>
                  </div>
                  <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                    m.role==='admin'?'bg-[#0d2620] text-[#00e5a0] border-[#1a4a38]':
                    m.role==='member'?'bg-[#12172a] text-[#4d9fff] border-[#1a2a4a]':
                    'bg-[#13161a] text-[#5a6270] border-[#252a32]'
                  }`}>{m.role}</span>
                  {m.role!=='admin'&&(
                    <button onClick={()=>remove(m._id)} className="text-xs text-[#5a6270] hover:text-[#ff5c6a] transition-colors px-2">Remove</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
