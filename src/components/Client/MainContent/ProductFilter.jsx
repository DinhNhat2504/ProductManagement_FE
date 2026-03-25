import React, { useState, useEffect } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaMoneyBillWave,
} from "react-icons/fa";
import { AddToCartButton, BuyNowButton } from "./Button";
import Products from "./Products";
import { Link } from "react-router-dom";
import api from "../../../utils/api";

const ProductFilter = ({ cateId, isCategory }) => {
  const [maxPriceFt, setMaxPriceFt] = useState(0);
  const [filters, setFilters] = useState({
    categoryId: cateId,
    brandId: "",
    minPrice: 0,
    maxPrice: 0,
    sortBy: "",
    pageNumber: 1,
    pageSize: 15,
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await api.get("/Product");
        const data = response.data;
        const maxPrice = Math.max(...data.map((item) => item.price));
        setMaxPriceFt(maxPrice);
        setFilters((prev) => ({
          ...prev,
          maxPrice: maxPrice,
        }));
      } catch (error) {
        console.error("Lỗi: " + error);
      }
    };
    fetchAllProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categoryId: cateId,
      brandId: "",
    }));
  }, [cateId]);

  useEffect(() => {
    const fetchBrandsData = async () => {
      try {
        let url = `/Brand?pageSize=100`; // Lấy nhiều thương hiệu nếu không có categoryId
        if (filters.categoryId) {
          url = `/Category/${filters.categoryId}/brands`;
        }
        const response = await api.get(url);
        const data = response.data;
        if (data && data.items !== undefined) {
          setBrands(data.items || []);
        } else {
          setBrands(data || []);
        }
      } catch (error) {
        console.error("Lỗi tải thương hiệu:", error);
        setBrands([]);
      }
    };
    fetchBrandsData();
  }, [filters.categoryId]);

  useEffect(() => {
    if (maxPriceFt > 0 && filters.maxPrice > 0) {
      fetchProducts();
    }
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/Category");
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const fetchProducts = async () => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.brandId) params.append("brandId", filters.brandId);
    if (filters.minPrice !== undefined) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    params.append("pageNumber", filters.pageNumber);
    params.append("pageSize", filters.pageSize);

    try {
      const response = await api.get(`/Product/filter?${params.toString()}`);
      const data = response.data;
      setProducts(data.items || data); // Adjust based on API response structure
      setTotalItems(data.totalItems || data.length); // Adjust based on API response structure
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      pageNumber: 1, // Reset to first page when filters change
    }));
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFilters((prev) => ({
      ...prev,
      minPrice: 0,
      maxPrice: value,
      pageNumber: 1, // Reset to first page when price changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      pageNumber: newPage,
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto gap-8 px-4 sm:px-6 py-10">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-1/4 bg-white p-6 shadow-sm border border-gray-100 rounded-3xl h-fit sticky top-24">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
          <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Bộ Lọc
          </h2>
        </div>
        <div className="space-y-8">
          {isCategory && (
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                Danh mục sản phẩm
              </label>
              <div className="relative">
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-700 hover:border-blue-300"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          )}
          
          {brands && brands.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                Thương hiệu
              </label>
              <div className="relative">
                <select
                  name="brandId"
                  value={filters.brandId}
                  onChange={handleFilterChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-700 hover:border-blue-300"
                >
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.brandId} value={brand.brandId}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
              Mức giá tối đa
            </label>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max={maxPriceFt || 10000000}
                value={filters.maxPrice}
                onChange={handlePriceChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 shadow-inner"
              />
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">0₫</span>
                <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                  {Number(filters.maxPrice).toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-3/4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Sản phẩm
          </h2>
          <div className="flex items-center gap-3 bg-white p-2 shrink-0 rounded-full shadow-sm border border-gray-100">
            <label
              htmlFor="sortBy"
              className="text-sm font-bold text-gray-600 pl-3 hidden sm:block whitespace-nowrap"
            >
              Sắp xếp:
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="pr-8 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-700 hover:border-blue-300 appearance-none outline-none cursor-pointer"
            >
              <option value="">Mặc định</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="newest">Mới nhất</option>
              <option value="name">Tên</option>
            </select>
          </div>
        </div>

        <Products products={products} isCarousel={false} grid={false} />

        {/* Pagination Controls */}
        {totalItems > filters.pageSize && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <button
              onClick={() => handlePageChange(filters.pageNumber - 1)}
              disabled={filters.pageNumber === 1}
              className="px-5 py-2.5 bg-white text-gray-700 font-bold rounded-full border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Trước
            </button>
            <span className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-full shadow-md">
              {filters.pageNumber} / {Math.ceil(totalItems / filters.pageSize)}
            </span>
            <button
              onClick={() => handlePageChange(filters.pageNumber + 1)}
              disabled={filters.pageNumber * filters.pageSize >= totalItems}
              className="px-5 py-2.5 bg-white text-gray-700 font-bold rounded-full border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2"
            >
              Sau
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;