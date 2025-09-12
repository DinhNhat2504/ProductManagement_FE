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

const ProductFilter = ({ cateId, isCategory }) => {
  const [maxPriceFt, setMaxPriceFt] = useState(0);
  const [filters, setFilters] = useState({
    categoryId: cateId,
    minPrice: 0,
    maxPrice: 0,
    sortBy: "",
    pageNumber: 1,
    pageSize: 15,
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch("https://localhost:7278/Product");
        if (!response.ok) throw new Error("Lỗi mạng");
        const data = await response.json();
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
    }));
  }, [cateId]);

  useEffect(() => {
    if (maxPriceFt > 0 && filters.maxPrice > 0) {
      fetchProducts();
    }
  }, [filters]);

  const fetchCategories = async () => {
    const response = await fetch("https://localhost:7278/Category", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setCategories(data);
  };

  const fetchProducts = async () => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.minPrice !== undefined) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    params.append("pageNumber", filters.pageNumber);
    params.append("pageSize", filters.pageSize);

    const response = await fetch(
      `https://localhost:7278/Product/filter?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    setProducts(data.items || data); // Adjust based on API response structure
    setTotalItems(data.totalItems || data.length); // Adjust based on API response structure
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
    <div className="flex mx-auto space-x-6">
      <div className="lg:w-[25%] bg-white p-4 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b-2 border-gray-200 pb-2">
          Bộ lọc
        </h2>
        <div className="space-y-6">
          {isCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Danh mục sản phẩm
              </label>
              <select
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                className="mt-2 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">--</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Khoảng giá
            </label>
            <div className="mt-2">
              <input
                type="range"
                min="0"
                max={maxPriceFt}
                value={filters.maxPrice}
                onChange={handlePriceChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0đ</span>
                <span>{maxPriceFt.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-[70%]">
        <div className="flex justify-between ">
          <h2 className="text-xl font-bold mb-2 mt-2 text-gray-800 border-b-2 border-gray-200 pb-2">
            Sản phẩm
          </h2>
          <div className="flex items-center gap-4 mt-2 mb-4">
            <label
              htmlFor="sortBy"
              className="text-sm font-medium text-gray-700"
            >
              Sắp xếp theo
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">Chọn</option>
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
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePageChange(filters.pageNumber - 1)}
              disabled={filters.pageNumber === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-l-md disabled:opacity-50 hover:bg-gray-400"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-200">
              Page {filters.pageNumber} of {Math.ceil(totalItems / filters.pageSize)}
            </span>
            <button
              onClick={() => handlePageChange(filters.pageNumber + 1)}
              disabled={filters.pageNumber * filters.pageSize >= totalItems}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-r-md disabled:opacity-50 hover:bg-gray-400"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;