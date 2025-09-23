import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import {
  FaBox,
  FaPlus,
  FaEdit,
  FaTrash,
  FaWarehouse,
  FaInfoCircle,
} from "react-icons/fa";

const ProductManagement = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: null,
    name: "",
    price: 0.01,
    categoryId: "",
    summary: "",
    description: "",
    imageURL: "",
    isFeatured: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  // New states for import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importProductId, setImportProductId] = useState(null);
  const [importQuantity, setImportQuantity] = useState(0);
  const [importNote, setImportNote] = useState("");

  // New states for transactions modal
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [transactionsProductId, setTransactionsProductId] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://localhost:7278/Product/paged?pageNumber=${page}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(
          search
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Không thể tải danh sách sản phẩm");
      }
    } catch (error) {
      setError("Lỗi khi tải sản phẩm: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lấy số lượng cho từng sản phẩm
  const fetchQuantities = async (productsList) => {
    const quantitiesData = {};
    await Promise.all(
      productsList.map(async (product) => {
        try {
          const response = await fetch(
            `https://localhost:7278/Stock/${product.productId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            quantitiesData[product.productId] = data.quantity || 0;
          } else {
            quantitiesData[product.productId] = "N/A";
          }
        } catch (error) {
          quantitiesData[product.productId] = "N/A";
        }
      })
    );
    setQuantities(quantitiesData);
  };

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await fetch("https://localhost:7278/Category", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Không thể tải danh sách danh mục");
      }
    } catch (error) {
      setError("Lỗi khi tải danh mục: " + error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [token, page, search]);

  useEffect(() => {
    if (products.length > 0) {
      fetchQuantities(products);
    }
  }, [products, token]);

  // Xử lý chọn ảnh và tạo preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && ["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    } else {
      setError("Vui lòng chọn file ảnh (jpg, jpeg, png)");
      setImageFile(null);
      setImagePreview("");
    }
  };

  // Thêm hoặc sửa sản phẩm
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");

      // Kiểm tra dữ liệu bắt buộc
      if (!formData.name || !formData.name.trim()) {
        setError("Tên sản phẩm là bắt buộc.");
        return;
      }
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        setError("Giá phải là số lớn hơn 0.");
        return;
      }
      if (!formData.categoryId || parseInt(formData.categoryId) <= 0) {
        setError("Vui lòng chọn danh mục hợp lệ.");
        return;
      }

      // Chuẩn bị FormData
      const formDataToSend = new FormData();
      formDataToSend.append(
        "productId",
        editingProduct ? parseInt(formData.productId) : 0
      );
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("price", priceValue);
      formDataToSend.append("categoryId", parseInt(formData.categoryId));
      formDataToSend.append("summary", formData.summary || "");
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("isFeatured", formData.isFeatured);
      if (imageFile) {
        formDataToSend.append("image", imageFile); // Gửi file ảnh
      } else if (formData.imageURL) {
        formDataToSend.append("imageURL", formData.imageURL); // Giữ URL cũ
      }

      console.log("Sending formData:", Object.fromEntries(formDataToSend)); // Debug

      const url = editingProduct
        ? `https://localhost:7278/Product/${editingProduct.productId}`
        : "https://localhost:7278/Product";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        await fetchProducts();
        setPage(1);
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
          productId: null,
          name: "",
          price: 0.01,
          categoryId: "",
          summary: "",
          description: "",
          imageURL: "",
          isFeatured: false,
        });
        setImageFile(null);
        setImagePreview("");
      } else {
        const errorData = await response.json();
        setError(
          `Lưu sản phẩm thất bại. ${JSON.stringify(
            errorData.errors || errorData.message
          )}`
        );
      }
    } catch (error) {
      setError("Lỗi khi lưu sản phẩm: " + error.message);
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (productId) => {
    try {
      const response = await fetch(
        `https://localhost:7278/Product/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        await fetchProducts();
        setPage(1);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Xóa sản phẩm thất bại");
      }
    } catch (error) {
      setError("Lỗi khi xóa sản phẩm: " + error.message);
    }
  };

  // Nhập kho
  const openImportModal = (productId) => {
    setImportProductId(productId);
    setImportQuantity(0);
    setImportNote("");
    setShowImportModal(true);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://localhost:7278/Stock/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: importProductId,
          quantityChanged: parseInt(importQuantity),
          note: importNote,
        }),
      });
      if (response.ok) {
        await fetchProducts(); // Làm mới danh sách
        setShowImportModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Nhập kho thất bại");
      }
    } catch (error) {
      setError("Lỗi khi nhập kho: " + error.message);
    }
  };

  // Chi tiết nhập kho
  const openTransactionsModal = async (productId) => {
    try {
      const response = await fetch(
        `https://localhost:7278/Stock/${productId}/transactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data || []);
        setTransactionsProductId(productId);
        setShowTransactionsModal(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Không thể tải chi tiết giao dịch");
      }
    } catch (error) {
      setError("Lỗi khi tải chi tiết giao dịch: " + error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productId: product.productId,
      name: product.name || "",
      price: product.price || 0.01,
      categoryId: product.categoryId ? product.categoryId.toString() : "",
      summary: product.summary || "",
      description: product.description || "",
      imageURL: product.imageURL || "",
      isFeatured: product.isFeatured || false,
    });
    setImagePreview(
      product.imageURL ? `https://localhost:7278${product.imageURL}` : ""
    );
    setImageFile(null);
    setError("");
    setShowModal(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6">
      <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
        <div className="mb-6 flex flex-col justify-between border-b pb-4 sm:flex-row sm:items-center">
          <h3 className="mb-3 text-lg font-semibold text-gray-700 sm:mb-0 sm:text-xl flex items-center">
            <FaBox className="mr-2" /> Danh sách sản phẩm
          </h3>
          <form
            onSubmit={handleSearch}
            className="mb-4 flex flex-col items-center space-x-2 sm:flex-row"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm ..."
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
              setEditingProduct(null);
              setFormData({
                productId: null,
                name: "",
                price: 0.01,
                categoryId: "",
                summary: "",
                description: "",
                imageURL: "",
                isFeatured: false,
              });
              setImageFile(null);
              setImagePreview("");
              setError("");
              setShowModal(true);
            }}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition duration-200 ease-in-out hover:bg-blue-700 hover:shadow-md sm:w-auto"
          >
            <FaPlus className="h-4 w-4" /> <span>Thêm sản phẩm</span>
          </button>
        </div>

        {/* Thông báo lỗi */}
        {error && <div className="mb-4 text-red-500">{error}</div>}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Ảnh
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Tên
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase md:table-cell">
                  Giá
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Danh mục
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:table-cell">
                  Nổi bật
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Số lượng
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((product) => (
                <tr key={product.productId}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <img
                      className="h-10 w-10 rounded-full border object-cover"
                      src={
                        product.imageURL
                          ? `https://localhost:7278${product.imageURL}`
                          : "https://via.placeholder.com/40"
                      }
                      alt={product.name}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-800">
                    {product.name}
                  </td>
                  <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-gray-600 md:table-cell">
                    {product.price.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                    {product.categoryName || "N/A"}
                  </td>
                  <td className="hidden px-4 py-3 whitespace-nowrap sm:table-cell">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold ${
                        product.isFeatured
                          ? "bg-green-100 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {product.isFeatured ? "Có" : "Không"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                    {quantities[product.productId] !== undefined
                      ? quantities[product.productId]
                      : "Loading..."}
                  </td>
                  <td className="space-x-2 px-4 py-3 text-center text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1 text-blue-600 transition duration-150 ease-in-out hover:text-blue-800"
                      title="Sửa"
                    >
                      <FaEdit className="inline h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openImportModal(product.productId)}
                      className="p-1 text-green-600 transition duration-150 ease-in-out hover:text-green-800"
                      title="Nhập kho"
                    >
                      <FaWarehouse className="inline h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openTransactionsModal(product.productId)}
                      className="p-1 text-purple-600 transition duration-150 ease-in-out hover:text-purple-800"
                      title="Chi tiết nhập kho"
                    >
                      <FaInfoCircle className="inline h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.productId)}
                      className="p-1 text-red-600 transition duration-150 ease-in-out hover:text-red-800"
                      title="Xóa"
                    >
                      <FaTrash className="inline h-4 w-4" />
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
            Hiển thị trang {page} trên tổng {totalPages}, tổng {totalItems} sản
            phẩm
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={`rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 ${
                page === 1 ? "pointer-events-none opacity-50" : ""
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
                    ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className={`rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 ${
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal thêm/sửa sản phẩm */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </h3>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Giá</label>
                <input
                
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0.01;
                    setFormData({
                      ...formData,
                      price: value >= 0.01 ? value : 0.01,
                    });
                  }}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Danh mục</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Tóm tắt</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Ảnh sản phẩm
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="w-full border p-2 rounded"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 rounded object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                  />
                  Nổi bật
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setFormData({
                      productId: null,
                      name: "",
                      price: 0.01,
                      categoryId: "",
                      summary: "",
                      description: "",
                      imageURL: "",
                      isFeatured: false,
                    });
                    setImageFile(null);
                    setImagePreview("");
                    setError("");
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal nhập kho */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nhập kho</h3>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <form onSubmit={handleImportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Số lượng</label>
                <input
                  type="number"
                  min="1"
                  value={importQuantity}
                  onChange={(e) => setImportQuantity(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Ghi chú</label>
                <textarea
                  value={importNote}
                  onChange={(e) => setImportNote(e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiết nhập kho */}
      {showTransactionsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Chi tiết nhập/xuất kho</h3>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <div className="overflow-x-auto max-h-64">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Nhập/Xuất
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Số lượng thay đổi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Ngày
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {transactions.map((transaction) => (
                    <tr key={transaction.transactionId}>

                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                        {(transaction.isImport ? "Nhập" : "Xuất" )}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                        {transaction.quantityChanged}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                        {new Date(transaction.transactionDate).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                        {transaction.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowTransactionsModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
