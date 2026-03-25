import React, { createContext, useState, useEffect, useMemo } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [role, setRole] = useState(null);

  const clearAuthData = () => {
    setToken(null);
    setUserId(null);
    setUserDetails(null);
    setRole(null);
    setIsLoggedIn(false);
    
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('cart');
  };

  const setAuthData = (data) => {
    setToken(data.token);
    setUserId(data.user.userId);
    setUserDetails(data.user);
    setRole(data.user.roleId);
    setIsLoggedIn(true);
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.user.userId);
    localStorage.setItem('userDetails', JSON.stringify(data.user));
  };

  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");
      const storedUserDetails = localStorage.getItem("userDetails");

      if (storedToken && storedUserId) {
        try {
          const response = await api.post("/api/User/validate-token", { token: storedToken });
          const data = response.data;

          if (data.valid) {
            setToken(storedToken);
            setUserId(storedUserId);
            setIsLoggedIn(true);
            if (storedUserDetails) {
              const user = JSON.parse(storedUserDetails);
              setUserDetails(user);
              setRole(user.roleId);
            }
          } else {
            clearAuthData();
          }
        } catch (error) {
          console.error("Lỗi xác thực token:", error);
          clearAuthData();
        }
      }
    };

    validateToken();
  }, []);

  const register = async (firstName, lastName, email, password, roleId = 2) => {
    try {
      const response = await api.post('/api/User/register', { firstName, lastName, email, password, roleId });
      const data = response.data;
      
      setAuthData(data);
      
      return { success: true, data };
    } catch (err) {
      const errorData = err.response?.data || { message: err.message };
      return { success: false, error: errorData };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/User/login', { email, password });
      const data = response.data;
      
      setAuthData(data);
      
      return { success: true, data };
    } catch (err) {
      const errorData = err.response?.data || { message: err.message };
      return { success: false, error: errorData };
    }
  };

  const logout = () => {
    clearAuthData();
  };

  const isTokenValid = () => {
    return !!token;
  };

  const contextValue = useMemo(() => ({
    isLoggedIn, userId, token, userDetails, role, register, login, logout, isTokenValid
  }), [isLoggedIn, userId, token, userDetails, role]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};