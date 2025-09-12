import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [role, setRole] = useState(null);

  // Kiểm tra token đã lưu khi component khởi tạo
   useEffect(() => {
  const validateToken = async () => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedUserDetails = localStorage.getItem("userDetails");

    if (storedToken && storedUserId) {
      try {
        const response = await fetch("https://localhost:7278/api/User/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: storedToken }),
        });

        const data = await response.json();

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
          setToken(null);
          setUserId(null);
          setIsLoggedIn(false);
          setRole(null);
          localStorage.removeItem("token");
          
          localStorage.removeItem("userId");
        }
      } catch (error) {
        console.error("Lỗi xác thực token:", error);
        setToken(null);
        setUserId(null);
        setIsLoggedIn(false);
      }
    }
  };

  validateToken();
}, []);
  const register = async (firstName, lastName, email, password, roleId = 2) => {
    try {
      const response = await fetch('https://localhost:7278/api/User/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, roleId }),
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUserId(data.user.userId);
        setUserDetails(data.user);
        setRole(data.user.roleId); // Lưu role
        setIsLoggedIn(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.userId);
        localStorage.setItem('userDetails', JSON.stringify(data.user));
        return { success: true, data };
      } else {
        const error = await response.json();
        return { success: false, error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('https://localhost:7278/api/User/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setUserId(data.user.userId);
        setUserDetails(data.user);
        setRole(data.user.roleId); // Lưu role
        setIsLoggedIn(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.userId);
        localStorage.setItem('userDetails', JSON.stringify(data.user));
        return { success: true, data };
      } else {
        const error = await response.json();
        return { success: false, error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserDetails(null);
    setRole(null); // Xóa role
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem("cart");

    localStorage.removeItem('userDetails');
  };

  const isTokenValid = () => {
    return !!token;
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userId,
        token,
        userDetails,
        role, 
        register,
        login,
        logout,
        isTokenValid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};