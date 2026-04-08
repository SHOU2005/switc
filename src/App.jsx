import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { Toast, Modal } from './components';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import AddCandidate from './pages/AddCandidate';
import CandidateDetail from './pages/CandidateDetail';
import Jobs from './pages/Jobs';
import AddJob from './pages/AddJob';
import Tomorrow from './pages/Tomorrow';
import DailyLog from './pages/DailyLog';
import Performance from './pages/Performance';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          
          {/* Candidates */}
          <Route path="/candidates" element={<Protected><Candidates /></Protected>} />
          <Route path="/candidates/add" element={<Protected><AddCandidate /></Protected>} />
          <Route path="/candidates/:id" element={<Protected><CandidateDetail /></Protected>} />
          <Route path="/candidates/:id/edit" element={<Protected><AddCandidate /></Protected>} />
          
          {/* Jobs */}
          <Route path="/jobs" element={<Protected><Jobs /></Protected>} />
          <Route path="/jobs/add" element={<Protected><AddJob /></Protected>} />
          <Route path="/jobs/:id/edit" element={<Protected><AddJob /></Protected>} />
          
          {/* Other Tools */}
          <Route path="/tomorrow" element={<Protected><Tomorrow /></Protected>} />
          <Route path="/daily-log" element={<Protected><DailyLog /></Protected>} />
          <Route path="/performance" element={<Protected><Performance /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          
          {/* Admin */}
          <Route path="/admin" element={<Protected><Admin /></Protected>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
        <Modal />
      </AuthProvider>
    </UIProvider>
  );
}
