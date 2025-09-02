import React, { useState, useEffect } from 'react';
import Products from './Products'; // Import component Products
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaMoneyBillWave,
} from "react-icons/fa";
import { AddToCartButton,BuyNowButton } from './Button';
import { Link } from "react-router-dom";
const ProductFilter = ({cateId,isCategory}) => {
  const [filters, setFilters] = useState({
    categoryId: cateId,
    minPrice: 0,
    maxPrice: 3000000,
    sortBy: ''
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
   const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    
    fetchCategories();
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categoryId: cateId
    }));
  }, [cateId]);


  const fetchCategories = async () => {
    const response = await fetch('https://localhost:7278/Category', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    setCategories(data);
  };
 
  const fetchProducts = async () => {
    const query = new URLSearchParams({
      categoryId: filters.categoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortBy: filters.sortBy
    }).toString();

    const response = await fetch(`https://localhost:7278/Product/filter?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    setProducts(data);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFilters(prev => ({
      ...prev,
      minPrice: value,
      maxPrice: value === 3000000 ? 3000000 : prev.maxPrice
    }));
  };

  return (
    <div className="flex mx-auto space-x-6">
      {/* Thanh bên (Sidebar) */}
      <div className="lg:w-[25%] bg-white p-4 shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b-2 border-gray-200 pb-2">Bộ lọc</h2>
        <div className="space-y-6">
           {isCategory && <div>
            <label className="block text-sm font-medium text-gray-700">Danh mục sản phẩm</label>
            <select
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className="mt-2 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">--</option>
              {categories.map(category => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Khoảng giá</label>
            <div className="mt-2">
              <input
                type="range"
                min="0"
                max="3000000"
                value={filters.minPrice}
                onChange={handlePriceChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0đ</span>
                <span>3.000.000đ</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="lg:w-[70%]">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b-2 border-gray-200 pb-2">Sản phẩm</h2>
        <div className="flex">
          <label className="block text-sm font-medium text-gray-700">Sắp xếp theo</label>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="mt-2 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 mb-4"
          >
            <option value="">Chọn</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="newest">Mới nhất</option>
            <option value="name">Tên</option>
          </select>
        </div>
        </div>
       
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.length > 0 ? (
          products.map((product) => (
            <div className="w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl relative group" key={product.productId}>
              {product.imageURL && (
                <div className="relative group" >
                  <Link
                    to={`/products/${product.productId}`}
                    
                  >
                    <img
                      src={`https://localhost:7278${product.imageURL}`}
                      alt={product.name}
                      className="w-full h-64 object-cover object-center"
                    />
                  </Link>

                  {/* Overlay chứa nút */}
                  <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 pointer-events-none">
                    {/* Nút giỏ hàng */}
                    <div className="relative pointer-events-auto">
                     
                      <AddToCartButton product={product} quantity={1} classCustom="peer p-3 bg-white rounded-full hover:bg-red-400 transition-all duration-500 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                        <FaShoppingCart className="w-6 h-6 text-gray-800 hover:text-white" />
                      </AddToCartButton>
                      {/* Tooltip chỉ hiện khi hover vào nút nhờ peer-hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 peer-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        Thêm vào giỏ hàng
                      </div>
                    </div>

                    {/* Nút mua ngay */}
                    <div className="relative pointer-events-auto">
                        
                        <BuyNowButton product={product} quantity={1} classCustom="peer p-3 bg-white rounded-full hover:bg-red-400 transition-all duration-500 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                          <FaMoneyBillWave className="w-6 h-6 text-gray-800 hover:text-white" />
                        </BuyNowButton>
                      {/* Tooltip chỉ hiện khi hover vào nút nhờ peer-hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 peer-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        Mua ngay
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {product.summary}
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-lg font-bold text-green-600 mt-2">
                    {product.price.toLocaleString("vi-VN")}₫
                  </span>
                  <span className="text-sm text-gray-500 mt-2 line-through">
                    {(product.price + product.price * 0.1).toLocaleString(
                      "vi-VN"
                    )}
                    ₫
                  </span>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    {product.isFeatured && (
                      <span className="inline-block bg-red-500 text-yellow-400 font-bold text-xs px-2 py-1 rounded-full mt-2">
                        Hot
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="p-2 rounded-full bg-gray-100 transition-colors duration-300 hover:bg-gray-200 flex items-center gap-2"
                    aria-label={
                      isLiked ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    {isLiked ? (
                      <FaHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <FaRegHeart className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            Không có sản phẩm nào.
          </div>
        )}
      </div>
   
        
      </div>
      
    </div>
  );
};

export default ProductFilter;