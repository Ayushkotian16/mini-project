import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ── Bookings ──────────────────────────────────────────
export const bookingAPI = {
  sendOTP: (phone) => api.post('/bookings/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/bookings/verify-otp', { phone, otp }),
  create: (data) => api.post('/bookings', data),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status, adminNotes) => api.patch(`/bookings/${id}/status`, { status, adminNotes }),
  delete: (id) => api.delete(`/bookings/${id}`),
};

// ── Events ────────────────────────────────────────────
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

// ── Team ──────────────────────────────────────────────
export const teamAPI = {
  getPublic: () => api.get('/team'),
  getAll: (params) => api.get('/team/admin/all', { params }),
  getById: (id) => api.get(`/team/${id}`),
  create: (data) => api.post('/team', data),
  update: (id, data) => api.put(`/team/${id}`, data),
  delete: (id) => api.delete(`/team/${id}`),
  apply: (data) => api.post('/team/apply', data),
};

// ── Reviews ───────────────────────────────────────────
export const reviewAPI = {
  getApproved: () => api.get('/reviews'),
  getAll: () => api.get('/reviews/admin/all'),
  submit: (data) => api.post('/reviews', data),
  approve: (id) => api.patch(`/reviews/${id}/approve`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// ── Contact ───────────────────────────────────────────
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  markRead: (id) => api.patch(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
};

// ── Content ───────────────────────────────────────────
export const contentAPI = {
  getAll: () => api.get('/content'),
  getSection: (section) => api.get(`/content/${section}`),
  update: (section, data) => api.put(`/content/${section}`, data),
};

export default api;
