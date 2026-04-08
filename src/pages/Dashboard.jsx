import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Header, BottomNav, Spinner, EmptyState } from '../components';

function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStats(),
      api.getJobs({ status: 'active' }),
    ]).then(([s, j]) => {
      setStats(s);
      setJobs(j.slice(0, 5));
    }).finally(() => setLoadingStats(false));
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning 👋' : hour < 17 ? 'Good afternoon 👋' : 'Good evening 👋';
  const firstName = user?.name?.split(' ')[0] || 'Staff';
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const roleIcons = { Cook: '👨‍🍳', Helper: '🙋', Cleaning: '🧹', Driver: '🚗' };

  return (
    <div id="screen-app" className="screen active">
      <Header title="Switch Staff" />
      <main className="main-content">
        <div className="page active">

          {/* Greeting */}
          <div className="greeting-bar">
            <div>
              <p className="greet-text">{greet}</p>
              <p className="greet-name">{firstName}!</p>
            </div>
            <div className="date-pill">{today}</div>
          </div>

          {/* Stats Cards */}
          <div className="section-lbl">Today's Activity</div>
          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigate('/daily-log')}>
              <div className="stat-ic calls">📞</div>
              <div className="stat-n">{loadingStats ? '—' : stats?.calls ?? 0}</div>
              <div className="stat-lbl">Calls Done</div>
            </div>
            <div className="stat-card" onClick={() => navigate('/daily-log')}>
              <div className="stat-ic posts">📢</div>
              <div className="stat-n">{loadingStats ? '—' : stats?.posts ?? 0}</div>
              <div className="stat-lbl">Posts Done</div>
            </div>
            <div className="stat-card" onClick={() => navigate('/candidates')}>
              <div className="stat-ic added">👤</div>
              <div className="stat-n">{loadingStats ? '—' : stats?.todayAdded ?? 0}</div>
              <div className="stat-lbl">Candidates Added</div>
            </div>
            <div className="stat-card" onClick={() => navigate('/tomorrow')}>
              <div className="stat-ic joining">🚀</div>
              <div className="stat-n">{loadingStats ? '—' : stats?.tomorrowJoining ?? 0}</div>
              <div className="stat-lbl">Joining Tomorrow</div>
            </div>
          </div>

          {/* Follow-up Alert */}
          {stats?.followupsToday > 0 && (
            <div className="followup-bar" onClick={() => navigate('/candidates?followup=1')}>
              <span>⏰</span>
              <div>
                <strong>{stats.followupsToday}</strong> follow-ups due today
                <div className="fu-sub">Tap to view</div>
              </div>
              <button className="btn-xs" onClick={e => { e.stopPropagation(); navigate('/candidates'); }}>View</button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="section-lbl">Quick Actions</div>
          <div className="quick-grid">
            <button className="quick-btn" onClick={() => navigate('/candidates/add')}>
              <div className="qi">➕</div>Add Candidate
            </button>
            <button className="quick-btn" onClick={() => navigate('/candidates')}>
              <div className="qi">📋</div>View Candidates
            </button>
            <button className="quick-btn" onClick={() => navigate('/tomorrow')}>
              <div className="qi">📅</div>Tomorrow Plan
            </button>
            <button className="quick-btn" onClick={() => navigate('/performance')}>
              <div className="qi">📊</div>My Performance
            </button>
          </div>

          {/* Available Jobs Strip */}
          <div className="section-lbl">Active Job Openings</div>
          <div className="jobs-strip">
            {jobs.length === 0 && !loadingStats && (
              <div style={{ color: '#475569', fontSize: 13, padding: '8px 0' }}>No active jobs. {user?.role === 'admin' && 'Add jobs from the Jobs page.'}</div>
            )}
            {jobs.map(j => {
              const avail = j.openings - j.filled;
              return (
                <div key={j.id} className="js-card" onClick={() => navigate('/jobs')}>
                  <div className="js-role-badge">{roleIcons[j.role] || '💼'}</div>
                  <div className="js-info">
                    <div className="js-title">{j.title}</div>
                    <div className="js-meta">{j.employer} · {j.location}</div>
                  </div>
                  <div className={`js-slots ${avail <= 0 ? 'full' : ''}`}>
                    {avail > 0 ? `${avail} open` : 'Full'}
                  </div>
                </div>
              );
            })}
            {jobs.length > 0 && (
              <button className="btn-ghost" style={{ borderRadius: 12, padding: '10px', fontSize: 13 }} onClick={() => navigate('/jobs')}>
                View all openings →
              </button>
            )}
          </div>

          {/* Admin shortcut */}
          {user?.role === 'admin' && (
            <div className="admin-link" onClick={() => navigate('/admin')}>
              <span>🔑</span> Admin Dashboard <span className="arr">→</span>
            </div>
          )}

          <div style={{ height: 8 }} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
