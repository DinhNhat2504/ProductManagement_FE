import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext"; // Giả sử có context cho auth
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";

const steps = ["Đang xử lý", "Đã xác nhận", "Đang vận chuyển", "Thành công"]; // 4 mức chính, hủy là đặc biệt

// Custom Step Icon
const CustomStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  color:
    theme.palette.mode === "dark"
      ? theme.palette.grey[700]
      : theme.palette.grey[400],
  display: "flex",
  height: 22,
  alignItems: "center",
  ...(ownerState.active && { color: theme.palette.primary.main }),
  "& .CustomStepIcon-completed": {
    color: theme.palette.success.main,
    fontSize: 18,
  },
  "& .CustomStepIcon-cancelled": {
    color: theme.palette.error.main,
    fontSize: 18,
  },
  "& .CustomStepIcon-loading": { color: theme.palette.warning.main },
}));

function CustomStepIcon(props) {
  const { active, completed, error } = props;
  return (
    <CustomStepIconRoot ownerState={{ active }}>
      {error ? (
        <CloseIcon className="CustomStepIcon-cancelled" />
      ) : completed ? (
        <CheckIcon className="CustomStepIcon-completed" />
      ) : active ? (
        <CircularProgress size={18} className="CustomStepIcon-loading" />
      ) : (
        <div className="w-4 h-4 rounded-full bg-gray-300" />
      )}
    </CustomStepIconRoot>
  );
}

const OrdersPage = () => {
  const { userId } = useContext(AuthContext); // Lấy userId từ context
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `https://localhost:7278/Order/user/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Lỗi khi lấy danh sách đơn hàng");
        const data = await response.json();

        // Fetch thông tin sản phẩm cho từng orderItem
        const ordersWithProducts = await Promise.all(
          data.map(async (order) => {
            const orderItemsWithProducts = await Promise.all(
              order.orderItems.map(async (item) => {
                const productResponse = await fetch(
                  `https://localhost:7278/Product/${item.productId}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${
                        localStorage.getItem("token") || ""
                      }`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                if (!productResponse.ok)
                  throw new Error(`Lỗi khi lấy sản phẩm ${item.productId}`);
                const productData = await productResponse.json();
                return { ...item, product: productData };
              })
            );
            return { ...order, orderItems: orderItemsWithProducts };
          })
        );

        setOrders(ordersWithProducts);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  // Lọc đơn hàng
  const uncompletedOrders = orders.filter((order) =>
    [1, 3, 4, 5].includes(order.orderStatusId)
  );
  console.log("ĐB",uncompletedOrders)
  const completedOrders = orders.filter((order) => order.orderStatusId === 6);

  // Map status to activeStep and icons
  const getStepProps = (statusId) => {
    if (statusId === 5) return { activeStep: -1, error: true }; // Hủy: X
    const stepMap = { 1: 0, 3: 1, 4: 2, 6: 3 };
    const activeStep = stepMap[statusId] || 0;
    return { activeStep, error: false };
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">
        Danh Sách Đơn Hàng Của Bạn
      </h1>

      {/* Section Uncompleted */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Đơn Hàng Chưa Hoàn Thành ({uncompletedOrders.length})
        </h2>
        <div className="h-96 overflow-y-auto bg-white shadow-md rounded-lg p-4">
          {" "}
          {/* Overflow cho list dài */}
          {uncompletedOrders.length === 0 ? (
            <p className="text-center text-gray-500">
              Không có đơn hàng chưa hoàn thành.
            </p>
          ) : (
            uncompletedOrders.map((order) => {
              const { activeStep, error } = getStepProps(order.orderStatusId);
              return (
                <div
                  key={order.orderId}
                  className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium">
                      Đơn Hàng #{order.orderId}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p>
                    Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VND
                  </p>
                  <p>Trạng thái: {order.orderStatus || "Không xác định"}</p>

                  {/* Progress Stepper */}
                  <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    className="mt-4"
                  >
                    {steps.map((label, index) => (
                      <Step key={label}>
                        <StepLabel
                          StepIconComponent={CustomStepIcon}
                          StepIconProps={{
                            active: index > activeStep, // Chỉ trạng thái hiện tại xoay
                            completed: index <= activeStep && !error, // Trước và tại trạng thái hiện tại có tích V
                            error: error,
                          }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  {/* Danh sách sản phẩm trong đơn hàng */}
                  <div className="mt-4">
                    <div
                      onClick={() => setIsOpen(!isOpen)}
                      className="text-lg font-semibold mb-2 hover:text-red-500 cursor-pointer"
                    >
                      Sản phẩm trong đơn hàng 
                    </div>
                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        isOpen
                          ? "max-h-[1000px] opacity-100 scale-100"
                          : "max-h-0 opacity-0 scale-95"
                      }`}
                    >
                      {" "}
                      {order.orderItems && order.orderItems.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2">
                          {order.orderItems.map((item, idx) => (
                            <li key={idx} className="text-sm border-b-1 pb-2">
                              {item.product?.imageURL && (
                                <img
                                  src={`https://localhost:7278${item.product?.imageURL}`}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover ml-2 inline-block"
                                />
                              )}
                              <span className="font-medium ml-2">
                                {item.product?.name ||
                                  "Sản phẩm không xác định"}
                              </span>{" "}
                              - Số lượng: {item.quantity} - Giá:{" "}
                              {(item.price || 0).toLocaleString("vi-VN")} VND
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">
                          Không có sản phẩm trong đơn hàng.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Section Completed */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Đơn Hàng Đã Hoàn Thành ({completedOrders.length})
        </h2>
        <div className="h-96 overflow-y-auto bg-white shadow-md rounded-lg p-4">
          {" "}
          {/* Overflow cho list dài */}
          {completedOrders.length === 0 ? (
            <p className="text-center text-gray-500">
              Không có đơn hàng đã hoàn thành.
            </p>
          ) : (
            completedOrders.map((order) => {
              const { activeStep } = getStepProps(order.orderStatusId); // Hoàn thành luôn full tích
              return (
                <div
                  key={order.orderId}
                  className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium">
                      Đơn Hàng #{order.orderId}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <p>
                    Tổng tiền: {order.totalPrice.toLocaleString("vi-VN")} VND
                  </p>
                  <p>Trạng thái: {order.orderStatus?.name || "Thành công"}</p>

                  {/* Progress Stepper */}
                  <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    className="mt-4"
                  >
                    {steps.map((label, index) => (
                      <Step key={label}>
                        <StepLabel
                          StepIconComponent={CustomStepIcon}
                          StepIconProps={{
                            active: index < activeStep, // Chỉ trạng thái hiện tại xoay
                            completed: index <= activeStep, // Trước và tại trạng thái hiện tại có tích V
                            error: false,
                          }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  {/* Danh sách sản phẩm trong đơn hàng */}
                  <div className="mt-4">
                    <div
                      onClick={() => setIsOpen(!isOpen)}
                      className="text-lg font-semibold mb-2 hover:text-red-500 cursor-pointer"
                    >
                      Sản phẩm trong đơn hàng 
                    </div>
                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        isOpen
                          ? "max-h-[1000px] opacity-100 scale-100"
                          : "max-h-0 opacity-0 scale-95"
                      }`}
                    >
                      {" "}
                      {order.orderItems && order.orderItems.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2">
                          {order.orderItems.map((item, idx) => (
                            <li key={idx} className="text-sm border-b-1 pb-2">
                              {item.product?.imageURL && (
                                <img
                                  src={`https://localhost:7278${item.product?.imageURL}`}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover ml-2 inline-block"
                                />
                              )}
                              <span className="font-medium ml-2">
                                {item.product?.name ||
                                  "Sản phẩm không xác định"}
                              </span>{" "}
                              - Số lượng: {item.quantity} - Giá:{" "}
                              {(item.price || 0).toLocaleString("vi-VN")} VND
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">
                          Không có sản phẩm trong đơn hàng.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default OrdersPage;
