import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Header, BottomNav, Spinner } from '../components';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('team'); // team, staff
  const [staff, setStaff] = useState([]);
  const [perf, setPerf] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    Promise.all([
      api.getStaff(),
      api.getPerformance()
    ]).then(([s, p]) => {
      setStaff(s);
      setPerf(p);
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div id="screen-app" className="screen active">
      <Header title="Admin Dashboard" showBack />
      <main className="main-content"><div className="page active"><Spinner /></div></main>
      <BottomNav />
    </div>
  );

  return (
    <div id="screen-app" className="screen active">
      <Header title="Admin Dashboard" showBack />
      <main className="main-content">
        <div className="page active">
          
          <div className="page-hero admin-hero">
            <span className="hero-ic">🔑</span>
            <div>
              <div className="hero-title">Admin Dashboard</div>
              <div className="hero-sub">Full team overview</div>
            </div>
          </div>

          <div className="admin-tabs">
            <button className={`atab ${tab === 'team' ? 'active' : ''}`} onClick={() => setTab('team')}>Team Performance</button>
            <button className={`atab ${tab === 'staff' ? 'active' : ''}`} onClick={() => setTab('staff')}>Staff Management</button>
          </div>

          {tab === 'team' && (
            <div className="atab-content active" style={{ padding: '16px' }}>
              {perf.map(p => {
                const s = p.staff;
                const initials = s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={s.id} className="admin-staff-card">
                    <div className="asc-head">
                      <div className="asc-av">{initials}</div>
                      <div>
                        <div className="asc-name">{s.name}</div>
                        <div className="asc-phone">@{s.username}</div>
                      </div>
                    </div>
                    <div className="asc-stats">
                      <div className="asc-stat"><div className="asc-val">{p.totalCandidates}</div><div className="asc-lbl">Cands</div></div>
                      <div className="asc-stat"><div className="asc-val">{p.totalJoins}</div><div className="asc-lbl">Joins</div></div>
                      <div className="asc-stat"><div className="asc-val" style={{color:'#f87171'}}>{p.totalCalls}</div><div className="asc-lbl">Calls</div></div>
                      <div className="asc-stat"><div className="asc-val" style={{color:'#fbbf24'}}>{p.totalPosts}</div><div className="asc-lbl">Posts</div></div>
                    </div>
                    <div className="conv-bar">
                      <div className="conv-fill" style={{ width: `${p.conversionRate}%` }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, textAlign: 'right' }}>
                      Conversion: {p.conversionRate}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'staff' && (
            <div className="atab-content active" style={{ padding: '0 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '16px 0' }}>
                <button className="btn-sm" onClick={() => navigate('/admin/add-staff')}>+ Add Staff</button>
              </div>
              {staff.map(s => {
                const initials = s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={s.id} className="staff-item">
                    <div className="si-av">{initials}</div>
                    <div>
                      <div className="si-name">{s.name}</div>
                      <div className="si-phone">@{s.username}</div>
                    </div>
                    <div className={`si-badge ${s.role === 'admin' ? 'admin' : ''}`}>
                      {s.role}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>
      <BottomNav />
    </div>
  );
}
