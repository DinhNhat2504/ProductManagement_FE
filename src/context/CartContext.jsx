import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';
import api from '../utils/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const { isLoggedIn, userId, token } = useContext(AuthContext);

  const prevIsLoggedIn = useRef(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          setCart([]);
          localStorage.setItem('cart', JSON.stringify([]));
        }
      } catch (e) {
        setCart([]);
        localStorage.setItem('cart', JSON.stringify([]));
      }
    } else {
      localStorage.setItem('cart', JSON.stringify([]));
    }
    setIsCartLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoggedIn && cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoggedIn]);

  useEffect(() => {
    if (!prevIsLoggedIn.current && isLoggedIn && userId && token) {
      syncCartToDb();
    }
    if (prevIsLoggedIn.current && !isLoggedIn) {
      setCart([]);
      localStorage.removeItem('cart');
    }
    prevIsLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, userId, token]);

  const syncCartToDb = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length === 0) {
        fetchCartFromDb();
        return;
      }

      for (const item of localCart) {
        const dto = { productId: item.productId, quantity: item.quantity };
        try {
          await api.post(`/Cart/${userId}/items`, dto, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (err) {
          console.warn('Lỗi khi đồng bộ item:', err.response?.data || err.message);
        }
      }

      fetchCartFromDb();
      localStorage.removeItem('cart');
    } catch (err) {
      console.error('Lỗi khi đồng bộ giỏ hàng với DB:', err);
    }
  };

  const fetchCartFromDb = async () => {
    try {
      const response = await api.get(`/Cart/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cartData = response.data;
      const dbCartItems = cartData?.items || [];
      setCart(dbCartItems.map(item => ({ ...item, name: item.name || '', price: item.price || 0 })));
    } catch (err) {
      console.warn('Không thể lấy giỏ hàng từ DB:', err.response?.data || err.message);
    }
  };

  const addToCart = async (productId, name, quantity, price, isUpdate = false) => {
    const newItem = { productId, name, quantity, price };
    if (isLoggedIn && userId && token) {
      const dto = { productId, quantity };
      try {
        await api.post(`/Cart/${userId}/items`, dto, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        await fetchCartFromDb();
      } catch (err) {
        console.warn('Lỗi khi thêm/cập nhật giỏ hàng:', err.response?.data || err.message);
      }
    } else {
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        const newCart = existing
          ? prev.map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
            )
          : [...prev, newItem];
        if (!isLoggedIn) {
          localStorage.setItem('cart', JSON.stringify(newCart));
        }
        return newCart;
      });
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cart.find((item) => item.productId === productId);
    if (!item) return; 
    const { name, price } = item;
    await addToCart(productId, name, newQuantity - item.quantity, price, true);
  };

  const removeFromCart = async (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    if (!isLoggedIn) {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else if (isLoggedIn && userId && token) {
      try {
        await api.delete(`/Cart/${userId}/items/${productId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
         console.warn(err);
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, isCartLoading, fetchCartFromDb}}>
      {children}
    </CartContext.Provider>
  );
};