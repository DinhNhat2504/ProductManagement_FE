import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../src/context/AuthContext';
import Sidebar from '../src/components/Admin/Main/SideBar';
import Dashboard from '../src/components/Admin/Page/DashBoard';
import ProductManagement from '../src/components/Admin/Page/ProductManagement';
import OrderManagement from '../src/components/Admin/Page/OrderManagement';
import UserManagement from '../src/components/Admin/Page/UserManagement';
const AdminRoutes = () => {
  const { isLoggedIn, role } = useContext(AuthContext);

  // Nếu không đăng nhập hoặc không phải admin, chuyển hướng về /login
  if (!isLoggedIn || role !== 1) {
    return <Navigate to="/login" />;
  }

  return (
    <>
    <div className="flex min-h-screen w-full">
      <Sidebar /> 
      <div className="flex w-full flex-1 flex-col md:ml-64">
      <main className="flex-1 p-6">
        <div className="h-full rounded-lg border border-gray-200 bg-white shadow">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
        </div>
      </main>
      </div>
    </div></>
  );
};

export default AdminRoutes;