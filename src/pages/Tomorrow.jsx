import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Header, BottomNav, Spinner, EmptyState, StatusBadge } from '../components';

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Tomorrow() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getTomorrow().then(setList).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tomorrow = new Date(Date.now() + 86400000);
  const tStr = tomorrow.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  // Group by role+location
  const groups = {};
  list.forEach(c => {
    const k = `${c.role} · ${c.location}`;
    if (!groups[k]) groups[k] = [];
    groups[k].push(c);
  });

  return (
    <div id="screen-app" className="screen active">
      <Header title="Tomorrow's Plan" />
      <main className="main-content">
        <div className="page active">
          <div className="page-hero tomorrow-hero">
            <span className="hero-ic">📅</span>
            <div>
              <div className="hero-title">Tomorrow's Joinings</div>
              <div className="hero-sub">{tStr}</div>
            </div>
          </div>

          {loading ? <Spinner /> : list.length === 0
            ? <EmptyState icon="🎉" text="No joinings tomorrow! Take it easy 😄" />
            : (
              <div className="card-list" style={{ padding: '0 16px 16px' }}>
                {Object.entries(groups).map(([key, cands]) => (
                  <div key={key} className="tmr-group">
                    <div className="tmr-group-title">
                      {key} <span style={{ color: '#64748b' }}>({cands.length})</span>
                    </div>
                    {cands.map(c => {
                      const unconf = c.status !== 'Confirmed' && c.status !== 'Joined';
                      return (
                        <div key={c.id} className={`tmr-card${unconf ? ' unconfirmed' : ''}`}
                          onClick={() => navigate(`/candidates/${c.id}`)}>
                          <div style={{ fontSize: 20 }}>📋</div>
                          <div className="tmr-info">
                            <div className="tmr-name">{c.name}</div>
                            <div className="tmr-sub">{c.phone} · <StatusBadge status={c.status} /></div>
                            {c.job_title && <div style={{ fontSize: 11, color: '#22d3ee', marginTop: 3 }}>💼 {c.job_title}</div>}
                          </div>
                          {unconf
                            ? <span className="utag">⚠ Not Confirmed</span>
                            : <span style={{ fontSize: 18 }}>✅</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
