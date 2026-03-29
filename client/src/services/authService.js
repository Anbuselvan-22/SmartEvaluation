import api from './api';

export const authService = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  verifyToken: (token) => {
    return api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => response.data.user);
  },

  getCurrentUser: () => {
    return api.get('/auth/me').then(response => response.data);
  }
};
