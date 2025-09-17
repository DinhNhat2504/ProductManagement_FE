import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const { isLoggedIn, userId, token, userDetails } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [isEdit, setIsEdit] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !userId || !userDetails) return;

    setUser({
      userId: userDetails.userId,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      email: userDetails.email,
      roleId: userDetails.roleId,
      roleName: userDetails.roleName,
      avatarUrl: userDetails.avatarUrl,
      avatarImage: userDetails.avatarImage,
      address: userDetails.address,
      phoneNumber: userDetails.phoneNumber,
    });
    setAvatarPreview(`https://localhost:7278${userDetails.avatarUrl}`);

    const fetchAdditionalData = async () => {
      try {
        const ordersResponse = await fetch(
          `https://localhost:7278/Order/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);

        const cartResponse = await fetch(
          `https://localhost:7278/Cart/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const cartData = await cartResponse.json();
        setCart(cartData);

        const completedOrders = ordersData.filter(
          (order) => order.orderStatusId === 6
        ); // Trạng thái thành công là 6
        const total = completedOrders.reduce(
          (sum, order) => sum + order.totalPrice,
          0
        );
        setTotalSpent(total);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchAdditionalData();
  }, [isLoggedIn, userId, token, userDetails]);

  const handleUpdate = async (formData) => {
    try {
      const response = await fetch(
        `https://localhost:7278/api/User/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (response.ok) {
        setIsEdit(false);
        alert("Cập nhật thông tin thành công");
      } else {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
    }
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("userId", user.userId);
    formData.append("firstName", user.firstName || "");
    formData.append("lastName", user.lastName || "");
    formData.append("email", user.email || ""); // Đảm bảo email luôn được gửi
    formData.append("roleId", user.roleId || 0);
    formData.append("roleName", user.roleName || "");
    formData.append("avatarUrl", user.avatarUrl || "");
    if (user.avatarImage) formData.append("avatarImage", user.avatarImage);
    formData.append("address", user.address || "");
    formData.append("phoneNumber", user.phoneNumber || "");

    handleUpdate(formData);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatarPreview(event.target.result);
      reader.readAsDataURL(file);
      setUser({ ...user, avatarImage: file });
    }
  };

  const togglePassword = () => {
    const passwordField = document.getElementById("passwordField");
    passwordField.type =
      passwordField.type === "password" ? "text" : "password";
  };

  if (!isLoggedIn)
    return (
      <div className="text-center p-4">
        Vui lòng đăng nhập để xem thông tin.
      </div>
    );
  if (!user) return <div className="text-center p-4">Đang tải...</div>;

  return (
    <div className="mx-auto h-full w-full max-w-5xl rounded-xl border border-blue-200 bg-gradient-to-b from-blue-100 to-white p-8 shadow-lg">
      <div>
        <div className="mb-6 flex items-center gap-6 border-b pb-6">
          <div className="group relative">
            <label htmlFor="avatarInput" className="cursor-pointer">
              <img
                id="avatarPreview"
                src={
                  avatarPreview ||
                  `https://i.pravatar.cc/40?u=${userDetails.email}`
                }
                alt="Avatar"
                className="h-24 w-24 rounded-full border-4 border-blue-400 object-cover shadow transition group-hover:opacity-70"
              />
              {isEdit && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-30 opacity-0 transition group-hover:opacity-100">
                  <span className="font-semibold text-white">Chọn ảnh</span>
                </div>
              )}
            </label>
            {isEdit && (
              <input
                type="file"
                name="AvatarFile"
                id="avatarInput"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-700">{`${user.firstName} ${user.lastName}`}</h1>
            <p className="mt-1 text-xs text-purple-600">
              <span className="font-bold">{user.roleName}</span>
            </p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="mb-4 font-bold text-blue-700">Thông tin tài khoản</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-purple-700">Email</label>
              {isEdit ? (
                <input
                  type="email"
                  value={user.email || ""}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="form-input w-full border-blue-300 focus:border-blue-500"
                  required
                />
              ) : (
                <p className="text-black">{user.email}</p>
              )}
            </div>
            <div>
              <label className="text-purple-700">Số điện thoại</label>
              {isEdit ? (
                <input
                  type="text"
                  value={user.phoneNumber || ""}
                  onChange={(e) =>
                    setUser({ ...user, phoneNumber: e.target.value })
                  }
                  className="form-input w-full border-blue-300 focus:border-blue-500"
                />
              ) : (
                <p className="text-black">{user.phoneNumber}</p>
              )}
            </div>
            <div>
              <label className="text-purple-700">Mật khẩu</label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={user.password || ""}
                  readOnly
                  id="passwordField"
                  className="form-input w-full border-blue-300"
                  style={{ letterSpacing: "3px" }}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="text-xs text-blue-600 underline"
                >
                  Xem
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Ngày tạo: {new Date().toLocaleString("vi-VN")}
              </p>
              <p className="text-xs text-gray-400">
                Cập nhật gần nhất: {new Date().toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            <section className="mb-8">
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-purple-700">Tổng chi tiêu:</label>
                  <p className="text-black">{totalSpent.toLocaleString("vi-VN")}₫</p>
                </div>
              </div>
            </section>
            <section className="mb-8">
              
              <div className="space-y-4 ">
                {orders.length > 0 ? (
                  <div>
                    <p className="text-purple-700">
                      Tổng số đơn hàng: {orders.length}
                    </p>
                    <Link to="/orders" className="text-xs text-red-500 hover:border-b-2">Chi tiết {">>"}</Link>
                  </div>
                ) : (
                  <p className="text-center">Không có đơn hàng nào.</p>
                )}
              </div>
            </section>
            <section className="mb-8">
             
              <div className="space-y-4">
                {cart.items && cart.items.length > 0 ? (
                  <div>
                    <p className="text-purple-700">
                      Sản phẩm trong giỏ hàng :{" "}
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                    <Link to="/cart" className="text-xs text-red-500 hover:border-b-2">Chi tiết {">>"}</Link>
                  </div>
                ) : (
                  <p className="text-center">Giỏ hàng trống.</p>
                )}
              </div>
            </section>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-bold text-blue-700">Thông tin cá nhân</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-purple-700">Full Name</label>
              {isEdit ? (
                <input
                  type="text"
                  value={`${user.firstName} ${user.lastName}` || ""}
                  onChange={(e) => {
                    const [first, ...last] = e.target.value.split(" ");
                    setUser({
                      ...user,
                      firstName: first,
                      lastName: last.join(" "),
                    });
                  }}
                  className="form-input w-full border-blue-300 focus:border-blue-500"
                />
              ) : (
                <p className="text-black">{`${user.firstName} ${user.lastName}`}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-purple-700">Địa chỉ</label>
              {isEdit ? (
                <input
                  type="text"
                  value={user.address || ""}
                  onChange={(e) =>
                    setUser({ ...user, address: e.target.value })
                  }
                  className="form-input w-full border-blue-300 focus:border-blue-500"
                />
              ) : (
                <p className="text-black">{user.address}</p>
              )}
            </div>
          </div>
        </section>
        <div className="mt-8 flex justify-end gap-4">
          {isEdit ? (
            <>
              <button
                onClick={handleSave}
                className="rounded bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setIsEdit(false)}
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
              >
                Hủy
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEdit(true)}
                className="rounded bg-blue-500 px-6 py-2 font-semibold text-white shadow transition hover:bg-blue-600"
              >
                Sửa
              </button>
              <button
                type="button"
                className="rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
              >
                Xóa tài khoản
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
