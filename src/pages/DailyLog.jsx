import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useUI } from '../context/UIContext';
import { Header, BottomNav, Spinner } from '../components';

export default function DailyLog() {
  const { showToast } = useUI();
  const [log, setLog] = useState({ calls: 0, posts: 0, leads: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.getTodayLog(), api.getLogs()])
      .then(([today, hist]) => {
        setLog({ calls: today.calls || 0, posts: today.posts || 0, leads: today.leads || 0 });
        setHistory(hist);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.saveLog(log);
      showToast('Log saved ✓', 'success');
      setHistory(h => {
        const today = new Date().toISOString().slice(0, 10);
        const idx = h.findIndex(l => l.date === today);
        if (idx > -1) { const n = [...h]; n[idx] = updated; return n; }
        return [updated, ...h];
      });
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div id="screen-app" className="screen active">
      <Header title="Daily Log" showBack />
      <main className="main-content">
        <div className="page active">
          <div className="page-hero log-hero">
            <span className="hero-ic">📝</span>
            <div>
              <div className="hero-title">Daily Work Log</div>
              <div className="hero-sub">Track your activity • {today}</div>
            </div>
          </div>

          {loading ? <Spinner /> : (
            <form onSubmit={save} className="form-page" style={{ paddingBottom: 0 }}>
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">📞 Calls Done</label>
                  <input className="field-input" type="number" placeholder="0" min="0"
                    value={log.calls} onChange={e => setLog(l => ({ ...l, calls: +e.target.value }))} />
                </div>
                <div className="field-group">
                  <label className="field-label">📢 Posts Done</label>
                  <input className="field-input" type="number" placeholder="0" min="0"
                    value={log.posts} onChange={e => setLog(l => ({ ...l, posts: +e.target.value }))} />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">👤 Leads Added</label>
                <input className="field-input" type="number" placeholder="0" min="0"
                  value={log.leads} onChange={e => setLog(l => ({ ...l, leads: +e.target.value }))} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={saving}>
                {saving ? <span className="spinner" /> : 'Save Today\'s Log'}
              </button>
            </form>
          )}

          <div className="section-lbl" style={{ marginTop: 24 }}>Recent Logs</div>
          <div className="card-list" style={{ padding: '0 16px 16px' }}>
            {history.map(l => {
              const d = new Date(l.date + 'T00:00:00');
              return (
                <div key={l.id || l.date} className="log-item">
                  <div className="log-dc">
                    <div className="log-day">{d.getDate()}</div>
                    <div className="log-mon">{d.toLocaleString('en', { month: 'short' })}</div>
                  </div>
                  <div className="log-stats">
                    <div className="log-si"><div className="log-sv">📞 {l.calls}</div><div className="log-sl">Calls</div></div>
                    <div className="log-si"><div className="log-sv">📢 {l.posts}</div><div className="log-sl">Posts</div></div>
                    <div className="log-si"><div className="log-sv">👤 {l.leads}</div><div className="log-sl">Leads</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
