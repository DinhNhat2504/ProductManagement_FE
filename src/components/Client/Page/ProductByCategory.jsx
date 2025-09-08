import React from "react";
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProductFilter from "../MainContent/ProductFilter";

export default function ProductByCategory() {
    
    const [loading,setLoading] = useState(true);
    const {categoryId} = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search).get("name");
    useEffect(() => {
    const callProduct = async () => {
        try {
            const response = await fetch(`https://localhost:7278/Product/category/${categoryId}`);
            if (!response.ok) throw new Error('Lỗi mạng');
            const data = await response.json();
            console.log(data);
           
        } catch (error) {
            console.error("Lỗi: " + error);
        } finally {
            setLoading(false);
        }
    };
    callProduct();
}, [categoryId]);

    if(loading) return <div className="text-center py-4">Đang tải...</div>;
    return (
        <>
        <div className="w-full mx-auto">

      <ProductFilter cateId={categoryId} isCategory={false}  />
    </div>
        </>
    )
}

