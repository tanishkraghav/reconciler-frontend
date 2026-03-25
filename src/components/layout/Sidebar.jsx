import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const nav = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard' },
  { to: '/import',    icon: '↑', label: 'Import CSV' },
  { to: '/team',      icon: '👥', label: 'Team' },
  { to: '/settings',  icon: '⚙', label: 'Settings' },
  { to: '/admin',     icon: '🛡', label: 'Admin' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0c0e10] border-r border-[#252a32] flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#252a32] flex items-center gap-3">
        <div className="w-8 h-8 bg-[#00e5a0] rounded-lg flex items-center justify-center font-mono font-bold text-black text-sm flex-shrink-0">₹≋</div>
        <div>
          <div className="text-sm font-bold text-white leading-none">Reconciler</div>
          <div className="text-[10px] text-[#5a6270] font-mono mt-0.5">Platform</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#0d2620] text-[#00e5a0] border border-[#1a4a38]'
                  : 'text-[#5a6270] hover:text-white hover:bg-[#13161a]'
              }`
            }>
            <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[#252a32]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#13161a] border border-[#252a32] mb-2">
          <div className="w-7 h-7 rounded-full bg-[#1a4a38] flex items-center justify-center text-[#00e5a0] font-bold text-xs flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
            <div className="text-[10px] text-[#5a6270] truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={logout}
          className="w-full text-left px-3 py-2 text-xs text-[#5a6270] hover:text-white transition-colors rounded-lg hover:bg-[#13161a]">
          → Sign out
        </button>
      </div>
    </aside>
  );
}
