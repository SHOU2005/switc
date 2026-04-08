import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export function Header({ title, showBack }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initials = user ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <header className="app-header">
      <div className="hdr-left">
        {showBack && (
          <button className="hdr-back" onClick={() => navigate(-1)}>←</button>
        )}
        <div className="hdr-brand">
          <div className="logo-dot" />
          <span className="hdr-title">{title}</span>
        </div>
      </div>
      <div className="hdr-right">
        <div className="user-av" onClick={() => navigate('/profile')}>{initials}</div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = (path) => location.pathname === path;

  return (
    <nav className="bot-nav">
      <NavLink to="/" className={({ isActive }) => `nav-b${isActive ? ' active' : ''}`} end>
        <span className="nbi">🏠</span><span className="nbl">Home</span>
      </NavLink>
      <NavLink to="/candidates" className={({ isActive }) => `nav-b${isActive ? ' active' : ''}`}>
        <span className="nbi">👥</span><span className="nbl">Candidates</span>
      </NavLink>
      <button className="nav-b nav-center" onClick={() => navigate('/candidates/add')}>
        <span className="nci">+</span>
      </button>
      <NavLink to="/jobs" className={({ isActive }) => `nav-b${isActive ? ' active' : ''}`}>
        <span className="nbi">💼</span><span className="nbl">Jobs</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `nav-b${isActive ? ' active' : ''}`}>
        <span className="nbi">👤</span><span className="nbl">Profile</span>
      </NavLink>
    </nav>
  );
}

export function StatusBadge({ status }) {
  const cls = 's-' + (status || 'New').replace(/\s+/g, '-');
  return <span className={`sbadge ${cls}`}>{status}</span>;
}

export function Toast() {
  const { toast } = useUI();
  if (!toast) return null;
  return <div className={`toast ${toast.type}`}>{toast.msg}</div>;
}

export function Modal() {
  const { modal, closeModal } = useUI();
  if (!modal) return null;
  return (
    <div className="modal-ov" onClick={closeModal}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{modal.title}</div>
        <div className="modal-body">{modal.body}</div>
        <div className="modal-btns">
          {modal.buttons.map((b, i) => (
            <button key={i} className={b.className} onClick={b.action}>{b.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Spinner({ full }) {
  if (full) return (
    <div className="loading-ov">
      <div className="loading-spin" />
    </div>
  );
  return <div className="loading-spin" style={{ margin: '40px auto' }} />;
}

export function EmptyState({ icon = '📋', text = 'Nothing here yet' }) {
  return (
    <div className="empty-state">
      <div className="empty-ic">{icon}</div>
      <p>{text}</p>
    </div>
  );
}

export function CandidateCard({ c, onClick }) {
  const today = new Date().toISOString().slice(0, 10);
  const isFollowup = c.followup_date === today && c.status !== 'Joined';
  return (
    <div className="cand-card" onClick={onClick}>
      <div className="cc-top">
        <div>
          <div className="cc-name">{c.name}</div>
          <div className="cc-meta">{c.role} · {c.location}</div>
        </div>
        <StatusBadge status={c.status} />
      </div>
      <div className="cc-foot">
        <a className="btn-call" href={`tel:+91${c.phone}`} onClick={e => e.stopPropagation()}>📞 {c.phone}</a>
        {isFollowup && <span className="followup-tag">⏰ Follow-up Today</span>}
        {c.job_title && <span className="cc-job-tag">💼 {c.job_title}</span>}
        {c.joining_date && <span className="cc-join">📅 {fmt(c.joining_date)}</span>}
      </div>
    </div>
  );
}

export function JobCard({ job, onEdit, onDelete, isAdmin }) {
  const avail = job.openings - job.filled;
  return (
    <div className="job-card">
      <div className="jc-top">
        <div className="jc-title-wrap">
          <div className="jc-title">{job.title}</div>
          <div className="jc-employer">{job.employer}</div>
        </div>
        <div>
          <div className={`jc-slots-big ${avail <= 0 ? 'full' : ''}`}>{avail}</div>
          <div className="jc-slots-lbl">open slots</div>
        </div>
      </div>
      <div className="jc-tags">
        <span className="jc-tag jc-role">{job.role}</span>
        <span className="jc-tag jc-loc">📍 {job.location}</span>
        {job.salary_min && <span className="jc-tag jc-sal">₹{(job.salary_min/1000).toFixed(0)}k–{(job.salary_max/1000).toFixed(0)}k</span>}
      </div>
      {job.description && <div className="jc-desc">{job.description}</div>}
      <div className="jc-foot">
        <span className="jc-added">{job.openings} total · {job.filled} filled</span>
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-sm" onClick={() => onEdit(job)}>Edit</button>
            <button className="btn-sm" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,.3)' }} onClick={() => onDelete(job)}>Delete</button>
          </div>
        )}
        <div className={`jc-status-dot ${job.status}`} />
      </div>
    </div>
  );
}

function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
