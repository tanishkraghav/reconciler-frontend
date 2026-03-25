import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const features = [
  { icon: '⚡', title: 'Auto-Reconciliation', desc: 'Two-pass matching engine pairs bank and internal transactions by reference code, then fuzzy amount + date.' },
  { icon: '📊', title: 'Live Ledger', desc: 'Real-time running balance with debit/credit breakdown. Filter by status, category, or search anything.' },
  { icon: '📂', title: 'CSV Import', desc: 'Drag and drop your bank statement CSV. Preview rows before importing. Supports any standard export format.' },
  { icon: '🔐', title: 'Team Access', desc: 'Invite team members with role-based permissions. Everyone sees the same live data.' },
  { icon: '🌍', title: 'Multi-Currency', desc: 'Set your preferred currency. Full support for USD, GBP, EUR, INR and more.' },
  { icon: '🚨', title: 'Exception Flagging', desc: 'Unmatched and duplicate transactions are flagged instantly so nothing slips through.' },
];

const stats = [
  { value: '2-pass', label: 'Matching Engine' },
  { value: '< 1s', label: 'Reconciliation Speed' },
  { value: '100%', label: 'API Coverage' },
  { value: 'Free', label: 'To Get Started' },
];

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef();

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const move = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 20;
      const y = ((e.clientY - top) / height - 0.5) * 20;
      el.style.setProperty('--rx', `${y}deg`);
      el.style.setProperty('--ry', `${x}deg`);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div className="min-h-screen bg-[#080a0c] text-[#c8d0db] font-sans overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4 flex items-center gap-4 bg-[#080a0c]/80 backdrop-blur border-b border-[#1a1f26]">
        <div className="w-8 h-8 bg-[#00e5a0] rounded-lg flex items-center justify-center font-mono font-bold text-black text-sm flex-shrink-0">₹≋</div>
        <span className="font-bold text-white text-base tracking-tight">Reconciler</span>
        <div className="flex-1" />
        <button onClick={() => navigate('/login')} className="text-sm text-[#5a6270] hover:text-white transition-colors">Sign in</button>
        <button onClick={() => navigate('/register')}
          className="px-4 py-2 bg-[#00e5a0] hover:bg-[#00fdb5] text-black text-sm font-bold rounded-lg transition-colors">
          Get started free
        </button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 pt-24 pb-16 text-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#00e5a0 1px, transparent 1px), linear-gradient(90deg, #00e5a0 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00e5a0 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1a4a38] bg-[#0d2620] text-[#00e5a0] text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
            Now live — MERN stack · MongoDB · JWT Auth
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Reconcile transactions
            <br />
            <span className="text-[#00e5a0]">automatically.</span>
          </h1>

          <p className="text-lg text-[#7a8494] max-w-xl mx-auto mb-10 leading-relaxed">
            Reconciler matches your bank statements against internal records in seconds, flags exceptions, and gives you a clean structured ledger — built for finance teams and developers.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => navigate('/register')}
              className="px-8 py-3.5 bg-[#00e5a0] hover:bg-[#00fdb5] text-black font-bold rounded-xl text-base transition-all hover:-translate-y-0.5 shadow-lg shadow-[#00e5a0]/20">
              Start for free →
            </button>
            <button onClick={() => navigate('/login')}
              className="px-8 py-3.5 border border-[#252a32] hover:border-[#3a4050] text-white font-semibold rounded-xl text-base transition-colors">
              Sign in
            </button>
          </div>
        </div>

        {/* Dashboard preview card */}
        <div ref={heroRef} className="relative z-10 mt-16 w-full max-w-4xl"
          style={{ transform: 'perspective(1000px) rotateX(var(--rx, 2deg)) rotateY(var(--ry, 0deg))', transition: 'transform 0.1s ease' }}>
          <div className="bg-[#0f1215] border border-[#252a32] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1f26] bg-[#0c0e10]">
              <div className="w-3 h-3 rounded-full bg-[#ff5c6a]" />
              <div className="w-3 h-3 rounded-full bg-[#ffb830]" />
              <div className="w-3 h-3 rounded-full bg-[#00e5a0]" />
              <div className="flex-1 mx-4 bg-[#1a1f26] rounded-md px-3 py-1 text-xs text-[#5a6270] font-mono">reconciler.app/dashboard</div>
            </div>
            {/* Fake stats row */}
            <div className="grid grid-cols-4 gap-3 p-4">
              {[['Matched','16','#00e5a0'],['Unmatched','3','#ffb830'],['Exceptions','1','#ff5c6a'],['Balance','₹71,927','#4d9fff']].map(([l,v,c]) => (
                <div key={l} className="bg-[#191d22] border border-[#252a32] rounded-xl p-3" style={{ borderTopColor: c, borderTopWidth: 2 }}>
                  <div className="text-[10px] text-[#5a6270] uppercase tracking-wider font-mono">{l}</div>
                  <div className="text-xl font-extrabold text-white mt-1" style={{ color: c }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Fake table rows */}
            <div className="px-4 pb-4 space-y-1.5">
              {[
                ['2025-01-07','SALARY CREDIT/ACME CORP','₹85,000','matched','#00e5a0'],
                ['2025-01-15','IMPS/MONTHLY RENT/LANDLORD','₹22,000','matched','#00e5a0'],
                ['2025-01-25','MYSTERY DEBIT/REF0099','₹750','exception','#ff5c6a'],
                ['2025-01-28','Gym Membership','₹1,800','unmatched','#ffb830'],
              ].map(([date,desc,amt,status,c]) => (
                <div key={desc} className="flex items-center gap-3 bg-[#191d22] border border-[#252a32] rounded-lg px-3 py-2.5">
                  <span className="text-[11px] text-[#5a6270] font-mono w-20 flex-shrink-0">{date}</span>
                  <span className="text-xs text-white flex-1 truncate">{desc}</span>
                  <span className="text-xs font-mono text-[#5a6270]">{amt}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: c, borderColor: c, background: c+'15' }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[#1a1f26] bg-[#0c0e10] py-10">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-[#00e5a0] mb-1">{s.value}</div>
              <div className="text-xs text-[#5a6270] uppercase tracking-widest font-mono">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Everything you need to reconcile at scale</h2>
            <p className="text-[#7a8494] max-w-xl mx-auto">Built for finance teams who need accuracy and developers who need a clean API.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-[#0f1215] border border-[#1a1f26] hover:border-[#252a32] rounded-2xl p-6 transition-colors group">
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-[#5a6270] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#0d2620] to-[#0c1a2e] border border-[#1a4a38] rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to reconcile?</h2>
            <p className="text-[#7a8494] mb-8">Create your account in seconds. No credit card required.</p>
            <button onClick={() => navigate('/register')}
              className="px-10 py-4 bg-[#00e5a0] hover:bg-[#00fdb5] text-black font-bold rounded-xl text-base transition-all hover:-translate-y-0.5 shadow-lg shadow-[#00e5a0]/20">
              Get started free →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1f26] py-8 px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#00e5a0] rounded flex items-center justify-center font-mono text-black text-xs font-bold">₹</div>
            <span className="text-sm font-bold text-white">Reconciler</span>
          </div>
          <span className="text-xs text-[#5a6270] font-mono">© 2026 Reconciler. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
