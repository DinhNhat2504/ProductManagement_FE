import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const { isLoggedIn, userId, token } = useContext(AuthContext);

  // Tải giỏ hàng từ localStorage khi component khởi tạo
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    console.log('Tải ban đầu - Giỏ hàng từ localStorage:', storedCart);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
          console.log('Tải giỏ hàng thành công:', parsedCart);
        } else {
          console.warn('Giỏ hàng không phải mảng, đặt lại rỗng:', parsedCart);
          setCart([]);
          localStorage.setItem('cart', JSON.stringify([]));
        }
      } catch (e) {
        console.error('Lỗi khi phân tích giỏ hàng từ localStorage, đặt lại:', e);
        setCart([]);
        localStorage.setItem('cart', JSON.stringify([]));
      }
    } else {
      console.log('Không có dữ liệu giỏ hàng trong localStorage, khởi tạo rỗng');
      localStorage.setItem('cart', JSON.stringify([]));
    }
    setIsCartLoading(false);
  }, []);

  // Đồng bộ giỏ hàng với localStorage nếu chưa đăng nhập
  useEffect(() => {
    if (!isLoggedIn && cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
      console.log('Lưu giỏ hàng vào localStorage:', cart);
    }
  }, [cart, isLoggedIn]);

  // Đồng bộ với DB khi đăng nhập
  useEffect(() => {
    if (isLoggedIn && userId && token) {
      syncCartToDb();
    }
  }, [isLoggedIn, userId, token]);

  const syncCartToDb = async () => {
    try {
      console.log('Đồng bộ giỏ hàng với DB cho userId:', userId);
      const response = await fetch(`https://localhost:7278/Cart/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const dbCartData = await response.json();
        console.log('Dữ liệu từ API cart:', dbCartData); // Debug dữ liệu trả về
        const dbCartItems = dbCartData?.items || [];

        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

        const mergedCart = [...dbCartItems];
        localCart.forEach((localItem) => {
          const existing = mergedCart.find((item) => item.productId === localItem.productId);
          if (!existing) {
            mergedCart.push(localItem);
          } else {
            existing.quantity += localItem.quantity;
          }
        });

        await fetch(`https://localhost:7278/Cart/${userId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ mergedCart }),
        });

        setCart(mergedCart);
        localStorage.removeItem('cart');
        console.log('Đồng bộ giỏ hàng với DB thành công, xóa localStorage, giỏ hàng mới:', mergedCart);
      } else {
        console.warn('Không thể lấy giỏ hàng từ DB, giữ dữ liệu local:', await response.json());
      }
    } catch (err) {
      console.error('Lỗi khi đồng bộ giỏ hàng với DB:', err);
    }
  };

  const addToCart = async (productId, name, quantity, price, isUpdate = false) => {
  const newItem = { productId, name, quantity, price };
  if (isLoggedIn && userId && token) {
    const method = isUpdate ? 'PUT' : 'POST';
    await fetch(`https://localhost:7278/Cart/${userId}/items`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, productId, name, quantity, price }),
    });
    const response = await fetch(`https://localhost:7278/Cart/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const updatedCartData = await response.json();
    const updatedCart = updatedCartData?.items || [];
    setCart(updatedCart);
    console.log('Cập nhật/thêm vào giỏ hàng (đã đăng nhập), giỏ hàng mới:', updatedCart);
  } else {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      const newCart = existing
        ? prev.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...prev, newItem];
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  }
};

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cart.find((item) => item.productId === productId);
    if (!item) return;
    const name = item.name;
    const price = (newQuantity * item.price) / item.quantity;
    await addToCart(productId, name, newQuantity, price , true);
  };

  const removeFromCart = async (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    if (!isLoggedIn) {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      await fetch(`https://localhost:7278/Cart/${userId}/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, cart: { cartItems: updatedCart } }),
      });
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, isCartLoading }}>
      {children}
    </CartContext.Provider>
  );
};