import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { FaBox, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const ProductManagement = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
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
        formDataToSend.append("imageFile", imageFile); // Gửi file ảnh
      } else if (formData.imageURL && !editingProduct) {
        formDataToSend.append("imageURL", formData.imageURL); // Giữ URL cũ cho thêm mới
      }

      console.log("Sending formData:", Object.fromEntries(formDataToSend)); // Debug: Kiểm tra dữ liệu gửi đi

      const url = editingProduct
        ? `https://localhost:7278/Product/${editingProduct.productId}`
        : "https://localhost:7278/Product";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Không đặt 'Content-Type' để FormData tự xử lý
        },
        body: formDataToSend,
      });

      if (response.ok) {
        await fetchProducts();
        setPage(1);
        setIsOpen(false);
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

    setIsOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6">
      <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6 relative">
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
        <div className="mb-6  items-start justify-between pb-4 sm:flex-row sm:items-center">
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

              setIsOpen(true);
            }}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition duration-200 ease-in-out hover:bg-blue-700 hover:shadow-md sm:w-auto"
          >
            <FaPlus className="h-4 w-4" /> <span>Thêm sản phẩm</span>
          </button>
          <div className="absolute top-10 left-0 right-0 z-10 mx-auto w-full max-w-3xl px-4 sm:px-6">
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isOpen
                  ? "max-h-[1000px] opacity-100 scale-100"
                  : "max-h-0 opacity-0 scale-95"
              }`}
            >
              <div className="mt-2 p-6 bg-gray-50 rounded-lg shadow-inner">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <h3 className="text-xl font-bold mb-4">
                  {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                </h3>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
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
                    <div className="">
                      <label className="block text-sm font-medium">
                        Danh mục
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryId: e.target.value,
                          })
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
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
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
                          setFormData({
                            ...formData,
                            isFeatured: e.target.checked,
                          })
                        }
                      />
                      Nổi bật
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
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
          </div>
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
                  <td className="space-x-2 px-4 py-3 text-center text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1 text-blue-600 transition duration-150 ease-in-out hover:text-blue-800"
                      title="Sửa"
                    >
                      <FaEdit className="inline h-4 w-4" />
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
    </div>
  );
};

export default ProductManagement;
