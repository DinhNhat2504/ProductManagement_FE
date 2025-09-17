// src/components/OrderConfirmation.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [confirmationStatus, setConfirmationStatus] = useState(null);
  const orderId = searchParams.get('orderId');
  const success = searchParams.get('success') === 'true';

  useEffect(() => {
    if (orderId) {
      setConfirmationStatus({
        success: success,
        message: success ? "Đơn hàng đã được xác nhận thành công!" : "Đã xảy ra lỗi khi xác nhận đơn hàng!"
      });
    } else {
      setConfirmationStatus({ success: false, message: "Không tìm thấy ID đơn hàng!" });
    }
  }, [orderId, success]);

  if (confirmationStatus === null) {
    return <div>Đang xử lý xác nhận đơn hàng...</div>;
  }

  return (
    <div className="flex w-full justify-center items-center min-h-screen bg-gray-100">
      <div className="w-[40%] p-6 bg-white shadow-md rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Xác Nhận Đơn Hàng</h2>
        {confirmationStatus.success ? (
          <>
            <p className="text-green-600 mb-4">{confirmationStatus.message}</p>
            <p>Đơn hàng #{orderId} đã được xác nhận thành công!</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Quay về trang chủ
            </button>
          </>
        ) : (
          <>
            <p className="text-red-600 mb-4">{confirmationStatus.message}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Quay về trang chủ
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation;