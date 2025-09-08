import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { FaTachometerAlt, FaBox, FaShoppingCart, FaUsers, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

const Sidebar = () => {
  const { logout, role, userDetails } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Chỉ hiển thị sidebar cho admin
  if (role !== 1) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Danh sách các mục điều hướng
  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: FaTachometerAlt },
    { to: '/admin/products', label: 'Products', icon: FaBox },
    { to: '/admin/orders', label: 'Orders', icon: FaShoppingCart },
    { to: '/admin/users', label: 'Users', icon: FaUsers },
  ];

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen bg-gray-800 text-white p-4 fixed top-0 left-0 transition-all duration-300 flex flex-col z-50 md:w-64 md:flex md:flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {!isCollapsed && (
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-gray-700 "
        >
          {isCollapsed ? <FaBars size={24} /> : <FaTimes size={24} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center py-2 px-4 rounded mb-2 transition-colors ${
                isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`
            }
            title={isCollapsed ? item.label : ''} // Tooltip khi thu gọn
          >
            <item.icon className="w-6 h-6 mr-3" />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Avatar Section */}
      <div className="mt-auto">
        <div className="flex items-center py-2 px-4 rounded hover:bg-gray-700">
          <FaUserCircle className="w-6 h-6 mr-3" />
          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium">
                {userDetails?.firstName} {userDetails?.lastName}
              </p>
              <p className="text-xs text-gray-400">{userDetails?.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center py-2 px-4 rounded hover:bg-red-600 w-full mt-2"
        >
          <FaUserCircle className="w-6 h-6 mr-3" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;