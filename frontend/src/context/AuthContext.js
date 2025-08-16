import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  // Define logout function with useCallback to prevent infinite re-renders
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication...', { token: !!token, user: !!user });
      
      if (token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`);
          console.log('✅ Auth check successful:', response.data.data);
          setUser(response.data.data);
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          // Only logout on authentication errors (401, 404) or network errors
          if (error.response?.status === 401 || error.response?.status === 404 || error.code === 'ECONNREFUSED') {
            console.log('🔒 Authentication failed, logging out...');
            logout();
          } else {
            console.log('⚠️ Non-auth error, keeping user logged in:', error.message);
          }
        }
      } else {
        console.log('🔑 No token found, user not authenticated');
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, logout]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password
      });

      const { user: userData, token: authToken } = response.data.data;
      
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('adminToken', authToken);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 