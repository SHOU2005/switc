import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Header, BottomNav, StatusBadge, Spinner, EmptyState } from '../components';

const ROLES = ['Cook', 'Helper', 'Cleaning', 'Driver'];
const LOCS  = ['Noida', 'Gurgaon', 'Delhi'];
const STATUSES = ['New', 'Called', 'Interested', 'Not Interested', 'Confirmed', 'Joined'];

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (role) params.role = role;
      if (location) params.location = location;
      if (status) params.status = status;
      if (search) params.search = search;
      const data = await api.getCandidates(params);
      setCandidates(data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, [role, location, status]);

  // debounced search
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div id="screen-app" className="screen active">
      <Header title="Candidates" />
      <main className="main-content">
        <div className="page active">
          <div className="list-toolbar sticky">
            <div className="search-wrap">
              <span className="si">🔍</span>
              <input
                className="search-inp" placeholder="Search name or phone…"
                value={search} onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="clear-btn" onClick={() => setSearch('')}>✕</button>}
            </div>
            <button className="btn-icon-add" onClick={() => navigate('/candidates/add')}>+</button>
          </div>
          <div className="filter-row">
            <select className="fsel" value={role} onChange={e => setRole(e.target.value)}>
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            <select className="fsel" value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">All Locations</option>
              {LOCS.map(l => <option key={l}>{l}</option>)}
            </select>
            <select className="fsel" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="card-list">
            {loading ? <Spinner /> : candidates.length === 0
              ? <EmptyState icon="📋" text={search || role || location || status ? 'No candidates match filters' : 'No candidates yet. Add your first one!'} />
              : candidates.map(c => (
                <div key={c.id} className="cand-card" onClick={() => navigate(`/candidates/${c.id}`)}>
                  <div className="cc-top">
                    <div>
                      <div className="cc-name">{c.name}</div>
                      <div className="cc-meta">{c.role} · {c.location}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="cc-foot">
                    <a className="btn-call" href={`tel:+91${c.phone}`} onClick={e => e.stopPropagation()}>📞 {c.phone}</a>
                    {c.followup_date === new Date().toISOString().slice(0,10) && c.status !== 'Joined' && (
                      <span className="followup-tag">⏰ Follow-up Today</span>
                    )}
                    {c.job_title && <span className="cc-job-tag">💼 {c.job_title}</span>}
                    {c.joining_date && <span className="cc-join">📅 {fmtDate(c.joining_date, 'short')}</span>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function fmtDate(iso, mode) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (mode === 'short') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
