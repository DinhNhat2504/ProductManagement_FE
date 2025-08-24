import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://localhost:7278/Category');
        if (!response.ok) throw new Error('API call failed');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([
          { id: 1, name: 'Điện thoại' },
          { id: 2, name: 'Laptop' },
          { id: 3, name: 'Phụ kiện' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Thêm hiệu ứng khóa scroll của body khi menu mobile mở
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function để đảm bảo overflow được reset khi component bị unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);


  return (
    <> {/* Sử dụng Fragment để chứa cả Navbar và Mobile Menu Overlay */}
      <nav className="bg-white shadow-md sticky top-0 z-30 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            <div className="flex-shrink-0">
              <Link to="/">
                <img 
                  className="h-12 w-auto" 
                  src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg" 
                  alt="Logo" 
                />
              </Link>
            </div>

            {/* Menu cho Desktop */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {/* ... Nội dung menu desktop giữ nguyên ... */}
              <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-md font-medium transition duration-150 ease-in-out">Trang chủ</Link>
              <Link to="/products" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-md font-medium transition duration-150 ease-in-out">Sản phẩm</Link>
              <div className="relative group">
                <button className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-md font-medium transition duration-150 ease-in-out flex items-center">
                  Danh mục
                  <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className="absolute left-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100">
                  <div className="bg-white rounded-md shadow-lg py-1">
                    {categories.map((category) => (
                      <Link
                        key={category.categoryId}
                        to={`/products/category/${category.categoryId}`}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link to="/blog" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-md font-medium transition duration-150 ease-in-out">Blog</Link>
              <Link to="/about" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-md font-medium transition duration-150 ease-in-out">Về chúng tôi</Link>
            </div>

            <div className="hidden md:flex items-center space-x-5">
              <Link to="/cart" className="text-gray-500 hover:text-indigo-600 transition duration-150 ease-in-out"><FiShoppingCart size={24} /></Link>
              <Link to="/profile" className="text-gray-500 hover:text-indigo-600 transition duration-150 ease-in-out"><FiUser size={24} /></Link>
            </div>

            {/* Nút Hamburger cho Mobile */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Open menu">
                <FiMenu size={26} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ---- PHẦN MENU MOBILE TRƯỢT TỪ BÊN TRÁI (BẮT ĐẦU THAY ĐỔI TỪ ĐÂY) ---- */}
      
      {/* 1. Lớp nền mờ (Backdrop) */}
      <div 
        className={`fixed inset-0  bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* 2. Khung menu trượt */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 w-4/5 max-w-sm p-6 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Nút đóng menu nằm bên trong */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Menu</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
            <FiX size={24} />
          </button>
        </div>

        {/* Nội dung menu */}
        <div className="space-y-4">
          <Link to="/" className="block text-gray-700 hover:text-indigo-600 py-2 text-lg" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link>
          <Link to="/products" className="block text-gray-700 hover:text-indigo-600 py-2 text-lg" onClick={() => setIsMobileMenuOpen(false)}>Sản phẩm</Link>
          
          <div>
            <button 
              onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
              className="w-full text-left text-gray-700 hover:text-indigo-600 py-2 text-lg flex justify-between items-center"
            >
              Danh mục
              <svg className={`w-5 h-5 transition-transform duration-300 ${isMobileCategoryOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isMobileCategoryOpen && (
              <div className="pl-4 mt-2 space-y-2 border-l-2 border-gray-200">
                {categories.map((category) => (
                 <Link
                        key={category.categoryId}
                        to={`/products/category/${category.categoryId}`}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/blog" className="block text-gray-700 hover:text-indigo-600 py-2 text-lg" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
          <Link to="/about" className="block text-gray-700 hover:text-indigo-600 py-2 text-lg" onClick={() => setIsMobileMenuOpen(false)}>Về chúng tôi</Link>
          
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <Link to="/cart" className="flex items-center text-gray-700 hover:text-indigo-600" onClick={() => setIsMobileMenuOpen(false)}>
              <FiShoppingCart size={22} /><span className="ml-3 text-lg">Giỏ hàng</span>
            </Link>
            <Link to="/profile" className="flex items-center text-gray-700 hover:text-indigo-600" onClick={() => setIsMobileMenuOpen(false)}>
              <FiUser size={22} /><span className="ml-3 text-lg">Tài khoản</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;