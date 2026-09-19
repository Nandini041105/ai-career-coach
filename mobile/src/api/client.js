import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default host for local Wi-Fi / mobile LAN access
export const DEFAULT_API_BASE = 'http://10.178.125.122:5000/api';
export const LOCALHOST_API_BASE = 'http://localhost:5000/api';

const STORAGE_KEYS = {
  TOKEN: '@career_coach_jwt_token',
  USER: '@career_coach_user_data',
  API_BASE: '@career_coach_api_base'
};

const api = axios.create({
  baseURL: DEFAULT_API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Initialize stored base URL if customized
export const initializeApiBase = async () => {
  try {
    const savedBase = await AsyncStorage.getItem(STORAGE_KEYS.API_BASE);
    if (savedBase) {
      api.defaults.baseURL = savedBase;
      return savedBase;
    }
  } catch (e) {
    console.warn('[API] Could not load saved base URL', e);
  }
  return DEFAULT_API_BASE;
};

// Allow user to dynamically update backend host IP from settings
export const setApiBaseUrl = async (newBase) => {
  const formatted = newBase.endsWith('/api') ? newBase : `${newBase.replace(/\/$/, '')}/api`;
  api.defaults.baseURL = formatted;
  await AsyncStorage.setItem(STORAGE_KEYS.API_BASE, formatted);
  return formatted;
};

// Request interceptor: attach auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[API Request Interceptor Error]', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: standard error messages
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token on auth failure
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network request failed. Please verify the backend server is running and reachable.';
    return Promise.reject(new Error(message));
  }
);

// Auth Endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateRole: (targetRole) => api.put('/auth/role', { targetRole })
};

// Resume Endpoints
export const resumeApi = {
  upload: (formData) =>
    api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getAll: () => api.get('/resume'),
  getById: (id) => api.get(`/resume/${id}`),
  delete: (id) => api.delete(`/resume/${id}`)
};

// Analysis Endpoints
export const analysisApi = {
  analyze: (data) => api.post('/analysis', data),
  getLatest: () => api.get('/analysis/latest'),
  getByResumeId: (resumeId) => api.get(`/analysis/${resumeId}`)
};

// Job Endpoints
export const jobApi = {
  create: (data) => api.post('/jobs', data),
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  delete: (id) => api.delete(`/jobs/${id}`)
};

// Match Endpoints
export const matchApi = {
  calculate: (data) => api.post('/matches', data),
  getAll: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`)
};

// Skill Gap Endpoints
export const skillGapApi = {
  getLatest: () => api.get('/skills/latest'),
  getById: (id) => api.get(`/skills/${id}`)
};

// Roadmap Endpoints
export const roadmapApi = {
  generate: (data) => api.post('/roadmap/generate', data),
  getLatest: () => api.get('/roadmap/latest')
};

// Mock Interview Endpoints
export const interviewApi = {
  start: (data) => api.post('/interview/start', data),
  submitAnswer: (sessionId, questionNumber, userAnswer) =>
    api.post(`/interview/${sessionId}/answer`, { questionNumber, userAnswer }),
  complete: (sessionId) => api.post(`/interview/${sessionId}/complete`),
  getHistory: () => api.get('/interview/history'),
  getById: (sessionId) => api.get(`/interview/${sessionId}`)
};

// Dashboard Endpoints
export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary')
};

export { STORAGE_KEYS };
export default api;
