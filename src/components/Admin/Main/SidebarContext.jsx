// SidebarContext.js
import { createContext, useContext, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(true); // mặc định mở

  const toggleSidebar = () => setOpen(prev => !prev);

  return (
    <SidebarContext.Provider value={{ open, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);