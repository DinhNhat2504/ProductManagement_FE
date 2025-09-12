import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../../../context/CartContext";
import { Link } from "react-router-dom";

const Cart = ({ isSidebar = false }) => {
  const { cart, updateQuantity, removeFromCart, isCartLoading } = useContext(CartContext);
  const [totalPrice, setTotalPrice] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (cart.length > 0) {
      const fetchProducts = async () => {
        try {
          const productDetails = await Promise.all(
            cart.map(async (item) => {
              const response = await fetch(
                `https://localhost:7278/Product/${item.productId}`
              );
              const data = await response.json();
              return {
                ...item,
                name: data.name,
                price: data.price,
                imageURL: data.imageURL,
              };
            })
          );
          setProducts(productDetails);
          const total = productDetails.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          setTotalPrice(total);
        } catch (err) {
          console.error("Error fetching products:", err);
        }
      };
      fetchProducts();
    } else {
      setProducts([]);
      setTotalPrice(0);
    }
  }, [cart]);

  if (isCartLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        Đang tải giỏ hàng...
      </div>
    );
  }

  return (
    <div
      className="container mx-auto  bg-white flex flex-col transition-all duration-300"
    >
      <div className="mb-4">
        {!isSidebar && (<h2 className="text-xl sm:text-2xl font-bold text-gray-800">Giỏ hàng của bạn</h2>)}
        
        <p className="text-sm text-gray-500">Bạn đang có {cart.length} sản phẩm trong giỏ hàng</p>
      </div>
      {products.length > 0 ? (
        <>
          <div className={`space-y-4 ${products.length > 3 ? "overflow-y-auto lg:max-h-[350px] max-h-[500px]" : ""}`}>
            {products.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                {item.imageURL && (
                  <img
                    src={`https://localhost:7278${item.imageURL}`}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 text-xs">{item.price.toLocaleString("vi-VN")}₫</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-sm w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-red-500 hover:text-red-700 transition ml-2"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-bold text-gray-800">Tổng tiền:</p>
              <p className="text-lg font-bold text-red-600">
                {totalPrice.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="text-sm text-gray-500 mb-2 ">
              <p>Phí vận chuyển sẽ được tính ở trang thanh toán.</p>
              <p>Bạn có thể đổi hàng miễn phí trong vòng 7 ngày.</p>
            </div>
            <div className="flex text-center items-center justify-end">
               <Link
              to="/checkout"
              className={`${isSidebar ? "w-full" : "w-1/3"} block text-center px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition`}
            >
              THANH TOÁN
            </Link>
            </div>
           
            
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-sm text-center">
            Giỏ hàng rỗng. Hãy thêm sản phẩm!
          </p>
        </div>
      )}
    </div>
  );
};

export default Cart;