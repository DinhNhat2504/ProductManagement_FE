import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../src/components/Client/Header/Navbar";
import Banner from "../src/components/Client/MainContent/Banner";
import ProductList from "../src/components/Client/MainContent/ProductList";
import ProductByCategory from "../src/components/Client/Page/ProductByCategory";
import ProductDetail from "../src/components/Client/Page/ProductDetail";
import Cart from "../src/components/Client/Page/Cart";
import CheckoutForm from "../src/components/Client/Page/CheckoutForm";
import Login from "../src/components/Client/MainContent/Login";
import Register from "../src/components/Client/MainContent/Register";
import ProductsPage from "../src/components/Client/Page/ProductsPage";
import { AuthContext } from "../src/context/AuthContext";
import iphone_logo from "../src/assets/logo/iphone_logo.png";
import realme from "../src/assets/logo/realme_logo.png";
import samsung from "../src/assets/logo/samsung_logo.png";
import xiaomi from "../src/assets/logo/xiaomi_logo.png";
import oppo from "../src/assets/logo/oppo_logo.png";
import LogoLoop from "../src/components/Client/MainContent/LogoLoop";
import OrderConfirmation from "../src/components/Client/Page/OrderConfirmation";
import OrdersPage from "../src/components/Client/Page/OrdersPage";
import Chatbot from "../src/components/Client/Page/Chatbot";
import UserProfile from "../src/components/Client/Page/UserProfile";
import ChatWidget from "../src/components/Client/Page/ChatWidget";

const ClientRoutes = () => {
  const imageLogos = [
    { src: iphone_logo, alt: "Company 1", href: "" },
    { src: realme, alt: "Company 2", href: "" },
    { src: samsung, alt: "Company 3", href: "" },
    { src: xiaomi, alt: "Company 4", href: "" },
    { src: oppo, alt: "Company 5", href: "" },
  ];
  return (
    <>
      {/* {isLoggedIn && role !== 1 && } */}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Banner />
              <div
                className="w-full h-18 flex mt-4 items-center justify-center relative overflow-hidden "
              >
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

        <Route
          path="/products/category/:categoryId"
          element={<ProductByCategory />}
        />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<CheckoutForm />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/order/confirm" element={<OrderConfirmation />} />
        
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
      <Chatbot/>
      <ChatWidget/>
    </>
  );
};
export default ClientRoutes;
