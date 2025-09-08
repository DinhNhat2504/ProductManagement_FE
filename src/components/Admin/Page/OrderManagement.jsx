import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../../../context/AuthContext";
import { FaShoppingCart, FaEdit } from 'react-icons/fa';

const OrderManagement = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [statusId, setStatusId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState(0);
  const [statusList, setStatusList] = useState([]); // Danh sách trạng thái
  const [paymentId, setPaymentId] = useState(0);
  const [paymentList, setPaymentList] = useState([]); // Danh sách phương thức thanh toán
  const pageSize = 10;

  // Lấy danh sách đơn hàng
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://localhost:7278/Order/paged?pageNumber=${page}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(search)}&statusId=${status}&paymentId=${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data.items);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách trạng thái đơn hàng
  const fetchStatus = async () => {
    try {
      const response = await fetch('https://localhost:7278/OrderStatus', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStatusList(data);
      } else {
        console.error('Failed to fetch order statuses');
      }
    } catch (error) {
      console.error('Error fetching order statuses:', error);
    }
  };

  // Lấy danh sách phương thức thanh toán (giả sử API trả về danh sách)
  const fetchPaymentList = async () => {
    try {
      const response = await fetch('https://localhost:7278/Payment', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentList(data);
      } else {
        setPaymentList([
          { paymentId: 1, paymentMethod: 'COD' },
          { paymentId: 2, paymentMethod: 'Chuyển khoản' },
          { paymentId: 3, paymentMethod: 'Momo' },
        ]);
      }
    } catch (error) {
      setPaymentList([
        { paymentId: 1, paymentMethod: 'COD' },
        { paymentId: 2, paymentMethod: 'Chuyển khoản' },
        { paymentId: 3, paymentMethod: 'Momo' },
      ]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStatus();
    fetchPaymentList();
    // eslint-disable-next-line
  }, [token, page, status, paymentId,searchTerm]);

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://localhost:7278/Order/${editingOrder.orderId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatusId: parseInt(statusId) }),
      });
      if (response.ok) {
        await fetchOrders();// Reset về trang 1 sau khi cập nhật
        setShowModal(false);
        setEditingOrder(null);
        setStatusId('');
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setStatusId(order.orderStatusId);
    setShowModal(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(search); // Reset về trang 1 khi tìm kiếm
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
        <div className="mb-6 flex flex-col justify-between border-b pb-4 sm:flex-row sm:items-center">
          <h3 className="mb-3 text-lg font-semibold text-gray-700 sm:mb-0 sm:text-xl flex items-center">
            <FaShoppingCart className="mr-2" /> Danh sách đơn hàng
          </h3>
          <form onSubmit={handleSearch} className="mb-4 flex flex-col items-center space-x-2 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm đơn hàng ..."
              className="w-full rounded border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:w-auto"
            />
            <button
              type="submit"
              
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Bộ lọc trạng thái và phương thức thanh toán */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value={0}>Tất cả</option>
              {statusList.map((s) => (
                <option key={s.orderStatusId} value={s.orderStatusId}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
            <select
              value={paymentId}
              onChange={e => { setPaymentId(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value={0}>Tất cả</option>
              {paymentList.map((p) => (
                <option key={p.paymentId} value={p.paymentId}>{p.paymentMethod}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">STT</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Khách hàng</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase md:table-cell">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">PT thanh toán</th>
                <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.map((order,index  ) => (
                <tr key={order.orderId}>
                  <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-800">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-800">{order.orderId}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">{order.customerName}</td>
                  <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-gray-600 md:table-cell">${order.totalPrice}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold ${
                        order.orderStatus === 'Thành công'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {order.orderStatus || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600 ">{order.paymentName || 'N/A'}</td>
                  <td className="space-x-2 px-4 py-3 text-center text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(order)}
                      className="p-1 text-blue-600 transition duration-150 ease-in-out hover:text-blue-800"
                      title="Sửa"
                    >
                      <FaEdit className="inline h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col items-center justify-between space-y-3 sm:flex-row sm:space-y-0">
          <span className="text-sm text-gray-600">
            Hiển thị trang {page} trên tổng {totalPages}, tổng {totalItems} đơn hàng
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={`rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 ${
                page === 1 ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-md border px-3 py-1 text-sm ${
                  p === page
                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className={`rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 ${
                page === totalPages ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Cập nhật trạng thái đơn hàng</h3>
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Trạng thái ID</label>
                <select
                  
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Chọn trạng thái</option>
                  {statusList.map((status) => (
                    <option key={status.orderStatusId} value={status.orderStatusId}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingOrder(null);
                    setStatusId('');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                >
                  Hủy
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;