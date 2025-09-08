import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../../../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, isCartLoading } = useContext(CartContext);
  const [totalPrice, setTotalPrice] = useState(0);
  const [products, setProducts] = useState([]);

  // Fetch product detail để lấy price và name
  useEffect(() => {
    if (cart.length > 0) {
      const fetchProducts = async () => {
        try {
          const productDetails = await Promise.all(
            cart.map(async (item) => {
              const response = await fetch(`https://localhost:7278/Product/${item.productId}`);
              const data = await response.json();
              return { ...item, name: data.name, price: data.price, imageURL: data.imageURL };
            })
          );
          setProducts(productDetails);

          // Tính tổng giá
          const total = productDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
          setTotalPrice(total);
        } catch (err) {
          console.error('Error fetching products:', err);
        }
      };
      fetchProducts();
    } else {
      setProducts([]);
      setTotalPrice(0);
    }
  }, [cart]);

  if (isCartLoading) {
    return <div>Đang tải giỏ hàng...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Giỏ hàng của bạn</h2>
      {products.length > 0 ? (
        <div className="space-y-4">
          {products.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 border-b pb-4">
              {item.imageURL && (
                <img
                  src={`https://localhost:7278${item.imageURL}`}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                <p className="text-gray-600">{item.price.toLocaleString('vi-VN')} VND</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition"
                >
                  -
                </button>
                <span className="text-lg">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeFromCart(item.productId)}
                className="text-red-500 hover:text-red-700 transition"
              >
                Xóa
              </button>
            </div>
          ))}
          <div className="text-right mt-6">
            <p className="text-2xl font-bold text-gray-800">Tổng tiền: {totalPrice.toLocaleString('vi-VN')} VND</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center">Giỏ hàng rỗng. Hãy thêm sản phẩm!</p>
      )}
    </div>
  );
};

export default Cart;