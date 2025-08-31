// src/components/CheckoutForm.jsx
import React, { useState, useEffect,useContext } from "react";
import { useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

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
  const { cart } = useContext(CartContext);
  const [totalPrice, setTotalPrice] = useState(0);
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
          const response = await fetch(`https://localhost:7278/Product/${item.productId}`);
          const data = await response.json();
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
          const response = await fetch(`https://localhost:7278/Product/${item.productId}`);
          const data = await response.json();
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
}, [isLoggedIn, buyNowItem]);
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
        const response = await fetch("https://localhost:7278/Payment");
        if (!response.ok) throw new Error("Lỗi khi lấy phương thức thanh toán");
        const data = await response.json();
        setPaymentMethods(data);
      } catch (error) {
        console.error("Lỗi khi lấy phương thức thanh toán:", error);
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
      userId: useri  ? parseInt(localStorage.getItem("userId")) : null, // Lấy userId từ token nếu đã đăng nhập
      customerName,
      customerEmail,
      customerPhone,
      voucherId: null, // Giả sử không có voucher
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
      paymentId: paymentMethods.find(
        (method) => method === parseInt(selectedPaymentMethod)
      )
        ? 1
        : null,
      orderItems: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price * item.quantity,
      })),
    };
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
      const response = await fetch("https://localhost:7278/Order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo đơn hàng ");
      const data = await response.json();
      console.log("Đơn hàng đã tạo:", data);

      // Xóa sản phẩm đã thanh toán khỏi giỏ hàng
      if (isAuthenticated) {
        // Gọi API xóa giỏ hàng từ backend
        await fetch("https://your-backend-api/api/cart", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
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
 
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Thanh Toán</h2>
      {/* Hiển thị sản phẩm */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Sản phẩm</h3>
        {cartItems.length === 0 ? (
          <p>Không có sản phẩm trong giỏ hàng.</p>
        ) : (
          <ul className="space-y-2">
            {cartItems.map((item) => (
              <li
                key={item.productId}
                className="flex justify-between items-center border-b py-2"
              >
                <span>{item.name || item.product?.name || "Sản phẩm"}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => decreaseQuantity(item.productId)}
                    className="px-2 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => increaseQuantity(item.productId)}
                    className="px-2 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="px-2 bg-red-500 text-white rounded"
                  >
                    Xóa
                  </button>
                </div>
                <span>
                  {(
                    item.price * item.quantity ||
                    item.product?.price * item.quantity ||
                    0
                  ).toLocaleString("vi-VN")}{" "}
                  VND
                </span>
              </li>
            ))}
            <div className="mt-4 font-bold">
              Tổng cộng: {totalPrice.toLocaleString("vi-VN")} VND
            </div>
          </ul>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Họ và Tên</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Số Điện Thoại</label>
          <input
            type="text"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tỉnh/Thành Phố</label>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Chọn Tỉnh/Thành Phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Quận/Huyện</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-2 border rounded"
            required
            disabled={!selectedProvince}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Xã/Phường</label>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="w-full p-2 border rounded"
            required
            disabled={!selectedDistrict}
          >
            <option value="">Chọn Xã/Phường</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Địa Chỉ Chi Tiết</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            Phương thức thanh toán
          </label>
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Chọn phương thức thanh toán</option>
            {paymentMethods.map((method) => (
              <option key={method.paymentId} value={method.paymentId}>
                {method.paymentMethod}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={cartItems.length === 0}
        >
          Thanh Toán
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;
