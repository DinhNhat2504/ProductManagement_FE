import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const { isLoggedIn, userId } = useContext(AuthContext);

  // Load from localStorage when component mounts
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    console.log('Initial load - Cart from localStorage:', storedCart);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
          console.log('Cart loaded successfully:', parsedCart);
        } else {
          console.warn('Parsed cart is not an array, resetting to empty:', parsedCart);
          setCart([]);
          localStorage.setItem('cart', JSON.stringify([])); // Reset localStorage if invalid
        }
      } catch (e) {
        console.error('Error parsing localStorage cart, resetting:', e);
        setCart([]);
        localStorage.setItem('cart', JSON.stringify([])); // Reset if parse fails
      }
    } else {
      console.log('No cart data in localStorage, initializing empty');
      localStorage.setItem('cart', JSON.stringify([])); // Initialize if null
    }
    setIsCartLoading(false);
  }, []);

  // Sync cart with localStorage immediately if not logged in
  useEffect(() => {
    // Chỉ lưu vào localStorage nếu cart đã được load xong (không phải lần đầu)
    if (!isLoggedIn && cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
      console.log('Cart saved to localStorage:', cart);
    }
  }, [cart, isLoggedIn]);

  // Sync with DB when logged in
  useEffect(() => {
    if (isLoggedIn && userId) {
      syncCartToDb();
    }
  }, [isLoggedIn, userId]);

  const syncCartToDb = async () => {
    try {
      console.log('Syncing cart to DB for userId:', userId);
      const response = await fetch(`http://localhost:5000/api/cart?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const dbCart = await response.json();
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

        const mergedCart = [...dbCart];
        localCart.forEach((localItem) => {
          const existing = mergedCart.find((item) => item.productId === localItem.productId);
          if (!existing) {
            mergedCart.push(localItem);
          } else {
            existing.quantity += localItem.quantity;
          }
        });

        await fetch('http://localhost:5000/api/cart/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, cart: mergedCart }),
        });

        setCart(mergedCart);
        localStorage.removeItem('cart'); // Remove only after successful sync
        console.log('Cart synced to DB, localStorage cleared, new cart:', mergedCart);
      } else {
        console.warn('Failed to fetch cart from DB, keeping local data');
      }
    } catch (err) {
      console.error('Error syncing cart to DB:', err);
    }
  };

  const addToCart = async (productId, name, quantity , price) => {
    const newItem = { productId, name, quantity, price };
    if (isLoggedIn && userId) {
      await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, name, quantity, price }),
      });
      const response = await fetch(`http://localhost:5000/api/cart?userId=${userId}`);
      const updatedCart = await response.json();
      setCart(updatedCart);
      console.log('Added to cart (logged in), updated cart:', updatedCart);
    } else {
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        const newCart = existing
          ? prev.map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
            )
          : [...prev, newItem];
        console.log('Added to cart (guest), new cart before save:', newCart);
        localStorage.setItem('cart', JSON.stringify(newCart)); // Save immediately
        return newCart;
      });
    }
  };

  // Thêm hàm updateQuantity và removeFromCart
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const name = cart.find(item => item.productId === productId).name;
    const quantityDiff = newQuantity - cart.find(item => item.productId === productId).quantity;
    const price = quantityDiff * cart.find(item => item.productId === productId).price;
    await addToCart(productId,name, quantityDiff , price); // Sử dụng addToCart để update (tăng/giảm)
  };

  const removeFromCart = async (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    if (!isLoggedIn) {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      // Cập nhật DB nếu logged in
      await fetch('http://localhost:5000/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cart: updatedCart }),
      });
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, isCartLoading }}>
      {children}
    </CartContext.Provider>
  );
};