import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, FileText, PenSquare, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Outlet />; // Auth Layouts or simple login
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard /> },
    { name: 'All Posts', path: '/posts', icon: <FileText /> },
    { name: 'New Post', path: '/posts/new', icon: <PenSquare /> },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          Chronicle<span>.</span> <span className="badge">Author</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="btn-logout">
            <LogOut />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Logged in as <strong style={{ color: 'var(--text)' }}>{user.username}</strong>
            </span>
            <div 
              style={{
                width: '32px', height: '32px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '0.8rem', color: 'white'
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
