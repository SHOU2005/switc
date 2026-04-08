import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useUI } from '../context/UIContext';
import { Header, BottomNav, Spinner } from '../components';

export default function AddJob() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useUI();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '', role: '', location: '', employer: '',
    openings: 1, salary_min: '', salary_max: '',
    description: '', status: 'active',
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.getJob(id)
        .then(j => setForm({
          title: j.title, role: j.role, location: j.location, employer: j.employer,
          openings: j.openings, salary_min: j.salary_min || '', salary_max: j.salary_max || '',
          description: j.description || '', status: j.status,
        }))
        .catch(() => navigate('/jobs'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        openings: parseInt(form.openings) || 1,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      };
      if (isEdit) { await api.updateJob(id, payload); showToast('Job updated ✓', 'success'); }
      else         { await api.addJob(payload); showToast('Job added ✓', 'success'); }
      navigate(-1);
    } catch (err) {
      showToast(err.message || 'Error saving', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div id="screen-app" className="screen active">
      <Header title={isEdit ? 'Edit Job' : 'Add Job'} showBack />
      <main className="main-content"><div className="page active"><Spinner /></div></main>
      <BottomNav />
    </div>
  );

  return (
    <div id="screen-app" className="screen active">
      <Header title={isEdit ? 'Edit Job' : 'Add Job Opening'} showBack />
      <main className="main-content">
        <div className="page active">
          <form onSubmit={submit} className="form-page">
            <div className="fsec-lbl">Job Details</div>
            <div className="field-group">
              <label className="field-label">Job Title *</label>
              <input className="field-input" placeholder="e.g. Head Cook - 5 Star Hotel"
                value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Role *</label>
                <select className="field-input" value={form.role} onChange={e => set('role', e.target.value)} required>
                  <option value="" disabled>Select role</option>
                  {['Cook','Helper','Cleaning','Driver'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Location *</label>
                <select className="field-input" value={form.location} onChange={e => set('location', e.target.value)} required>
                  <option value="" disabled>Select location</option>
                  {['Noida','Gurgaon','Delhi','All'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Employer / Company *</label>
              <input className="field-input" placeholder="e.g. Radisson Blu Noida"
                value={form.employer} onChange={e => set('employer', e.target.value)} required />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Total Openings *</label>
                <input className="field-input" type="number" placeholder="1" min="1"
                  value={form.openings} onChange={e => set('openings', e.target.value)} required />
              </div>
              <div className="field-group">
                <label className="field-label">Status</label>
                <select className="field-input" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="filled">Filled</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="fsec-lbl">Salary Range (₹/month)</div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Min Salary</label>
                <input className="field-input" type="number" placeholder="12000"
                  value={form.salary_min} onChange={e => set('salary_min', e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">Max Salary</label>
                <input className="field-input" type="number" placeholder="20000"
                  value={form.salary_max} onChange={e => set('salary_max', e.target.value)} />
              </div>
            </div>
            <div className="fsec-lbl">Description</div>
            <div className="field-group">
              <textarea className="field-input field-ta"
                placeholder="Job requirements, benefits, shift timings…"
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : isEdit ? 'Update Job' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
