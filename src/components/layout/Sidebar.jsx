import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4">

      <h1 className="text-xl font-bold mb-6">
        Reconciler
      </h1>

      <nav className="flex flex-col gap-3">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/team">Team</Link>
        <Link to="/admin">Admin</Link>
      </nav>

    </div>
  );
}