import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid or expired
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateRole: (targetRole) => api.put('/auth/role', { targetRole })
};

// Resume endpoints
export const resumeApi = {
  upload: (formData) =>
    api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getAll: () => api.get('/resume'),
  getById: (id) => api.get(`/resume/${id}`),
  delete: (id) => api.delete(`/resume/${id}`)
};

// Analysis endpoints
export const analysisApi = {
  analyze: (data) => api.post('/analysis', data),
  getLatest: () => api.get('/analysis/latest'),
  getByResumeId: (resumeId) => api.get(`/analysis/${resumeId}`)
};

// Job endpoints
export const jobApi = {
  create: (data) => api.post('/jobs', data),
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  delete: (id) => api.delete(`/jobs/${id}`)
};

// Match endpoints
export const matchApi = {
  calculate: (data) => api.post('/matches', data),
  getAll: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`)
};

// Skill Gap endpoints
export const skillGapApi = {
  getLatest: () => api.get('/skills/latest'),
  getById: (id) => api.get(`/skills/${id}`)
};

// Roadmap endpoints
export const roadmapApi = {
  generate: (data) => api.post('/roadmap/generate', data),
  getLatest: () => api.get('/roadmap/latest')
};

// Interview endpoints
export const interviewApi = {
  start: (data) => api.post('/interview/start', data),
  submitAnswer: (sessionId, questionNumber, userAnswer) =>
    api.post(`/interview/${sessionId}/answer`, { questionNumber, userAnswer }),
  complete: (sessionId) => api.post(`/interview/${sessionId}/complete`),
  getHistory: () => api.get('/interview/history'),
  getById: (sessionId) => api.get(`/interview/${sessionId}`)
};

// Dashboard endpoints
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary')
};

export default api;
