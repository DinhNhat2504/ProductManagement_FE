import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../src/context/AuthContext';
import Sidebar from '../src/components/Admin/Main/Sidebar';
import Dashboard from '../src/components/Admin/Page/DashBoard';
import ProductManagement from '../src/components/Admin/Page/ProductManagement';
import OrderManagement from '../src/components/Admin/Page/OrderManagement';
import UserManagement from '../src/components/Admin/Page/UserManagement';
import { motion } from "framer-motion";
import { SidebarProvider } from '../src/components/Admin/Main/SidebarContext';
import { useSidebar } from "../src/components/Admin/Main/SidebarContext";
import MainRoute from '../src/components/Admin/Page/MainRoute';


const AdminRoutes = () => {
  const { isLoggedIn, role } = useContext(AuthContext);
  



  // Nếu không đăng nhập hoặc không phải admin, chuyển hướng về /login
  if (!isLoggedIn || role !== 1) {
    return <Navigate to="/login" />;
  }

  return (
    <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <Sidebar /> 
      <MainRoute/>
    </div></SidebarProvider>
  );
};

export default AdminRoutes;