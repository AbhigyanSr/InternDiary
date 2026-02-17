import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`block px-4 py-2 rounded transition ${
        isActive 
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-300 hover:bg-gray-800'
      }`}
    >
      {label}
    </Link>
  );
};

export default function Layout() {
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-10 text-indigo-400">InternTrack</h1>
        <nav className="space-y-2">
          <SidebarItem to="/dashboard" label="Opportunities" />
          <SidebarItem to="/applications" label="My Applications" />
          <SidebarItem to="/planner" label="Prep Planner" />
          
          {/* Only show this if the user is an Admin */}
          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-gray-700">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">Admin Tools</p>
              <SidebarItem to="/admin" label="Post Internship" />
            </div>
          )}
        </nav>
        <button 
          onClick={logout}
          className="mt-10 w-full text-left px-4 py-2 text-gray-400 hover:text-red-400 transition"
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-4 md:hidden flex justify-between">
           <span className="font-bold text-indigo-600">InternTrack</span>
           {/* Mobile menu toggle would go here */}
        </header>
        <div className="p-8">
          <Outlet /> {/* This renders the specific page (Dashboard, etc.) */}
        </div>
      </main>
    </div>
  );
}