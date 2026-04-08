// =====================================================================
// API Service — All calls to the backend
// =====================================================================

// Ensure there is NO trailing slash here
const BASE = 'https://haaaa-production.up.railway.app/api';

function getToken() {
  return localStorage.getItem('sss_token');
}

async function req(method, path, body) {
  const token = getToken();
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE}${cleanPath}`;

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  try {
    const res = await fetch(url, opts);
    
    // Handle empty responses
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
    }
    return data;
  } catch (err) {
    console.error("API Request Failed:", err);
    throw err;
  }
}

// AUTH
export const api = {
  // We remove the extra '/auth' because the backend route is likely app.use('/api/auth', ...)
  // If your server.js uses app.use('/api/auth'), then req('POST', '/auth/login') is correct.
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
