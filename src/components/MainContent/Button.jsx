import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";

export function AddToCartButton({ product, quantity, classCustom, children }) {

  const { addToCart } = useContext(CartContext);

  const handleAddToCart = () => {
    addToCart(product.productId, product.name, quantity, product.price);
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`); // Alert tạm thời, thay bằng toast sau
  };

  return (
    <button onClick={handleAddToCart} className={classCustom}>
      {children}
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

export default {
  AddToCartButton,
  BuyNowButton
};