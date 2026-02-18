import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useState } from 'react';

const SidebarItem = ({ to, label, icon, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  // Get abbreviated label for collapsed state
  const getAbbreviation = (text) => {
    const words = text.split(' ');
    if (words.length === 1) {
      return text.substring(0, 2).toUpperCase();
    }
    return words.map(w => w[0]).join('').toUpperCase();
  };
  
  return (
    <Link
      to={to}
      className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
      title={isCollapsed ? label : ''}
    >
      {isCollapsed ? getAbbreviation(label) : label}
    </Link>
  );
};

export default function Layout() {
  const { user, logout, loading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      <aside className={`sidebar ${isSidebarCollapsed ? 'w-20' : 'w-64'} p-6 hidden md:flex flex-col transition-all duration-300 relative`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 bg-surface border border-border rounded-full w-8 h-8 flex flex-col items-center justify-center gap-1 hover:bg-surface-hover transition-colors z-10 p-1.5"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="w-4 h-0.5 bg-muted rounded transition-all"></span>
          <span className="w-4 h-0.5 bg-muted rounded transition-all"></span>
          <span className="w-4 h-0.5 bg-muted rounded transition-all"></span>
        </button>

        <div className="mb-10">
          <h1 className={`text-2xl font-bold text-gradient ${isSidebarCollapsed ? 'text-center' : ''}`}>
            {isSidebarCollapsed ? 'ID' : 'Intern Diary'}
          </h1>
          {!isSidebarCollapsed && <p className="text-xs text-muted mt-1">Track your journey</p>}
        </div>
        
        <nav className="space-y-1.5">
          <SidebarItem to="/dashboard" label="Opportunities" isCollapsed={isSidebarCollapsed} />
          <SidebarItem to="/applications" label="My Applications" isCollapsed={isSidebarCollapsed} />
          <SidebarItem to="/planner" label="Prep Planner" isCollapsed={isSidebarCollapsed} />
          
          {/* Admin Section */}
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 mt-4" style={{ borderTop: '1px solid var(--border-separator)' }}>
                {!isSidebarCollapsed && (
                  <p className="px-3 text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                    Admin Tools
                  </p>
                )}
                <SidebarItem to="/admin" label="Post Opportunity" isCollapsed={isSidebarCollapsed} />
              </div>
            </>
          )}
        </nav>
        
        <div className="flex-1"></div>
        
        {/* User info and logout */}
        <div className="pt-6" style={{ borderTop: '1px solid var(--border-separator)' }}>
          {!isSidebarCollapsed && (
            <div className="px-3 mb-3">
              <p className="text-sm font-medium text-primary">{user?.name}</p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
          )}
          <button 
            onClick={logout}
            className={`w-full text-left px-3 py-2 text-sm text-muted hover:text-red-400 hover:bg-red-900/10 rounded-md transition ${isSidebarCollapsed ? 'text-center' : ''}`}
            title="Logout"
          >
            {isSidebarCollapsed ? '⏻' : 'Logout'}
          </button>
        </div>
        
        {/* Footer */}
        {!isSidebarCollapsed && (
          <div className="pt-4 text-center" style={{ borderTop: '1px solid var(--border-separator)' }}>
            <p className="text-xs text-muted opacity-40">Made by Abhigyan Srivastava</p>
          </div>
        )}
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