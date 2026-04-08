import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Header, BottomNav } from '../components';

export default function Profile() {
  const { user, logout } = useAuth();
  const { showModal, closeModal } = useUI();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    showModal('Logout', 'Are you sure you want to log out?', [
      { label: 'Cancel', className: 'btn-ghost', action: closeModal },
      { label: 'Logout', className: 'btn-danger', action: () => {
        closeModal();
        logout();
        navigate('/login');
      }},
    ]);
  };

  return (
    <div id="screen-app" className="screen active">
      <Header title="Profile" showBack />
      <main className="main-content">
        <div className="page active">
          
          <div className="profile-card">
            <div className="profile-av">{initials}</div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-phone">@{user.username}</div>
            <div className="profile-badge">{user.role}</div>
          </div>

          <div className="p-menu">
            <div className="pmitem" onClick={() => navigate('/daily-log')}>
              <span>📝</span>Daily Log<span className="arr">→</span>
            </div>
            <div className="pmitem" onClick={() => navigate('/performance')}>
              <span>📊</span>My Performance<span className="arr">→</span>
            </div>
            {user.role === 'admin' && (
              <div className="pmitem" onClick={() => navigate('/admin')}>
                <span>🔑</span>Admin Dashboard<span className="arr">→</span>
              </div>
            )}
            <div className="pmitem danger" onClick={handleLogout}>
              <span>🚪</span>Logout<span className="arr">→</span>
            </div>
          </div>

        </div>
      </main>
      <BottomNav />
    </div>
  );
}
