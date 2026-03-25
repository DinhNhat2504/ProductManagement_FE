import React from "react";
import './App.css'
import { CartProvider } from './context/CartContext.jsx';
import ClientRoutes from './routes/ClientRoutes.jsx';
import AdminRoutes from './routes/AdminRoutes.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import { useContext } from 'react';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';
function App() {
  const { isLoggedIn, role } = useContext(AuthContext);

  return (
    <CartProvider>
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
