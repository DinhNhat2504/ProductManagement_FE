import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'; // Import nếu có AuthContext

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { isLoggedIn, userId } = useContext(AuthContext); // Giả định từ AuthContext

  // Load from localStorage khi mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Đồng bộ cart với localStorage nếu chưa login
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);

  // Đồng bộ khi login
  useEffect(() => {
    if (isLoggedIn) {
      syncCartToDb();
    }
  }, [isLoggedIn]);

  const syncCartToDb = async () => {
    try {
      // Fetch cart từ DB
      const response = await fetch(`http://localhost:5000/api/cart?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const dbCart = await response.json();
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

        // Merge: Thêm item từ local nếu chưa có trong DB
        const mergedCart = [...dbCart];
        localCart.forEach((localItem) => {
          const existing = mergedCart.find((item) => item.productId === localItem.productId);
          if (!existing) {
            mergedCart.push(localItem);
          } else {
            existing.quantity += localItem.quantity;
          }
        });

        // Cập nhật DB với mergedCart (gửi API để lưu)
        await fetch('http://localhost:5000/api/cart/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, cart: mergedCart }),
        });

        // Cập nhật state và clear localStorage
        setCart(mergedCart);
        localStorage.removeItem('cart');
      }
    } catch (err) {
      console.error('Lỗi đồng bộ giỏ hàng:', err);
    }
  };

  const addToCart = async (productId, quantity) => {
    const newItem = { productId, quantity };
    if (isLoggedIn) {
      // Gửi API lưu vào DB
      await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity }),
      });
      // Fetch lại cart từ DB để cập nhật state
      const response = await fetch(`http://localhost:5000/api/cart?userId=${userId}`);
      const updatedCart = await response.json();
      setCart(updatedCart);
    } else {
      // Lưu vào localStorage và state
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (existing) {
          existing.quantity += quantity;
          return [...prev];
        }
        return [...prev, newItem];
      });
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};