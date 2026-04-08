// =====================================================================
// API Service — All calls to the backend
// Base URL: /api (proxied to http://localhost:5000 via Vite)
// =====================================================================

const BASE = 'https://haaaa-0swa.onrender.com/api';

function getToken() {
  return localStorage.getItem('sss_token');
}

async function req(method, path, body) {
  const token = getToken();
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// AUTH
export const api = {
  login: (username, password) => req('POST', '/auth/login', { username, password }),
  me: () => req('GET', '/auth/me'),

  // CANDIDATES
  getCandidates: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return req('GET', `/candidates${q ? '?' + q : ''}`);
  },
  getStats: () => req('GET', '/candidates/stats'),
  getTomorrow: () => req('GET', '/candidates/tomorrow'),
  getFollowups: () => req('GET', '/candidates/followups'),
  getCandidate: (id) => req('GET', `/candidates/${id}`),
  addCandidate: (data) => req('POST', '/candidates', data),
  updateCandidate: (id, data) => req('PUT', `/candidates/${id}`, data),
  deleteCandidate: (id) => req('DELETE', `/candidates/${id}`),

  // JOBS
  getJobs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return req('GET', `/jobs${q ? '?' + q : ''}`);
  },
  getMatchingJobs: (role, location) => {
    const p = new URLSearchParams({ role, ...(location ? { location } : {}) }).toString();
    return req('GET', `/jobs/match?${p}`);
  },
  getJob: (id) => req('GET', `/jobs/${id}`),
  addJob: (data) => req('POST', '/jobs', data),
  updateJob: (id, data) => req('PUT', `/jobs/${id}`, data),
  deleteJob: (id) => req('DELETE', `/jobs/${id}`),

  // STAFF
  getStaff: () => req('GET', '/staff'),
  getPerformance: () => req('GET', '/staff/performance'),
  addStaff: (data) => req('POST', '/staff', data),
  updateStaff: (id, data) => req('PUT', `/staff/${id}`, data),
  deleteStaff: (id) => req('DELETE', `/staff/${id}`),

  // LOGS
  getLogs: () => req('GET', '/logs'),
  getTodayLog: () => req('GET', '/logs/today'),
  saveLog: (data) => req('POST', '/logs', data),
};
