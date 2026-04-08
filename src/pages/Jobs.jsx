import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Header, BottomNav, Spinner, EmptyState } from '../components';

function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Jobs() {
  const { user } = useAuth();
  const { showToast, showModal, closeModal } = useUI();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const isAdmin = user?.role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const params = { status: 'active' };
      if (role) params.role = role;
      if (location) params.location = location;
      setJobs(await api.getJobs(params));
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, [role, location]);

  const handleDelete = (job) => {
    showModal('Delete Job', `Remove "${job.title}"? Candidates linked to this job will be unlinked.`, [
      { label: 'Cancel', className: 'btn-ghost', action: closeModal },
      { label: 'Delete', className: 'btn-danger', action: async () => {
        closeModal();
        try { await api.deleteJob(job.id); showToast('Job deleted'); load(); }
        catch (err) { showToast(err.message, 'error'); }
      }},
    ]);
  };

  return (
    <div id="screen-app" className="screen active">
      <Header title="Job Board" />
      <main className="main-content">
        <div className="page active">
          <div className="page-hero jobs-hero">
            <span className="hero-ic">💼</span>
            <div>
              <div className="hero-title">Job Board</div>
              <div className="hero-sub">{jobs.length} active opening{jobs.length !== 1 ? 's' : ''}</div>
            </div>
            {isAdmin && (
              <button className="btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/jobs/add')}>
                + Add Job
              </button>
            )}
          </div>

          <div className="filter-row" style={{ paddingTop: 0 }}>
            <select className="fsel" value={role} onChange={e => setRole(e.target.value)}>
              <option value="">All Roles</option>
              {['Cook','Helper','Cleaning','Driver'].map(r => <option key={r}>{r}</option>)}
            </select>
            <select className="fsel" value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">All Locations</option>
              {['Noida','Gurgaon','Delhi'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div className="card-list">
            {loading ? <Spinner /> : jobs.length === 0
              ? <EmptyState icon="💼" text="No active job openings" />
              : jobs.map(j => {
                const avail = j.openings - j.filled;
                const sal = j.salary_min ? `₹${(j.salary_min/1000).toFixed(0)}k–${(j.salary_max/1000).toFixed(0)}k/mo` : null;
                return (
                  <div key={j.id} className="job-card">
                    <div className="jc-top">
                      <div className="jc-title-wrap">
                        <div className="jc-title">{j.title}</div>
                        <div className="jc-employer">{j.employer}</div>
                      </div>
                      <div>
                        <div className={`jc-slots-big ${avail <= 0 ? 'full' : ''}`}>{avail}</div>
                        <div className="jc-slots-lbl">open slots</div>
                      </div>
                    </div>
                    <div className="jc-tags">
                      <span className="jc-tag jc-role">{j.role}</span>
                      <span className="jc-tag jc-loc">📍 {j.location}</span>
                      {sal && <span className="jc-tag jc-sal">{sal}</span>}
                      <span className="jc-tag" style={{ background: 'rgba(99,102,241,.1)', color: '#818cf8' }}>
                        {j.filled}/{j.openings} filled
                      </span>
                    </div>
                    {j.description && <div className="jc-desc">{j.description}</div>}
                    <div className="jc-foot">
                      <span className="jc-added">{j.openings} total · {j.filled} filled</span>
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-sm" onClick={() => navigate(`/jobs/${j.id}/edit`)}>Edit</button>
                          <button className="btn-sm" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,.3)' }}
                            onClick={() => handleDelete(j)}>Delete</button>
                        </div>
                      )}
                      <div className={`jc-status-dot ${j.status}`} />
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
