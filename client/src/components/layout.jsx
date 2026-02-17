import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

const SidebarItem = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
    >
      {label}
    </Link>
  );
};

export default function Layout() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell flex min-h-screen">
      {/* Sidebar */}
      <aside className="sidebar w-64 p-6 hidden md:block">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gradient">Intern Diary</h1>
          <p className="text-xs text-muted mt-1">Track your journey</p>
        </div>
        
        <nav className="space-y-1.5">
          <SidebarItem to="/dashboard" label="Opportunities" />
          <SidebarItem to="/applications" label="My Applications" />
          <SidebarItem to="/planner" label="Prep Planner" />
          
          {/* Admin Section */}
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border-separator)' }}>
                <p className="px-3 text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Admin Tools
                </p>
                <SidebarItem to="/admin" label="Post Opportunity" />
              </div>
            </>
          )}
        </nav>
        
        {/* User info and logout */}
        <div className="mt-auto pt-6" style={{ borderTop: '1px solid var(--border-separator)', marginTop: '3rem' }}>
          <div className="px-3 mb-3">
            <p className="text-sm font-medium text-primary">{user?.name}</p>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-muted hover:text-red-400 hover:bg-red-900/10 rounded-md transition"
          >
            Logout
          </button>
        </div>
        
        {/* Watermark */}
        <div className="px-3 pt-4 pb-2">
          <p className="text-xs text-muted opacity-50">Made by Abhigyan Srivastava</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="card md:hidden flex justify-between items-center p-4 m-4 mb-0">
          <h1 className="font-bold text-gradient">Intern Diary</h1>
          <span className="text-xs text-muted">{user?.name}</span>
        </header>
        
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}