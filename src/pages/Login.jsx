import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      showToast('Welcome back! 👋', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="screen-login" className="screen active">
      <div className="login-bg">
        <div className="blob blob1" />
        <div className="blob blob2" />
      </div>
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-box">S</div>
          <div>
            <h1 className="logo-title">Switch</h1>
            <p className="logo-sub">Staff System</p>
          </div>
        </div>
        <p className="login-tagline">Internal Operations Dashboard</p>
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label className="field-label">Username</label>
            <div className="input-wrap">
              <span className="input-prefix">@</span>
              <input
                type="text" className="field-input phone-input"
                placeholder="admin" maxLength={30}
                value={username} onChange={e => setUsername(e.target.value)} required
              />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="input-wrap">
              <input
                type={showPwd ? 'text' : 'password'} className="field-input"
                placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
              <button type="button" className="pwd-eye" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Login'}
          </button>
        </form>
        <p className="login-hint">Contact admin if you need access</p>

        <div className="login-hint" style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(255,255,255,.04)', borderRadius: 10, fontSize: 12 }}>
          <strong style={{ color: '#818cf8' }}>Demo Accounts:</strong><br />
          Admin: admin / admin123<br />
          Staff: staff / pass123
        </div>
      </div>
    </div>
  );
}
