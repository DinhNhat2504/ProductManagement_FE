import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Sidebar from '../Main/SideBar';

const Dashboard = () => {
  const { userDetails } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen ">
      
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p>Welcome, {userDetails?.firstName} {userDetails?.lastName}!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Total Products</h2>
            <p className="text-2xl">100</p> {/* Thay bằng API call */}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Total Orders</h2>
            <p className="text-2xl">50</p> {/* Thay bằng API call */}
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">Revenue</h2>
            <p className="text-2xl">$10,000</p> {/* Thay bằng API call */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
