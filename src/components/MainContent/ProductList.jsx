import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';



const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://localhost:7278/Product/featured', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          throw new Error('Dữ liệu từ API không phải là mảng');
        }
        setLoading(false);
      } catch (err) {
        setError('Lỗi khi lấy dữ liệu sản phẩm: ' + err.message);
        setLoading(false);
      } 
    };
    fetchProducts();
  }, []);

  
  if (loading) return <div className="text-center text-gray-500">Đang tải sản phẩm...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Sản phẩm nổi bật</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <Link
              to={`/products/${product.productId}`}
              key={product.productId}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
            
              {product.imageURL && (
                <img
                  src={`https://localhost:7278${product.imageURL}`} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.summary}</p>
                <p className="text-lg font-bold text-green-600 mt-2">
                  {product.price.toLocaleString('vi-VN')} VND
                </p>
                {product.isFeatured && (
                  <span className="inline-block bg-red-500 text-yellow-400 font-bold text-xs px-2 py-1 rounded-full mt-2">
                    Hot
                  </span>
                )}
                
              </div>
            
            </Link>
          ))
        ) : (
          <div className="text-center text-gray-500">Không có sản phẩm nào.</div>
        )}
      </div>
    </div>
  );
};

export default ProductList;