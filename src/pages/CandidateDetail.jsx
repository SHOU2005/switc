import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { Header, BottomNav, StatusBadge, Spinner } from '../components';

function fmt(iso, mode = 'short') {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (mode === 'short') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, showModal, closeModal } = useUI();
  const { user } = useAuth();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCandidate(id)
      .then(setC)
      .catch(() => navigate('/candidates'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    showModal('Delete Candidate', `Remove ${c.name} permanently? This cannot be undone.`, [
      { label: 'Cancel', className: 'btn-ghost', action: closeModal },
      { label: 'Delete', className: 'btn-danger', action: async () => {
        closeModal();
        try {
          await api.deleteCandidate(id);
          showToast('Candidate deleted', 'error');
          navigate('/candidates');
        } catch (err) { showToast(err.message, 'error'); }
      }},
    ]);
  };

  if (loading) return (
    <div id="screen-app" className="screen active">
      <Header title="Candidate" showBack />
      <main className="main-content"><div className="page active"><Spinner /></div></main>
      <BottomNav />
    </div>
  );

  const today = new Date().toISOString().slice(0, 10);
  const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div id="screen-app" className="screen active">
      <Header title={c.name} showBack />
      <main className="main-content">
        <div className="page active">
          <div className="detail-wrap">
            {/* Hero */}
            <div className="detail-hero">
              <div className="detail-av">{initials}</div>
              <div className="detail-name">{c.name}</div>
              <div className="detail-role">{c.role} · {c.location}</div>
              <div className="detail-sbadge-row">
                <StatusBadge status={c.status} />
                {c.followup_date === today && c.status !== 'Joined' && (
                  <span className="followup-tag">⏰ Follow-up Today</span>
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="detail-grid">
              <div className="di"><div className="di-lbl">Phone</div><div className="di-val">{c.phone}</div></div>
              <div className="di"><div className="di-lbl">Added By</div><div className="di-val">{c.added_by_name || '—'}</div></div>
              <div className="di"><div className="di-lbl">Joining Date</div><div className="di-val">{fmt(c.joining_date, 'long')}</div></div>
              <div className="di"><div className="di-lbl">Follow-up</div><div className="di-val">{fmt(c.followup_date, 'long')}</div></div>
            </div>

            {/* Linked Job */}
            {c.job_title && (
              <div className="detail-job-box">
                <div className="djb-lbl">💼 Linked Job Opening</div>
                <div className="djb-title">{c.job_title}</div>
                <div className="djb-emp">{c.job_employer} {c.job_location ? `· ${c.job_location}` : ''}</div>
              </div>
            )}

            {/* Notes */}
            {c.notes && (
              <div className="detail-notes">
                <div className="dn-lbl">Notes</div>
                <div className="dn-text">{c.notes}</div>
              </div>
            )}

            {/* Actions */}
            <div className="detail-actions">
              <a className="btn-call" href={`tel:+91${c.phone}`} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>📞 Call</a>
              <button className="btn-edit" onClick={() => navigate(`/candidates/${id}/edit`)}>✏️ Edit</button>
              <button className="btn-del" onClick={handleDelete}>🗑</button>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
