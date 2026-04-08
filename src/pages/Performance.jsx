import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Header, BottomNav, Spinner } from '../components';

export default function Performance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPerformance()
      .then(res => setData(res[0] || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div id="screen-app" className="screen active">
      <Header title="My Performance" showBack />
      <main className="main-content"><div className="page active"><Spinner /></div></main>
      <BottomNav />
    </div>
  );

  if (!data) return (
    <div id="screen-app" className="screen active">
      <Header title="My Performance" showBack />
      <main className="main-content"><div className="page active"><div style={{padding: 20}}>Failed to load data</div></div></main>
      <BottomNav />
    </div>
  );

  const { totalCalls, totalPosts, totalCandidates, totalJoins, conversionRate, statusBreakdown } = data;
  const statuses = ['New', 'Called', 'Interested', 'Not Interested', 'Confirmed', 'Joined'];
  const colors = {
    'New': '#94a3b8', 'Called': '#22d3ee', 'Interested': '#fbbf24',
    'Not Interested': '#f87171', 'Confirmed': '#818cf8', 'Joined': '#34d399'
  };

  return (
    <div id="screen-app" className="screen active">
      <Header title="My Performance" />
      <main className="main-content">
        <div className="page active">
          <div className="page-hero perf-hero">
            <span className="hero-ic">📊</span>
            <div>
              <div className="hero-title">Performance Stats</div>
              <div className="hero-sub">All-time record</div>
            </div>
          </div>

          <div className="perf-grid">
            <div className="perf-card"><div className="pv">{totalCandidates}</div><div className="pl">Candidates</div></div>
            <div className="perf-card"><div className="pv">{totalJoins}</div><div className="pl">Total Joins</div></div>
            <div className="perf-card"><div className="pv" style={{color:'#f87171'}}>{totalCalls}</div><div className="pl">Total Calls</div></div>
            <div className="perf-card"><div className="pv" style={{color:'#fbbf24'}}>{totalPosts}</div><div className="pl">Total Posts</div></div>
          </div>

          <div className="perf-card" style={{ margin: '10px 16px', background: 'rgba(99,102,241,.1)', borderColor: 'rgba(99,102,241,.2)' }}>
            <div className="pv" style={{ color: '#818cf8' }}>{conversionRate}%</div>
            <div className="pl">Conversion Rate (Joins / Candidates)</div>
          </div>

          <div className="section-lbl" style={{ marginTop: 24 }}>By Status</div>
          <div className="perf-breakdown">
            {statuses.map(st => (
              <div key={st} className="bd-row">
                <div className="bd-left">
                  <div className="bd-dot" style={{ background: colors[st] }} />
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>{st}</span>
                </div>
                <div className="bd-count">{statusBreakdown[st] || 0}</div>
              </div>
            ))}
          </div>

        </div>
      </main>
      <BottomNav />
    </div>
  );
}
