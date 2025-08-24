import React from "react";
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function ProductByCategory() {
    const [products,setProducts] = useState();
    const [loading,setLoading] = useState(true);
    const {categoryId} = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search).get("name");
    useEffect(() => {
        const callProduct = async () => {
            try{
                const response = await fetch(`https://localhost:7278/Product/category/${categoryId}`)
                if(!response.ok) throw new Error('Lỗi mạng');
                const data = await response.json();
                console.log(data);
                setProducts(data);
            }catch(error){
                console.error("Lỗi: "+error)
            }finally{
                setLoading(false);
            }
        }
        callProduct();
    },[categoryId])
    if(loading) return <div className="text-center py-4">Đang tải...</div>;
    return (
        <>
        <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Sản phẩm {queryParams}</h1>
      {products.length > 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
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
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">Không có sản phẩm trong danh mục này.</div>
      )}
    </div>
        </>
    )
}

