import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Admin/Main/Sidebar';
import { SidebarProvider, useSidebar } from '../components/Admin/Main/SidebarContext';
import { motion } from "framer-motion";

const AdminLayoutContent = () => {
  const { open } = useSidebar();
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex w-full flex-1 flex-col">
        <main className="flex-1 p-6">
          <motion.div
            initial={{ x: open ? 0 : -15, opacity: 1 }}
            animate={{ x: open ? 0 : -15, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="h-full rounded-lg border border-gray-200 bg-white shadow min-h-[calc(100vh-3rem)]">
              <Outlet />
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <AdminLayoutContent />
    </SidebarProvider>
  );
};

export default AdminLayout;
