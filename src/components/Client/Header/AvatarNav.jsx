import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { AuthContext } from "../../../context/AuthContext";

const AvatarNav = () => {
  const [isClick, setIsClick] = useState(false);

  const { isLoggedIn, userId, token, logout } = useContext(AuthContext);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsClick(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div
        onClick={() => setIsClick(!isClick)}
        className="cursor-pointer text-gray-500 hover:text-indigo-600 transition duration-150 ease-in-out"
      >
        <FiUser size={24} />
      </div>

      {/* Menu dropdown */}
      <div
        className={`absolute right-0 mt-2 p-0.5 w-48 bg-white border border-gray-200 shadow-lg rounded-md transition-all duration-300 ease-in-out origin-top ${
          isClick
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {isLoggedIn ? (
          <>
            <Link
              to={`/profile/${userId}`}
              className="relative block px-4 py-2 text-sm text-gray-700 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-red-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></span>
              <span className="relative z-10 transition-colors duration-350 ease-in-out group-hover:text-white">
                Xem hồ sơ
              </span>
            </Link>
            <Link
              to="/settings"
              className="relative block px-4 py-2 text-sm text-gray-700 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-red-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></span>
              <span className="relative z-10 transition-colors duration-350 ease-in-out group-hover:text-white">
                Cài đặt
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="relative w-full text-left px-4 py-2 text-sm text-gray-700 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-red-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></span>
              <span className="relative z-10 transition-colors duration-350 ease-in-out group-hover:text-white">
                Đăng xuất
              </span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="relative block px-4 py-2 text-sm text-gray-700 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-red-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></span>
              <span className="relative z-10 transition-colors duration-350 ease-in-out group-hover:text-white">
                Đăng nhập
              </span>
            </Link>
            <Link
              to="/register"
              className="relative block px-4 py-2 text-sm text-gray-700 overflow-hidden group"
            >
              <span className="absolute inset-0 bg-red-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></span>
              <span className="relative z-10 transition-colors duration-350 ease-in-out group-hover:text-white">
                Đăng ký
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AvatarNav;
