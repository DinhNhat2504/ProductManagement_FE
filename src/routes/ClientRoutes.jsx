import React from "react";
import { Routes, Route } from "react-router-dom";
import ClientLayout from "../layouts/ClientLayout";
import Banner from "../components/Client/MainContent/Banner";
import ProductList from "../components/Client/MainContent/ProductList";
import LogoLoop from "../components/Client/MainContent/LogoLoop";
import ProductByCategory from "../pages/Client/ProductByCategory";
import ProductDetail from "../pages/Client/ProductDetail";
import Cart from "../pages/Client/Cart";
import CheckoutForm from "../pages/Client/CheckoutForm";
import ProductsPage from "../pages/Client/ProductsPage";
import OrderConfirmation from "../pages/Client/OrderConfirmation";
import OrdersPage from "../pages/Client/OrdersPage";
import UserProfile from "../pages/Client/UserProfile";

import iphone_logo from "../assets/logo/iphone_logo.png";
import realme from "../assets/logo/realme_logo.png";
import samsung from "../assets/logo/samsung_logo.png";
import xiaomi from "../assets/logo/xiaomi_logo.png";
import oppo from "../assets/logo/oppo_logo.png";

const ClientRoutes = () => {
  const imageLogos = [
    { src: iphone_logo, alt: "Company 1", href: "" },
    { src: realme, alt: "Company 2", href: "" },
    { src: samsung, alt: "Company 3", href: "" },
    { src: xiaomi, alt: "Company 4", href: "" },
    { src: oppo, alt: "Company 5", href: "" },
  ];

  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route
          path="/"
          element={
            <>
              <Banner />
              <div className="w-full h-18 flex mt-4 items-center justify-center relative overflow-hidden">
                <LogoLoop
                  logos={imageLogos}
                  speed={180}
                  direction="right"
                  logoHeight={80}
                  gap={40}
                  pauseOnHover
                  scaleOnHover
                  fadeOut
                  fadeOutColor="##e5e7eb"
                  ariaLabel="Technology partners"
                />
              </div>
              <ProductList />
            </>
          }
        />
        <Route path="/products/category/:categoryId" element={<ProductByCategory />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutForm />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/order/confirm" element={<OrderConfirmation />} />
      </Route>
    </Routes>
  );
};
export default ClientRoutes;
