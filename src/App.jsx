import { useState } from 'react'
import React from "react";
import './App.css'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import ProductList from './components/MainContent/ProductList.jsx'
import ProductByCategory from './components/MainContent/ProductByCategory.jsx'
import ProductDetail from './components/MainContent/ProductDetail.jsx';
import Navbar from './components/Header/Navbar.jsx'
import Banner from './components/MainContent/Banner.jsx';

function App() {
  
  return (
    <>
   <Router>
  <Navbar />
  <Routes>
    <Route path="/" element={
      <>
        <Banner />
        <ProductList />
      </>
    } />
    <Route path="/products/category/:categoryId" element={<ProductByCategory />} />
    <Route path="/products/:productId" element={<ProductDetail />} />
  </Routes>
</Router>

    </>
  )
}

export default App
