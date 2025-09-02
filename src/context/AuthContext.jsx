import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  // Kiểm tra token đã lưu khi component khởi tạo
   useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    const storedUserDetails = localStorage.getItem("userDetails");
    if (storedToken && storedUserId) {
      // Gọi API xác thực token
      fetch("https://localhost:7278/api/User/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: storedToken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setToken(storedToken);
            setUserId(storedUserId);
            setIsLoggedIn(true);
            if (storedUserDetails) {
              setUserDetails(JSON.parse(storedUserDetails));
            }
          } else {
            setToken(null);
            setUserId(null);
            setIsLoggedIn(false);
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
          }
        });
    }
  }, []);
  const register = async (firstName, lastName, email, password, roleId = 1) => {
    try {
      const response = await fetch('https://localhost:7278/api/User/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, roleId }),
      });
      if (response.ok) {
        const data = await response.json();
        // API trả về { token, user: { userId, firstName, lastName, email, avatarUrl, address, phoneNumber } }
        setToken(data.token);
        setUserId(data.user.userId);
        setUserDetails({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          avatarUrl: data.user.avatarUrl,
          address: data.user.address,
          phoneNumber: data.user.phoneNumber,
        });
        setIsLoggedIn(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.userId);
        localStorage.setItem('userDetails', JSON.stringify(data.user));
        console.log('Đăng ký thành công:', data);
        return { success: true, data };
      } else {
        const error = await response.json();
        console.error('Đăng ký thất bại:', error);
        return { success: false, error };
      }
    } catch (err) {
      console.error('Lỗi khi đăng ký:', err);
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
        // API trả về { token, user: { userId, firstName, lastName, email, avatarUrl, address, phoneNumber } }
        setToken(data.token);
        setUserId(data.user.userId);
        setUserDetails({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          avatarUrl: data.user.avatarUrl,
          address: data.user.address,
          phoneNumber: data.user.phoneNumber,
        });
        setIsLoggedIn(true);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.userId);
        localStorage.setItem('userDetails', JSON.stringify(data.user));
        console.log('Đăng nhập thành công:', data);
        return { success: true, data };
      } else {
        const error = await response.json();
        console.error('Đăng nhập thất bại:', error);
        return { success: false, error };
      }
    } catch (err) {
      console.error('Lỗi khi đăng nhập:', err);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserDetails(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userDetails');
    console.log('Đã đăng xuất');
  };

  // Kiểm tra token còn hợp lệ (đơn giản hóa, giả sử backend xử lý thời hạn token)
  const isTokenValid = () => {
    return !!token; // Trong ứng dụng thực tế, kiểm tra thời hạn token qua JWT payload
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userId,
        token,
        userDetails,
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