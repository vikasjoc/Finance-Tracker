import API from '../utils/axios';

export const authService = {
  login(credentials) {
    return API.post('/auth/login', credentials);
  },

  register(userData) {
    return API.post('/auth/register', userData);
  },

  forgotPassword(email) {
    return API.post('/auth/forgot-password', { email });
  },

  resetPassword(token, password) {
    return API.post(`/auth/reset-password/${token}`, { password });
  },

  getMe() {
    return API.get('/auth/me');
  },

  updateProfile(userData) {
    return API.put('/auth/updatedetails', userData);
  },

  updatePassword(passwords) {
    return API.put('/auth/updatepassword', passwords);
  },

  logout() {
    return API.post('/auth/logout');
  },
};

