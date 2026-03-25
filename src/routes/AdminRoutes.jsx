import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/Admin/DashBoard';
import ProductManagement from '../pages/Admin/ProductManagement';
import BrandManagement from '../pages/Admin/BrandManagement';
import OrderManagement from '../pages/Admin/OrderManagement';
import UserManagement from '../pages/Admin/UserManagement';
import ChatAdminDashboard from '../pages/Admin/ChatAdminDashboard';
import StatisticsPage from '../pages/Admin/StatisticsPage';

const AdminRoutes = () => {
  const { isLoggedIn, role } = useContext(AuthContext);

  if (!isLoggedIn || role !== 1) {
    return <Navigate to="/login" />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/brands" element={<BrandManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/chats" element={<ChatAdminDashboard />} />
        <Route path="/statics" element={<StatisticsPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;