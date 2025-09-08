import React from "react";
import './App.css'
import { CartProvider } from './context/CartContext.jsx';
import ClientRoutes from '../routes/ClientRoutes.jsx';
import AdminRoutes from '../routes/AdminRoutes.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import { useContext } from 'react';
import Navbar from './components/Client/Header/Navbar.jsx';
import Login from './components/Client/MainContent/Login.jsx';
import Register from './components/Client/MainContent/Register.jsx';
function App() {
  const { isLoggedIn, role } = useContext(AuthContext);

  return (
    <CartProvider>
      {/* Hiển thị Navbar cho khách hàng hoặc người dùng chưa đăng nhập */}
      {role !== 1 && <Navbar />}
      <Routes>
        {/* Route khách hàng */}
        <Route path="/*" element={<ClientRoutes />} />

        {/* Route admin */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Route đăng nhập */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              role === 1 ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Login />
            )
          }
        />

        {/* Route đăng ký */}
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/" /> : <Register />}
        />
      </Routes>
    </CartProvider>
  );
}

export default App
