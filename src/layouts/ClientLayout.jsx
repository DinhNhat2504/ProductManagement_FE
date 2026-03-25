import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Client/Header/Navbar';
import Chatbot from '../pages/Client/Chatbot';
import ChatWidget from '../pages/Client/ChatWidget';

const ClientLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Navbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <Chatbot />
      {/* <ChatWidget /> */}
    </div>
  );
};

export default ClientLayout;
