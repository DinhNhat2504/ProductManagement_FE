import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate ,Link} from "react-router-dom";
import { CartContext } from "../../../context/CartContext";

export function AddToCartButton({ product, quantity, classCustom, children , isIcon= true}) {

  const { addToCart } = useContext(CartContext);

  const handleAddToCart = () => {
    addToCart(product.productId, product.name, quantity, product.price);
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`); // Alert tạm thời, thay bằng toast sau
  };

  return (
    <button onClick={handleAddToCart} className={classCustom}
    >
     {!isIcon ? ( <>
     <span className="absolute inset-0 bg-red-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-250 ease-in-out"></span>
        <span className="relative z-10 transition-colors duration-500 ease-in-out group-hover:text-white">
          {children}
        </span> </>) : (children)} 
      
    </button>
  );
}
export function BuyNowButton({ product, quantity, classCustom , children }) {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        buyNowItem: {
          productId: product.productId,
          quantity,
          product // Truyền thông tin sản phẩm để hiển thị
        }
      }
    });
  };

  return (
    <button onClick={handleBuyNow} className={classCustom}>
      {children}
    </button>
  );
}   
export function NavigateButton(){
  return (
    <>
     <Link
        to="/products"
        className="relative  px-4 py-2 text-sm text-gray-700 overflow-hidden group flex items-center justify-center border-2 border-black rounded-md mt-4 mx-auto w-48 "
      >
        <span className="absolute inset-0 bg-red-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-250 ease-in-out"></span>
        <span className="relative z-10 transition-colors duration-500 ease-in-out group-hover:text-white">
          Xem thêm ...
        </span>
      </Link>
    </>
  )
}
export default {
  AddToCartButton,
  BuyNowButton
};