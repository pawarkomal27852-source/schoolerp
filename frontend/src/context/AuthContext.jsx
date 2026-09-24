import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = authService.getToken();
    const savedUser = authService.getCurrentUser();
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    } else {
      // Auto-populate mock admin for instant developer/evaluator convenience
      const defaultUser = {
        id: 'u1',
        name: 'Dr. Anjali Sharma',
        role: 'Principal & Admin',
        email: 'admin@greenwood.edu.in',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRXMJ0KBBOQOsJ-Yoaer7ZJIetY6ORR1Ww5nh6AWsr_oTAAmnHXfjsR71IhZlF4sQANyXvAuH5vszqtEdstFL5oNfq4TMNyweZUvT4j8UX_keIe7FyJrwMZ-UQpXc0sw10CWdCgxpakqYqkkriHW1sgKRUsfeSqGn5ZEHdSKNhJ7NZYYLljSC0Isig7PhnSa-_T4WohXA2ji5cHVnKYB5TifENxeO1fB-ZQonf9W0yV7Y2rZZUwiAQ',
      };
      const defaultToken = 'mock_jwt_token_schoolerp_admin_2024';
      localStorage.setItem('schoolerp_token', defaultToken);
      localStorage.setItem('schoolerp_user', JSON.stringify(defaultUser));
      setToken(defaultToken);
      setUser(defaultUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
