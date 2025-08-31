import { useState } from 'react'
import React from "react";
import './App.css'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import ProductList from './components/MainContent/ProductList.jsx'
import ProductByCategory from './components/MainContent/ProductByCategory.jsx'
import ProductDetail from './components/MainContent/ProductDetail.jsx';
import Navbar from './components/Header/Navbar.jsx'
import Banner from './components/MainContent/Banner.jsx';
import Cart from './components/Cart.jsx';
import CheckoutForm from './components/CheckoutForm.jsx';
import Login from './components/MainContent/Login.jsx';
import Register from './components/MainContent/Register.jsx';

function App() {
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Banner />
              <ProductList />
            </>
          }
        />
        <Route path="/products/category/:categoryId" element={<ProductByCategory />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      {/* Nút login để test (xóa sau khi có auth thực tế) */}
      
    </>
  );
}

export default App
