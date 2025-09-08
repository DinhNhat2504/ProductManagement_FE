import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../src/components/Client/Header/Navbar';
import Banner from '../src/components/Client/MainContent/Banner';
import ProductList from '../src/components/Client/MainContent/ProductList';
import ProductByCategory from '../src/components/Client/Page/ProductByCategory';
import ProductDetail from '../src/components/Client/Page/ProductDetail';
import Cart from '../src/components/Client/Page/Cart';
import CheckoutForm from '../src/components/Client/Page/CheckoutForm';
import Login from '../src/components/Client/MainContent/Login';
import Register from '../src/components/Client/MainContent/Register';
import ProductsPage from '../src/components/Client/Page/ProductsPage';
import { AuthContext } from '../src/context/AuthContext';

const ClientRoutes = () => {

  return (
    <>
    {/* {isLoggedIn && role !== 1 && } */}
    
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
        
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </>
  );
}
export default ClientRoutes;