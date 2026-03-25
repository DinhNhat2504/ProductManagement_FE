import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { getImageUrl } from "../../utils/helpers";

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
              const response = await api.get(`/Product/${item.productId}`);
              const data = response.data;
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

    <div className={`container mx-auto transition-all duration-300 ${!isSidebar ? 'p-6 sm:p-8 bg-white shadow-2xl rounded-3xl border border-gray-100' : 'bg-transparent'}`}>
      <div className="mb-6">
        {!isSidebar && (
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1">
            Giỏ hàng của bạn
          </h2>
        )}
        <p className="text-sm font-medium text-gray-500">
          Bạn đang có <span className="text-blue-600 font-bold">{cart.length}</span> sản phẩm trong giỏ hàng
        </p>
      </div>
      {products.length > 0 ? (
        <>
          <div className={`space-y-4 pr-1 ${products.length > 3 ? "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent lg:max-h-[350px] max-h-[450px]" : ""}`}>
            {products.map((item) => (
              <div key={item.productId} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative">
                <div className="shrink-0 relative">
                  {item.imageURL ? (
                    <img src={getImageUrl(item.imageURL)} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400"><span>No IMG</span></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{item.name}</h3>
                  <p className="text-red-500 font-semibold text-sm sm:text-base">{item.price.toLocaleString("vi-VN")}₫</p>
                </div>
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 mt-2 sm:mt-0">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-full text-gray-600 hover:bg-white hover:shadow hover:text-blue-600 flex items-center justify-center focus:outline-none">-</button>
                    <span className="text-sm font-semibold w-8 text-center text-gray-700">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-full text-gray-600 hover:bg-white hover:shadow hover:text-blue-600 flex items-center justify-center focus:outline-none">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-200">Xóa</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-gray-500 font-medium text-sm mb-1">Tổng thanh toán</p>
                <p className="text-xs text-gray-400">Chưa bao gồm phí vận chuyển</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-red-500 tracking-tight">
                {totalPrice.toLocaleString("vi-VN")}₫
              </p>
            </div>

            <div className="flex justify-end">
              <Link
                to="/checkout"
                className={`${isSidebar ? "w-full" : "w-full sm:w-auto min-w-[200px]"} flex justify-center items-center px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-full shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all`}
              >
                TIẾN HÀNH THANH TOÁN
              </Link>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Bạn có thể đổi hàng miễn phí trong vòng 7 ngày.
            </p>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 shadow-sm rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-gray-500 font-medium mb-6">
            Giỏ hàng của bạn đang rỗng.
          </p>
          <Link to="/products" className="px-6 py-2.5 bg-blue-50 text-blue-600 font-semibold rounded-full hover:bg-blue-100 transition-colors">
            Khám phá sản phẩm
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
