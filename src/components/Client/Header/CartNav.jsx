import React from "react";
import { useState,useEffect,useContext } from "react";
import { FiX,FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { CartContext } from "../../../context/CartContext";
import Cart from "../Page/Cart";
const CartNav = () => {
  const [isOpenCarNav, setIsOpenCarNav] = useState(false);
const { cart } = useContext(CartContext);

  // Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  
useEffect(() => {
  const isMobile = window.innerWidth < 768; // hoặc breakpoint bạn muốn

  if (isMobile && isOpenCarNav) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "unset";
  }

  return () => {
    document.body.style.overflow = "unset";
  };
}, [isOpenCarNav]);

  return (
    <>
      {/* Nút mở giỏ hàng */}
      <div
        onClick={() => setIsOpenCarNav(true)}
        className="text-gray-500 hover:text-indigo-600 transition duration-150 ease-in-out cursor-pointer"
      >
        <FiShoppingCart size={24} />
        {totalQuantity > 0 && (
        <span className="absolute top-5 -right-2 md:right-15 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full ">
          {totalQuantity}
        </span>
      )}
      </div>

      {/* Overlay mờ nền */}
      <div
        className={`fixed inset-0  bg-opacity-50 z-[1001] transition-opacity duration-500 ${
          isOpenCarNav ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpenCarNav(false)}
      ></div>

      {/* Giỏ hàng trượt từ phải */}
      <div
        className={`fixed
 top-0 right-0 h-full bg-white shadow-2xl z-[1002] w-4/5 lg:w-full max-w-[450px] p-6 transform transition-transform duration-700 ease-in-out ${
          isOpenCarNav ? "translate-x-0" : "translate-x-[100vw]"
        }`}
      >
        {/* Header giỏ hàng */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Giỏ hàng</h2>
          <button
            onClick={() => setIsOpenCarNav(false)}
            aria-label="Đóng giỏ hàng"
            className="text-gray-500 hover:text-red-500 transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Nội dung giỏ hàng */}
        <div className="space-y-4">
          <Cart isSidebar={true}/>
           <Link to="/cart" className="text-sm text-red-500 hover:border-b-2">Đến trang giỏ hàng </Link>
        </div>
      </div>
    </>
  );
};


export default CartNav;