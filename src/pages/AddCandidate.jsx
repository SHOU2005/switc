import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useUI } from '../context/UIContext';
import { Header, BottomNav, Spinner } from '../components';

const ROLES = ['Cook', 'Helper', 'Cleaning', 'Driver'];
const LOCS  = ['Noida', 'Gurgaon', 'Delhi'];
const STATUSES = ['New', 'Called', 'Interested', 'Not Interested', 'Confirmed', 'Joined'];

// ─── Job Match Panel ────────────────────────────────────────────────
function JobMatchPanel({ role, location, selectedJobId, onSelect }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const data = await api.getMatchingJobs(role, location);
      setJobs(data);
    } catch { setJobs([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [role, location]);

  if (!role) return null;

  const roleIcons = { Cook: '👨‍🍳', Helper: '🙋', Cleaning: '🧹', Driver: '🚗' };
  const salLabel = (j) => j.salary_min ? `₹${(j.salary_min/1000).toFixed(0)}k–${(j.salary_max/1000).toFixed(0)}k/mo` : '';

  return (
    <div className="job-match-panel">
      <div className="jmp-header">
        <span className="jmp-icon">💼</span>
        <div>
          <div className="jmp-title">Available Jobs — {role}</div>
          <div className="jmp-sub">
            {loading ? 'Loading...' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found${location ? ` in ${location}` : ' across all locations'}`}
          </div>
        </div>
        <button type="button" className="jmp-refresh" onClick={load} title="Refresh">↻</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '12px 0', color: '#64748b', fontSize: 13 }}>Loading jobs…</div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '12px 0', color: '#64748b', fontSize: 13 }}>
          No active openings for {role} {location ? `in ${location}` : ''}
        </div>
      ) : (
        <div className="job-match-list">
          {/* None option */}
          <div
            className={`jm-card${!selectedJobId ? ' selected' : ''}`}
            onClick={() => onSelect(null)}
          >
            <div className="jm-check">{!selectedJobId ? '✓' : ''}</div>
            <div className="jm-body">
              <div className="jm-title" style={{ color: '#64748b' }}>Not linked to any job</div>
              <div className="jm-employer">Add candidate without a job opening</div>
            </div>
          </div>
          {jobs.map(j => {
            const avail = j.available_slots;
            const isSelected = selectedJobId === j.id;
            return (
              <div
                key={j.id}
                className={`jm-card${isSelected ? ' selected' : ''}`}
                onClick={() => onSelect(j.id)}
              >
                <div className="jm-check">{isSelected ? '✓' : ''}</div>
                <div className="jm-body">
                  <div className="jm-title">{j.title}</div>
                  <div className="jm-employer">{j.employer}</div>
                  <div className="jm-tags">
                    <span className={`jm-tag ${avail > 0 ? 'green' : 'red'}`}>
                      {avail > 0 ? `${avail} open` : 'Full'}
                    </span>
                    <span className="jm-tag cyan">📍 {j.location}</span>
                    {salLabel(j) && <span className="jm-tag yellow">{salLabel(j)}</span>}
                    <span className="jm-tag">{j.openings} total</span>
                  </div>
                  {j.description && (
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                      {j.description.slice(0, 100)}{j.description.length > 100 ? '…' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main AddCandidate Component ─────────────────────────────────────
export default function AddCandidate() {
  const { id } = useParams(); // edit mode if id present
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useUI();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dupErr, setDupErr] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', role: '', location: '',
    status: 'New', joining_date: '', followup_date: '',
    notes: '', job_id: null,
  });

  // For job match panel
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.getCandidate(id)
        .then(c => {
          setForm({
            name: c.name, phone: c.phone, role: c.role, location: c.location,
            status: c.status, joining_date: c.joining_date || '',
            followup_date: c.followup_date || '', notes: c.notes || '',
            job_id: c.job_id,
          });
          setSelectedJobId(c.job_id);
        })
        .catch(() => navigate('/candidates'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
    set('job_id', jobId);
  };

  const submit = async (e) => {
    e.preventDefault();
    setDupErr(false);
    setSaving(true);
    try {
      const payload = { ...form, job_id: selectedJobId || null };
      if (isEdit) {
        await api.updateCandidate(id, payload);
        showToast('Candidate updated ✓', 'success');
      } else {
        await api.addCandidate(payload);
        showToast('Candidate added ✓', 'success');
      }
      navigate(-1);
    } catch (err) {
      if (err.message?.includes('Phone')) setDupErr(true);
      else showToast(err.message || 'Error saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div id="screen-app" className="screen active">
      <Header title={isEdit ? 'Edit Candidate' : 'Add Candidate'} showBack />
      <main className="main-content"><div className="page active"><Spinner /></div></main>
      <BottomNav />
    </div>
  );

  return (
    <div id="screen-app" className="screen active">
      <Header title={isEdit ? 'Edit Candidate' : 'Add Candidate'} showBack />
      <main className="main-content">
        <div className="page active">
          <form onSubmit={submit} className="form-page">

            <div className="fsec-lbl">Basic Info</div>

            <div className="field-group">
              <label className="field-label">Full Name *</label>
              <input className="field-input" placeholder="e.g. Ramesh Kumar"
                value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>

            <div className="field-group">
              <label className="field-label">Phone Number *</label>
              <div className="input-wrap">
                <span className="input-prefix">+91</span>
                <input className="field-input phone-input" type="tel" placeholder="9876543210" maxLength={10}
                  value={form.phone} onChange={e => { set('phone', e.target.value); setDupErr(false); }} required />
              </div>
              {dupErr && <div className="form-error">This phone number already exists</div>}
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Role *</label>
                <select className="field-input" value={form.role}
                  onChange={e => set('role', e.target.value)} required>
                  <option value="" disabled>Select role</option>
                  {['Cook','Helper','Cleaning','Driver'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Location *</label>
                <select className="field-input" value={form.location}
                  onChange={e => set('location', e.target.value)} required>
                  <option value="" disabled>Select location</option>
                  {['Noida','Gurgaon','Delhi'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* ── JOB MATCH PANEL ── */}
            {form.role && (
              <JobMatchPanel
                role={form.role}
                location={form.location}
                selectedJobId={selectedJobId}
                onSelect={handleJobSelect}
              />
            )}

            <div className="fsec-lbl">Status & Planning</div>

            <div className="field-group">
              <label className="field-label">Status *</label>
              <select className="field-input" value={form.status}
                onChange={e => set('status', e.target.value)} required>
                {['New','Called','Interested','Not Interested','Confirmed','Joined'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Joining Date</label>
                <input className="field-input" type="date"
                  value={form.joining_date} onChange={e => set('joining_date', e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">Follow-up Date</label>
                <input className="field-input" type="date"
                  value={form.followup_date} onChange={e => set('followup_date', e.target.value)} />
              </div>
            </div>

            <div className="fsec-lbl">Notes</div>
            <div className="field-group">
              <label className="field-label">Additional Notes</label>
              <textarea className="field-input field-ta" placeholder="Any important details…"
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : isEdit ? 'Update Candidate' : 'Save Candidate'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
