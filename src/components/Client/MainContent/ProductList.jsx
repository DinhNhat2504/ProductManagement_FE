import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Products from "./Products";
import api from "../../../utils/api";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [featuredRes, pagedRes] = await Promise.all([
          api.get("/Product/featured"),
          api.get("/Product/paged?pageNumber=1&pageSize=15")
        ]);

        if (isMounted) {
          if (Array.isArray(featuredRes.data)) {
            setProducts(featuredRes.data);
          } else {
            setProducts([]);
          }
          setProductsList(pagedRes.data?.items || []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Lỗi khi lấy dữ liệu sản phẩm: " + (err.response?.data?.message || err.message));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => { isMounted = false; };
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500">Đang tải sản phẩm...</div>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight inline-block relative">
          Sản Phẩm Nổi Bật
          <span className="absolute -bottom-2 left-1/4 right-1/4 h-1.5 bg-red-500 rounded-full"></span>
        </h2>
      </div>
      <div className="mb-16">
        <Products products={products} isCarousel={true} grid={true} />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight inline-block relative">
          Tất Cả Sản Phẩm
          <span className="absolute -bottom-2 left-1/4 right-1/4 h-1.5 bg-blue-500 rounded-full"></span>
        </h2>
      </div>
      <Products products={productsList} isCarousel={false} grid={true} />
      
      <div className="mt-12 flex justify-center">
        <Link
          to="/products"
          className="relative inline-flex items-center justify-center px-10 py-3.5 overflow-hidden font-bold tracking-tighter text-gray-900 bg-white border-2 border-gray-900 rounded-full group shadow-md hover:shadow-xl transition-shadow"
        >
          <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-gray-900 rounded-full group-hover:w-64 group-hover:h-56"></span>
          <span className="relative flex items-center gap-2 transition-colors duration-300 ease-in-out group-hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            XEM KHO SẢN PHẨM
          </span>
        </Link>
      </div>
    </div>
  );
};

export default ProductList;
