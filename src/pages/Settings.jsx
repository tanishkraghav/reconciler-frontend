import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import api from '../utils/api';

const CURRENCIES = ['USD','GBP','EUR','INR','AUD','CAD','SGD','AED'];

export default function Settings() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name||'', email: user?.email||'' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [pwd, setPwd] = useState({ current:'', newPwd:'', confirm:'' });
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [currency, setCurrency] = useState(localStorage.getItem('reconciler_currency')||'USD');
  const [currencyMsg, setCurrencyMsg] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault(); setProfileErr(''); setProfileMsg('');
    try { await api.put('/auth/profile', { name: profile.name }); setProfileMsg('Profile updated'); }
    catch (err) { setProfileErr(err.response?.data?.message||'Failed'); }
  };

  const savePassword = async (e) => {
    e.preventDefault(); setPwdErr(''); setPwdMsg('');
    if (pwd.newPwd !== pwd.confirm) return setPwdErr('Passwords do not match');
    if (pwd.newPwd.length < 6) return setPwdErr('Min 6 characters');
    try {
      await api.put('/auth/password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      setPwdMsg('Password updated'); setPwd({ current:'', newPwd:'', confirm:'' });
    } catch (err) { setPwdErr(err.response?.data?.message||'Failed'); }
  };

  const saveCurrency = () => {
    localStorage.setItem('reconciler_currency', currency);
    setCurrencyMsg('Currency preference saved');
    setTimeout(() => setCurrencyMsg(''), 2000);
  };

  const tabs = [
    { id:'profile',  label:'👤 Profile' },
    { id:'password', label:'🔒 Password' },
    { id:'currency', label:'💱 Currency' },
    { id:'danger',   label:'⚠️ Danger Zone' },
  ];

  return (
    <Layout>
      <div className="px-8 py-7 max-w-3xl">
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-white">Settings</h1>
          <p className="text-sm text-[#5a6270] mt-1">Manage your account and preferences</p>
        </div>

        <div className="flex gap-8">
          {/* Tabs */}
          <div className="w-44 flex-shrink-0 space-y-1">
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab===t.id?'bg-[#252a32] text-white':'text-[#5a6270] hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {tab==='profile'&&(
              <div className="bg-[#191d22] border border-[#252a32] rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1">Profile</h2>
                <p className="text-xs text-[#5a6270] mb-5">Update your display name</p>
                {profileMsg&&<div className="bg-[#0d2620] border border-[#1a4a38] text-[#00e5a0] text-sm rounded-lg px-4 py-3 mb-4">{profileMsg}</div>}
                {profileErr&&<div className="bg-[#2a1316] border border-[#3d1a1e] text-[#ff5c6a] text-sm rounded-lg px-4 py-3 mb-4">{profileErr}</div>}
                <form onSubmit={saveProfile} className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-[#5a6270] uppercase tracking-widest mb-1.5">Full Name</label>
                    <input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}
                      className="w-full bg-[#13161a] border border-[#252a32] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#00e5a0]"/>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#5a6270] uppercase tracking-widest mb-1.5">Email</label>
                    <input value={profile.email} disabled className="w-full bg-[#13161a] border border-[#252a32] rounded-lg px-3 py-2.5 text-sm text-[#5a6270] cursor-not-allowed"/>
                    <p className="text-xs text-[#5a6270] mt-1">Email cannot be changed</p>
                  </div>
                  <button type="submit" className="px-5 py-2.5 bg-[#00e5a0] hover:bg-[#00fdb5] text-black font-bold rounded-lg text-sm">Save changes</button>
                </form>
              </div>
            )}

            {tab==='password'&&(
              <div className="bg-[#191d22] border border-[#252a32] rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1">Change Password</h2>
                <p className="text-xs text-[#5a6270] mb-5">Minimum 6 characters</p>
                {pwdMsg&&<div className="bg-[#0d2620] border border-[#1a4a38] text-[#00e5a0] text-sm rounded-lg px-4 py-3 mb-4">{pwdMsg}</div>}
                {pwdErr&&<div className="bg-[#2a1316] border border-[#3d1a1e] text-[#ff5c6a] text-sm rounded-lg px-4 py-3 mb-4">{pwdErr}</div>}
                <form onSubmit={savePassword} className="space-y-4">
                  {[{l:'Current Password',k:'current'},{l:'New Password',k:'newPwd'},{l:'Confirm New Password',k:'confirm'}].map(f=>(
                    <div key={f.k}>
                      <label className="block text-[11px] text-[#5a6270] uppercase tracking-widest mb-1.5">{f.l}</label>
                      <input type="password" value={pwd[f.k]} onChange={e=>setPwd(p=>({...p,[f.k]:e.target.value}))}
                        className="w-full bg-[#13161a] border border-[#252a32] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#00e5a0]"/>
                    </div>
                  ))}
                  <button type="submit" className="px-5 py-2.5 bg-[#00e5a0] hover:bg-[#00fdb5] text-black font-bold rounded-lg text-sm">Update password</button>
                </form>
              </div>
            )}

            {tab==='currency'&&(
              <div className="bg-[#191d22] border border-[#252a32] rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-1">Currency Preference</h2>
                <p className="text-xs text-[#5a6270] mb-5">Default currency for displaying amounts</p>
                {currencyMsg&&<div className="bg-[#0d2620] border border-[#1a4a38] text-[#00e5a0] text-sm rounded-lg px-4 py-3 mb-4">{currencyMsg}</div>}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {CURRENCIES.map(c=>(
                    <button key={c} onClick={()=>setCurrency(c)}
                      className={`py-3 rounded-xl border text-sm font-bold transition-all ${currency===c?'border-[#00e5a0] text-[#00e5a0] bg-[#0d2620]':'border-[#252a32] text-[#5a6270] bg-[#13161a] hover:border-[#3a4050]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <button onClick={saveCurrency} className="px-5 py-2.5 bg-[#00e5a0] hover:bg-[#00fdb5] text-black font-bold rounded-lg text-sm">Save preference</button>
              </div>
            )}

            {tab==='danger'&&(
              <div className="bg-[#191d22] border border-[#3d1a1e] rounded-2xl p-6">
                <h2 className="text-base font-bold text-[#ff5c6a] mb-1">Danger Zone</h2>
                <p className="text-xs text-[#5a6270] mb-5">Permanent actions — cannot be undone</p>
                <div className="space-y-3">
                  {[
                    { label:'Sign out of all devices', sub:'Revoke all active sessions', action: logout, btn:'Sign out' },
                    { label:'Delete all transactions', sub:'Permanently remove all your data', action:()=>{}, btn:'Delete data' },
                  ].map(item=>(
                    <div key={item.label} className="flex items-center justify-between p-4 bg-[#13161a] border border-[#252a32] rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-[#5a6270] mt-0.5">{item.sub}</p>
                      </div>
                      <button onClick={item.action} className="px-4 py-2 bg-[#2a1316] border border-[#3d1a1e] text-[#ff5c6a] text-xs font-bold rounded-lg hover:bg-[#3d1a1e]">
                        {item.btn}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
