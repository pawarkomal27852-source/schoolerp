import api from './api';

const TOKEN_KEY = 'schoolerp_token';
const USER_KEY = 'schoolerp_user';

export const authService = {
  async login(email, password) {
    try {
      // Try real backend first
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { token, user };
    } catch {
      // Mock development fallback
      if (email === 'admin@schoolerp.com' && password === 'admin123' || (email && password)) {
        const mockUser = {
          id: 'u1',
          name: 'Dr. Anjali Sharma',
          role: 'Admin',
          email: email || 'admin@schoolerp.com',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRXMJ0KBBOQOsJ-Yoaer7ZJIetY6ORR1Ww5nh6AWsr_oTAAmnHXfjsR71IhZlF4sQANyXvAuH5vszqtEdstFL5oNfq4TMNyweZUvT4j8UX_keIe7FyJrwMZ-UQpXc0sw10CWdCgxpakqYqkkriHW1sgKRUsfeSqGn5ZEHdSKNhJ7NZYYLljSC0Isig7PhnSa-_T4WohXA2ji5cHVnKYB5TifENxeO1fB-ZQonf9W0yV7Y2rZZUwiAQ',
        };
        const mockToken = 'mock_jwt_token_schoolerp_admin_2024';
        localStorage.setItem(TOKEN_KEY, mockToken);
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        return { token: mockToken, user: mockUser };
      }
      throw new Error('Invalid email or password');
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
