import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { FaTachometerAlt, FaBox, FaShoppingCart, FaUsers, FaUserCircle, FaBars, FaTimes, FaRocket } from 'react-icons/fa';

const Sidebar = () => {
  const { logout, role, userDetails } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
    setIsUserMenuOpen(false); // Đóng menu người dùng khi toggle
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
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
        isCollapsed ? 'w-16' : 'w-64'
      } h-screen bg-gradient-to-b from-teal-900 to-teal-700 text-white p-4 fixed top-0 left-0 transition-all duration-300 ease-in-out flex flex-col z-50 shadow-lg`}
    >
      {/* Header với Logo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
         
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight">Admin Panel</span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors duration-200"
        >
          {isCollapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'text-teal-100 hover:bg-teal-600 hover:text-white'
              }`
            }
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Avatar với Dropdown */}
      <div className="mt-auto">
        <button
          onClick={toggleUserMenu}
          className="flex items-center gap-2 p-2 rounded-lg w-full text-teal-100 hover:bg-teal-600 hover:text-white transition-all duration-200"
        >
          <FaUserCircle className="w-5 h-5" />
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {userDetails?.firstName} {userDetails?.lastName}
            </span>
          )}
        </button>
        {isUserMenuOpen && !isCollapsed && (
          <div className="mt-2 bg-teal-800 rounded-lg shadow-lg p-3 w-full">
            <div className="mb-2">
              <p className="text-sm font-medium text-teal-100">
                {userDetails?.firstName} {userDetails?.lastName}
              </p>
              <p className="text-xs text-teal-300">{userDetails?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 rounded-lg w-full text-teal-100 hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <FaUserCircle className="w-5 h-5" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;