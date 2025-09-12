import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Products from "./Products";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductList = async () => {
    try {
      const responsive = await fetch(
        `https://localhost:7278/Product/paged?pageNumber=1&pageSize=15`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!responsive.ok) {
        throw new Error(
          `HTTP error! Status: ${responsive.status} - ${responsive.statusText}`
        );
      }
      const data = await responsive.json();
      setProductsList(data.items);
      setLoading(false);
    } catch {
      setError("Lỗi khi lấy danh sách sản phẩm");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "https://localhost:7278/Product/featured",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status} - ${response.statusText}`
          );
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          throw new Error("Dữ liệu từ API không phải là mảng");
        }
        setLoading(false);
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu sản phẩm: " + err.message);
        setLoading(false);
      }
    };
    fetchProducts();
    fetchProductList();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500">Đang tải sản phẩm...</div>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-0.5 sm:p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Sản phẩm nổi bật</h2>
      <Products products={products} isCarousel={true} grid={true} />
      <h2 className="text-2xl font-bold mt-4 text-center">Tất cả sản phẩm</h2>
      <Products products={productsList} isCarousel={false} grid={true} />
      <Link
        to="/products"
        className="relative  px-4 py-2 text-sm text-gray-700 overflow-hidden group flex items-center justify-center border-2 border-black rounded-md mt-4 mx-auto w-48 "
      >
        <span className="absolute inset-0 bg-red-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-250 ease-in-out"></span>
        <span className="relative z-10 transition-colors duration-500 ease-in-out group-hover:text-white">
          Xem thêm ...
        </span>
      </Link>
    </div>
  );
};

export default ProductList;
