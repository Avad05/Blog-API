import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config';
import { Layers, FileText, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/posts/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          const published = data.filter(p => p.published).length;
          setStats({
            total: data.length,
            published,
            drafts: data.length - published
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return <div className="state-loading"><div className="state-loading__spinner"></div>Loading dashboard...</div>;
  }

  return (
    <div className="fade-in-up">
      <div className="page-title">
        Dashboard Overview
        <Link to="/posts/new" className="btn btn-primary">Create New Post</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard icon={<Layers color="var(--accent)" />} title="Total Posts" value={stats.total} />
        <StatCard icon={<CheckCircle color="var(--success)" />} title="Published" value={stats.published} />
        <StatCard icon={<Clock color="var(--warning)" />} title="Drafts" value={stats.drafts} />
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, marginBottom: '1.5rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/posts" className="btn btn-secondary"><FileText size={18} /> View All Posts</Link>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
    <div style={{ background: 'var(--bg-hover)', padding: '1rem', borderRadius: '12px' }}>
      {icon}
    </div>
    <div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem', fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);

export default Dashboard;
