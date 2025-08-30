import React, { useState, useEffect } from "react";

import Products from "./Products";


const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

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
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500">Đang tải sản phẩm...</div>
    );
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Sản phẩm nổi bật</h2>
      <Products products={products} />
    </div>
  );
};

export default ProductList;
