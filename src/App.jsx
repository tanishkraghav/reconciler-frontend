import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Import from './pages/Import';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Admin from './pages/Admin';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center text-muted text-sm">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function Guest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          {/* redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* auth */}
          <Route path="/login" element={<Guest><Login /></Guest>} />
          <Route path="/register" element={<Guest><Register /></Guest>} />

          {/* protected */}
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/import" element={<Protected><Import /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="/team" element={<Protected><Team /></Protected>} />
          <Route path="/admin" element={<Protected><Admin /></Protected>} />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
}
 
