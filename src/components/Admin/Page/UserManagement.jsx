import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../../../context/AuthContext";
import { FaUsers, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const UserManagement = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const pageSize = 10;

  // Lấy danh sách người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
         `https://localhost:7278/api/User/paged?pageNumber=${page}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(
          search
        )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data.items);
          setTotalPages(data.totalPages);
          setTotalItems(data.totalItems);
        } else {
          console.error('Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, page, search]);

  // Sửa người dùng
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://localhost:7278/api/User/${editingUser.userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setPage(1); // Reset về trang 1 sau khi sửa
        setShowModal(false);
        setEditingUser(null);
        setFormData({ firstName: '', lastName: '', email: '', role: '' });
      } else {
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Xóa người dùng
  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`https://localhost:7278/api/User/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setPage(1); // Reset về trang 1 sau khi xóa
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setShowModal(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset về trang 1 khi tìm kiếm
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
        <div className="mb-6 flex flex-col justify-between border-b pb-4 sm:flex-row sm:items-center">
          <h3 className="mb-3 text-lg font-semibold text-gray-700 sm:mb-0 sm:text-xl flex items-center">
            <FaUsers className="mr-2" /> Danh sách người dùng
          </h3>
          <form onSubmit={handleSearch} className="mb-4 flex flex-col items-center space-x-2 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm người dùng ..."
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
        <div className="mb-6 flex flex-col items-start justify-between pb-4 sm:flex-row sm:items-center">
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ firstName: '', lastName: '', email: '', role: '' });
              setShowModal(true);
            }}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition duration-200 ease-in-out hover:bg-blue-700 hover:shadow-md sm:w-auto"
          >
            <FaPlus className="h-4 w-4" />
            <span>Thêm người dùng</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Ảnh</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Họ tên</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase md:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Vai trò</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:table-cell">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => {
                const isActive = user.roleName === 'Admin'; // Giả định admin luôn hoạt động
                return (
                  <tr key={user.userId} className={isActive ? '' : 'bg-red-100'}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <img
                        className="h-10 w-10 rounded-full border object-cover"
                        src={user.avatarUrl || `https://i.pravatar.cc/40?u=${user.email}`}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-800">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-gray-600 md:table-cell">{user.email}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">{user.roleName}</td>
                    <td className="hidden px-4 py-3 whitespace-nowrap sm:table-cell">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold ${
                          isActive ? 'bg-green-100 text-green-800' : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="space-x-2 px-4 py-3 text-center text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-blue-600 transition duration-150 ease-in-out hover:text-blue-800"
                        title="Sửa"
                      >
                        <FaEdit className="inline h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.userId)}
                        className="p-1 text-red-600 transition duration-150 ease-in-out hover:text-red-800"
                        title="Xóa"
                      >
                        <FaTrash className="inline h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col items-center justify-between space-y-3 sm:flex-row sm:space-y-0">
          <span className="text-sm text-gray-600">
            Hiển thị trang {page} trên tổng {totalPages}, tổng {totalItems} người dùng
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
            <h3 className="text-xl font-bold mb-4">{editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Họ</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Tên</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({ firstName: '', lastName: '', email: '', role: '' });
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

export default UserManagement;