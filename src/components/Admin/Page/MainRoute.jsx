import { SidebarProvider, useSidebar } from "../Main/SidebarContext";
import { motion } from "framer-motion";
import Dashboard from "./DashBoard";
import ProductManagement from "./ProductManagement";
import OrderManagement from "./OrderManagement";
import UserManagement from "./UserManagement";
import { Route, Routes } from "react-router-dom";
import StatisticsPage from "./StatisticsPage";

import { AuthContext } from "../../../context/AuthContext";
import ChatAdminDashboard from "./ChatAdminDashboard";
const MainRoute = () => {
  const { open } = useSidebar();
  
  return (
    <>
      
        <div className="flex w-full flex-1 flex-col "> 
           
          <main className="flex-1 p-6">
            <motion.div
        initial={open ? { x: 225, opacity: 1 } : { y: 0, opacity: 0 }} // bắt đầu lệch phải 225px
        animate={open ? { x: 0, opacity: 1 } : { x: -15, opacity: 1 }} // trượt về vị trí gốc
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
            <div className="h-full rounded-lg border border-gray-200 bg-white shadow">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/orders" element={<OrderManagement />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/chats" element={<ChatAdminDashboard/>} />
                <Route path="/statics" element={<StatisticsPage />} />

              </Routes>
            </div></motion.div>
          </main>
        </div>
      
    </>
  );
};
export default MainRoute;
