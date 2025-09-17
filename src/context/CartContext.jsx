import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const { isLoggedIn, userId, token } = useContext(AuthContext);

  // Sử dụng useRef để theo dõi trạng thái đăng nhập trước đó
  const prevIsLoggedIn = useRef(false);

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

  // Đồng bộ với localStorage khi chưa đăng nhập
  useEffect(() => {
    if (!isLoggedIn && cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
      console.log('Lưu giỏ hàng vào localStorage:', cart);
    }
  }, [cart, isLoggedIn]);

  // Xử lý khi trạng thái đăng nhập thay đổi
  useEffect(() => {
    // Kiểm tra nếu vừa đăng nhập (từ false sang true)
    if (!prevIsLoggedIn.current && isLoggedIn && userId && token) {
      syncCartToDb();
    }
    // Kiểm tra nếu vừa đăng xuất (từ true sang false)
    if (prevIsLoggedIn.current && !isLoggedIn) {
      setCart([]);
      localStorage.removeItem('cart');
      console.log('Đăng xuất: Reset cart và xóa localStorage');
    }
    // Cập nhật trạng thái trước đó
    prevIsLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, userId, token]);

  // Đồng bộ giỏ hàng từ localStorage sang DB khi đăng nhập
  const syncCartToDb = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length === 0) {
        console.log('Giỏ hàng localStorage rỗng, tải từ DB');
        fetchCartFromDb();
        return;
      }

      console.log('Đồng bộ giỏ hàng với DB cho userId:', userId);
      for (const item of localCart) {
        const dto = { productId: item.productId, quantity: item.quantity };
        const response = await fetch(`https://localhost:7278/Cart/${userId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(dto),
        });
        if (!response.ok) {
          console.warn('Lỗi khi đồng bộ item:', await response.json());
        }
      }

      fetchCartFromDb();
      localStorage.removeItem('cart');
      console.log('Đồng bộ giỏ hàng với DB thành công, xóa localStorage');
    } catch (err) {
      console.error('Lỗi khi đồng bộ giỏ hàng với DB:', err);
    }
  };

  // Fetch giỏ hàng từ DB
  const fetchCartFromDb = async () => {
    try {
      const response = await fetch(`https://localhost:7278/Cart/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const cartData = await response.json();
        const dbCartItems = cartData?.items || [];
        setCart(dbCartItems.map(item => ({ ...item, name: item.name || '', price: item.price || 0 }))); // Đảm bảo name và price có giá trị mặc định
        console.log('Tải giỏ hàng từ DB thành công:', dbCartItems);
      } else {
        console.warn('Không thể lấy giỏ hàng từ DB:', await response.json());
      }
    } catch (err) {
      console.error('Lỗi khi tải giỏ hàng từ DB:', err);
    }
  };

  const addToCart = async (productId, name, quantity, price, isUpdate = false) => {
    const newItem = { productId, name, quantity, price };
    if (isLoggedIn && userId && token) {
      const dto = { productId, quantity };
      const response = await fetch(`https://localhost:7278/Cart/${userId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }, 
        body: JSON.stringify(dto),
      });
      if (response.ok) {
        await fetchCartFromDb();
        console.log('Thêm/cập nhật giỏ hàng thành công (đã đăng nhập)');
      } else {
        console.warn('Lỗi khi thêm/cập nhật giỏ hàng:', await response.json());
      }
    } else {
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        const newCart = existing
          ? prev.map((item) =>
              item.productId === productId ? { ...item, quantity : item.quantity + quantity } : item
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
    await addToCart(productId, name, newQuantity - item.quantity, price, true); // Tính delta quantity để cộng thêm (nếu giảm, delta âm - nhưng backend cần hỗ trợ giảm)
  };
  const removeFromCart = async (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    if (!isLoggedIn) {
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else if (isLoggedIn && userId && token) {
      await fetch(`https://localhost:7278/Cart/${userId}/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Xóa item thành công từ DB');
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, isCartLoading }}>
      {children}
    </CartContext.Provider>
  );
};