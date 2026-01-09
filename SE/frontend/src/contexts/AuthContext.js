import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        // Verify the user object has required fields
        if (userObj && userObj.id && userObj.role) {
          setToken(storedToken);
          setUser(userObj);
          console.log('Auth restored from storage for user:', userObj.name);
        } else {
          console.log('Invalid stored user object, clearing storage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      return response;
    } catch (err) {
      const errorMessage = err.data?.message || err.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login for:', username);
      const response = await authAPI.login({ username, password });
      console.log('Login response:', response);
      
      // Ensure the response has the expected structure
      if (!response.token || !response.user || !response.user.id) {
        throw new Error('Invalid login response structure');
      }
      
      // Store token and user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      
      console.log('Login successful, stored user:', response.user.name, 'with ID:', response.user.id);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    signup,
    login,
    logout,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
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