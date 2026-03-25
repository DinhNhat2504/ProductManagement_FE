// src/components/CheckoutForm.jsx
import React, { useState, useEffect,useContext } from "react";
import { useLocation } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";
import { getImageUrl } from "../../utils/helpers";

const CheckoutForm = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const { isLoggedIn, userId, token } = useContext(AuthContext);
  const { cart , fetchCartFromDb} = useContext(CartContext);
  const [totalPrice, setTotalPrice] = useState(0);
  const [vouchers, setVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const location = useLocation();

  // Lấy dữ liệu từ "Mua ngay"
  const buyNowItem = location.state?.buyNowItem;

  // Lấy giỏ hàng và xử lý "Mua ngay"
  useEffect(() => {
  const fetchCartAndBuyNow = async () => {
    let currentCart = [];
    if (cart.length > 0) {
      // Lấy chi tiết sản phẩm cho từng item trong cart
      const productDetails = await Promise.all(
        cart.map(async (item) => {
          const response = await api.get(`/Product/${item.productId}`);
          const data = response.data;
          return { ...item, name: data.name, price: data.price, imageURL: data.imageURL };
        })
      );
      currentCart = productDetails; // Gán productDetails cho currentCart
    } else {
      const localCart = localStorage.getItem("cart");
      const cartRaw = localCart ? JSON.parse(localCart) : [];
      // Lấy chi tiết sản phẩm cho từng item trong localCart
      const productDetails = await Promise.all(
        cartRaw.map(async (item) => {
          const response = await api.get(`/Product/${item.productId}`);
          const data = response.data;
          return { ...item, name: data.name, price: data.price, imageURL: data.imageURL };
        })
      );
      currentCart = productDetails;
    }

    // Xử lý buyNowItem
    if (buyNowItem) {
      const existingItem = currentCart.find(
        (item) => item.productId === buyNowItem.productId
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        currentCart.push({ ...buyNowItem, quantity: buyNowItem.quantity });
      }
    }

    setCartItems([...currentCart]);
    // Tính tổng giá
    const total = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  fetchCartAndBuyNow();
}, [cart,isLoggedIn, buyNowItem]);
  // Lấy danh sách tỉnh/thành phố
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/v2/p/");
        if (!response.ok) throw new Error("Lỗi khi lấy danh sách tỉnh");
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh:", error);
      }
    };
    fetchProvinces();
  }, []);

  // Lấy danh sách quận/huyện
  useEffect(() => {
    const fetchDistricts = async () => {
      if (selectedProvince) {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/v1/p/${selectedProvince}?depth=2`
          );
          if (!response.ok) throw new Error("Lỗi khi lấy danh sách huyện");
          const data = await response.json();
          setDistricts(data.districts);
          setWards([]); // Reset wards
          setSelectedDistrict("");
          setSelectedWard("");
        } catch (error) {
          console.error("Lỗi khi lấy danh sách huyện:", error);
        }
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Lấy danh sách xã/phường
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedDistrict) {
        try {
          const response = await fetch(
            `https://provinces.open-api.vn/api/v1/d/${selectedDistrict}?depth=2`
          );
          if (!response.ok) throw new Error("Lỗi khi lấy danh sách phường");
          const data = await response.json();
          setWards(data.wards);
          setSelectedWard(""); // Reset ward
        } catch (error) {
          console.error("Lỗi khi lấy danh sách phường:", error);
        }
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  // Lấy danh sách phương thức thanh toán
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await api.get("/Payment");
        setPaymentMethods(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy phương thức thanh toán:", error.response?.data || error.message);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Tăng số lượng
  const increaseQuantity = (productId) => {
    setCartItems(
      cartItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Giảm số lượng
  const decreaseQuantity = (productId) => {
    setCartItems(
      cartItems.map((item) =>
        item.productId === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Xóa sản phẩm
  const removeItem = (productId) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  // Xử lý thanh toán
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    const orderData = {
      userId: userId  ? parseInt(localStorage.getItem("userId")) : null, // Lấy userId từ token nếu đã đăng nhập
      customerName,
      customerEmail,
      customerPhone,
      voucherId: vouchers.find(
        (p) => p.code === (voucherCode)
      )?.voucherId, // Giả sử không có voucher
      orderStatusId: 1, // Giả sử 1 là trạng thái "Pending"
      totalPrice,
      shippingAddress: address,
      shippingProvince: provinces.find(
        (p) => p.code === parseInt(selectedProvince)
      )?.name,
      shippingDistrict: districts.find(
        (d) => d.code === parseInt(selectedDistrict)
      )?.name,
      shippingWard: wards.find((w) => w.code === parseInt(selectedWard))?.name,
      paymentId: selectedPaymentMethod, 
        
      orderItems: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price * item.quantity,
      })),
    };
    console.log(selectedPaymentMethod);
    console.log("Id voucher :"+ orderData.voucherId)
    console.log(orderData.paymentId);
    // Kiểm tra orderItems
    if (
      orderData.orderItems.length === 0 ||
      orderData.orderItems.some(
        (item) => item.productId === 0 || item.quantity === 0
      )
    ) {
      alert("Vui lòng kiểm tra lại sản phẩm trong giỏ hàng!");
      return;
    }
    try {
      const response = await api.post("/Order", orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = response.data;
      console.log("Đơn hàng đã tạo:", data);

      // Xóa sản phẩm đã thanh toán khỏi giỏ hàng
      if (isLoggedIn) {
        // Gọi API xóa giỏ hàng từ backend
        await api.delete(`/Cart/${userId}/clear`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (typeof fetchCartFromDb === "function") await fetchCartFromDb();
      } else {
        const remainingItems = cartItems.filter(
          (item) =>
            !orderData.orderItems.some(
              (o) =>
                o.productId === item.productId && o.quantity === item.quantity
            )
        );
        localStorage.setItem("cartItems", JSON.stringify(remainingItems));
      }

      // Chuyển hướng đến trang xác nhận
      // navigate('/order-confirmation', { state: { orderId: data.OrderId } });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
    }
  };

  useEffect(() => {
  const total = cartItems.reduce(
    (sum, item) =>
      sum + (item.product?.price || item.price || 0) * item.quantity,
    0
  );
  setTotalPrice(total);
}, [cartItems]);
 useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await api.get("/Voucher", {
          headers: { Authorization: `Bearer ${token || ""}` }
        });
        setVouchers(response.data);
      } catch (error) {
        console.error("Lỗi khi fetch voucher:", error.response?.data || error.message);
      }
    };
    fetchVouchers();
  }, [vouchers,token]);

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã voucher!");
      return;
    }

    const voucher = vouchers.find(v => v.code.toUpperCase() === voucherCode.toUpperCase());
    if (!voucher) {
      setVoucherError("Mã voucher không hợp lệ!");
      return;
    }

    // Kiểm tra điều kiện sử dụng
    const currentDate = new Date();
    if (new Date(voucher.endDate) < currentDate) {
      setVoucherError("Mã voucher đã hết hạn!");
      return;
    }
    if (voucher.currentUsage >= voucher.maxUsage) {
      setVoucherError("Mã voucher đã hết lượt sử dụng!");
      return;
    }
    if (voucher.conditions > totalPrice) {
      setVoucherError(`Đơn hàng chưa đủ giá trị tối thiểu: ${voucher.conditions.toLocaleString('vi-VN')} VND`);
      return;
    }

    // Tính giảm giá
    let discount = 0;
    if (voucher.discountType === "%") {
      discount = (totalPrice * voucher.discountValue) / 100;
    } else if (voucher.discountType === "₫") {
      discount = voucher.discountValue;
    }
    discount = Math.min(discount, totalPrice); // Không giảm quá tổng giá

    setDiscountAmount(discount);
    setTotalPrice(totalPrice - discount);
    setVoucherError(""); // Cập nhật totalPrice với giảm giá
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-8 text-center lg:text-left">
          Hoàn Tất Đặt Hàng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-col-reverse lg:flex-row">
          
          {/* Left Column: Form Details (7 columns) */}
          <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
            {/* Delivery address card */}
            <div className="bg-white px-6 sm:px-8 py-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-inner mt-0.5">1</span>
                Thông Tin Giao Hàng
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6" id="checkout-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và Tên</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số Điện Thoại</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0912345678"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tỉnh/Thành Phố</label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all truncate"
                      required
                    >
                      <option value="">Chọn Tỉnh/Thành</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>{province.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quận/Huyện</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all truncate"
                      required
                      disabled={!selectedProvince}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>{district.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Xã/Phường</label>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all truncate"
                      required
                      disabled={!selectedDistrict}
                    >
                      <option value="">Chọn Xã/Phường</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>{ward.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Địa Chỉ Nhận Hàng (Số nhà, Tên đường)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Số 123, Đường ABC..."
                    required
                  />
                </div>
              </form>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white px-6 sm:px-8 py-8 rounded-3xl shadow-sm border border-gray-100 mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-inner">2</span>
                Phương Thức Thanh Toán
              </h2>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <label 
                    key={method.paymentId} 
                    className={`flex items-center p-5 border rounded-2xl cursor-pointer transition-all ${selectedPaymentMethod === method.paymentId.toString() ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.paymentId}
                      checked={selectedPaymentMethod === method.paymentId.toString()}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      required
                    />
                    <span className="ml-4 font-semibold text-gray-800">{method.paymentMethod}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 columns) */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-gradient-to-b from-blue-50 to-indigo-50/30 p-6 sm:p-8 rounded-3xl shadow-lg border border-blue-100 lg:sticky lg:top-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">Tóm Tắt Đơn Hàng</h2>
              
              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200">
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 bg-white/50 rounded-xl">Giỏ hàng rỗng</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.productId} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-blue-50 relative group transition-all hover:shadow-md">
                      <img
                        src={(item.imageURL && getImageUrl(item.imageURL)) || (item.product?.imageURL && getImageUrl(item.product?.imageURL)) || "/placeholder.png"}
                        alt={item.name || "Product"}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-bold text-gray-800 line-clamp-2 text-sm sm:text-base leading-tight mb-2">
                          {item.name || item.product?.name || "Sản phẩm"}
                        </h4>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">SL: {item.quantity}</span>
                          <span className="font-extrabold text-red-500 text-sm sm:text-base">
                            {(item.price || item.product?.price || 0).toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-gray-100 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Voucher Section */}
              <div className="mb-8 p-5 bg-white rounded-2xl shadow-sm border border-blue-50">
                <label className="block text-sm font-bold text-gray-700 mb-3">Mã Khuyến Mãi</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã voucher..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-medium transition-all"
                  />
                  <button
                    onClick={(e) => { e.preventDefault(); applyVoucher(); }}
                    className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shrink-0 shadow-md"
                  >
                    Áp Dụng
                  </button>
                </div>
                {voucherError && <p className="text-red-500 text-xs font-semibold mt-3 flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{voucherError}</p>}
                {discountAmount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-bold mt-3 border border-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Đã giảm: -{discountAmount.toLocaleString('vi-VN')}₫
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-4 px-2">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Tạm tính</span>
                  <span className="font-bold text-gray-800">{(totalPrice + discountAmount).toLocaleString("vi-VN")}₫</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold tracking-wide">
                    <span>Khuyến mãi</span>
                    <span>-{discountAmount.toLocaleString("vi-VN")}₫</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-6 mt-6 border-t border-blue-200/50">
                  <span className="text-xl font-bold text-gray-900">Tổng thanh toán</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-red-500 block leading-none mb-1">{totalPrice.toLocaleString("vi-VN")}₫</span>
                    <p className="text-xs text-gray-500 font-medium">(Đã bao gồm thuế)</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={cartItems.length === 0}
                className="w-full mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
              >
                XÁC NHẬN ĐẶT HÀNG
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;

