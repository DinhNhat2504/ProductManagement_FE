import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";
import { FaTag, FaPlus, FaEdit, FaTrash, FaImage } from "react-icons/fa";

const BrandManagement = () => {
  const { token } = useContext(AuthContext);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [formData, setFormData] = useState({
    brandId: 0,
    name: "",
    categoryId: "",
    imageURL: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await api.get("/Category", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    }
  };

  // Lấy danh sách thương hiệu
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/Brand?pageNumber=${page}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(search)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      if (data && data.items !== undefined) {
        setBrands(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      } else {
        // If the API returns a flat array instead of pagination
        setBrands(data || []);
        setTotalPages(1);
        setTotalItems(data?.length || 0);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Lỗi khi tải thương hiệu";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [token, page, search]);

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

  const uploadImage = async (brandId, file) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    await api.post(`/Brand/${brandId}/upload-image`, uploadData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");

      if (!formData.name || !formData.name.trim()) {
        setError("Tên thương hiệu là bắt buộc.");
        return;
      }
      if (!formData.categoryId || parseInt(formData.categoryId) <= 0) {
        setError("Vui lòng chọn danh mục.");
        return;
      }

      const payload = {
        brandId: editingBrand ? parseInt(formData.brandId) : 0,
        name: formData.name.trim(),
        categoryId: parseInt(formData.categoryId),
        imageURL: formData.imageURL || ""
      };

      let savedBrandId = payload.brandId;

      if (editingBrand) {
        await api.put(`/Brand/${savedBrandId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const response = await api.post('/Brand', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Assuming response returns the created brand or ID
        if (response.data && response.data.brandId) {
          savedBrandId = response.data.brandId;
        } else if (typeof response.data === 'number') {
          savedBrandId = response.data;
        } else if (response.data && response.data.id) {
          savedBrandId = response.data.id;
        }
      }

      // If image is selected, upload it
      if (imageFile && savedBrandId) {
        await uploadImage(savedBrandId, imageFile);
      } else if (imageFile && !savedBrandId) {
        // Fallback if we cannot get the new brand ID from the POST response
        console.warn("Could not get new brand ID to upload image.");
      }

      await fetchBrands();
      closeModal();
    } catch (error) {
      const errorData = error.response?.data?.errors || error.response?.data?.message || error.message;
      setError(`Lưu thương hiệu thất bại. ${JSON.stringify(errorData)}`);
    }
  };

  const handleDelete = async (brandId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;
    try {
      await api.delete(`/Brand/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchBrands();
      setPage(1);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setError("Xóa thương hiệu thất bại: " + errorMessage);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      brandId: brand.brandId,
      name: brand.name || "",
      categoryId: brand.categoryId ? brand.categoryId.toString() : "",
      imageURL: brand.imageURL || "",
    });
    setImagePreview(
      brand.imageURL ? `https://localhost:7278${brand.imageURL}` : ""
    );
    setImageFile(null);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormData({
      brandId: 0,
      name: "",
      categoryId: "",
      imageURL: "",
    });
    setImageFile(null);
    setImagePreview("");
    setError("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.categoryId === categoryId);
    return cat ? cat.name : "N/A";
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6">
      <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
        <div className="mb-6 flex flex-col justify-between border-b pb-4 sm:flex-row sm:items-center">
          <h3 className="mb-3 text-lg font-semibold text-gray-700 sm:mb-0 sm:text-xl flex items-center">
            <FaTag className="mr-2" /> Danh sách thương hiệu
          </h3>
          <form
            onSubmit={handleSearch}
            className="mb-4 flex flex-col items-center space-x-2 sm:flex-row"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm thương hiệu ..."
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
              closeModal();
              setShowModal(true);
            }}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow transition duration-200 ease-in-out hover:bg-blue-700 hover:shadow-md sm:w-auto"
          >
            <FaPlus className="h-4 w-4" /> <span>Thêm thương hiệu</span>
          </button>
        </div>

        {error && !showModal && <div className="mb-4 text-red-500">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Ảnh</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Danh mục</th>
                <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {brands.map((brand) => (
                <tr key={brand.brandId}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <img
                      className="h-10 w-10 rounded-full border object-cover"
                      src={
                        brand.imageURL
                          ? `https://localhost:7278${brand.imageURL}`
                          : "https://via.placeholder.com/40"
                      }
                      alt={brand.name}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-800">
                    {brand.name}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                    {getCategoryName(brand.categoryId)}
                  </td>
                  <td className="space-x-2 px-4 py-3 text-center text-sm font-medium whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="p-1 text-blue-600 transition duration-150 ease-in-out hover:text-blue-800"
                      title="Sửa"
                    >
                      <FaEdit className="inline h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.brandId)}
                      className="p-1 text-red-600 transition duration-150 ease-in-out hover:text-red-800"
                      title="Xóa"
                    >
                      <FaTrash className="inline h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">
                    Không có thương hiệu nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - only show if there are multiple pages */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center justify-between space-y-3 sm:flex-row sm:space-y-0">
            <span className="text-sm text-gray-600">
              Hiển thị trang {page} trên {totalPages}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 ${page === 1 ? "pointer-events-none opacity-50" : ""
                  }`}
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-md border px-3 py-1 text-sm ${p === page
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
                className={`rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 ${page === totalPages ? "pointer-events-none opacity-50" : ""
                  }`}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingBrand ? "Sửa thương hiệu" : "Thêm thương hiệu"}
            </h3>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Tên thương hiệu</label>
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
                <label className="block text-sm font-medium">Ảnh thương hiệu</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="w-full border p-2 rounded"
                />
                {imagePreview && (
                  <div className="mt-2 text-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-24 w-auto rounded object-contain mx-auto border"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeModal}
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
    </div>
  );
};

export default BrandManagement;
