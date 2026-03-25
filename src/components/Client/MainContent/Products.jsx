import { useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaMoneyBillWave,
} from "react-icons/fa";
import { AddToCartButton, BuyNowButton } from "./Button";
import { Link } from "react-router-dom";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { getImageUrl } from "../../../utils/helpers";

function Products({ products, isCarousel, grid }) {
  const [isLiked, setIsLiked] = useState(false);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
    },
  };

  function renderContent() {
    if (products.length === 0) {
      return (
        <div className="text-center text-gray-500">Không có sản phẩm nào.</div>
      );
    }

    const items = products.map((product) => (
      <div
        key={product.productId}
        className={`${isCarousel ? "m-2 sm:my-6 sm:mx-3" : "w-full mb-6"
          } bg-white rounded-2xl shadow-sm hover:shadow-2xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2 border border-gray-100 relative group flex flex-col`}
      >
        {product.imageURL && (
          <div className="relative overflow-hidden aspect-[4/5] sm:aspect-[3/4]">
            <Link to={`/products/${product.productId}`} className="block w-full h-full">
              <img
                src={getImageUrl(product.imageURL)}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
            </Link>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isFeatured && (
                <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider backdrop-blur-sm">
                  Hot
                </span>
              )}
              <span className="bg-white/90 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm border border-red-100">
                -10%
              </span>
            </div>

            {/* Quick Actions Overflow Wrapper */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 flex items-center justify-center gap-3">
              <div className="relative pointer-events-auto">
                <AddToCartButton
                  product={product}
                  quantity={1}
                  classCustom="peer p-3.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-red-500 hover:text-white text-gray-800 shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group/btn focus:outline-none"
                >
                  <FaShoppingCart className="w-4 h-4 transition-colors" />
                </AddToCartButton>
              </div>

              <div className="relative pointer-events-auto">
                <BuyNowButton
                  product={product}
                  quantity={1}
                  classCustom="peer py-3.5 px-5 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center text-sm focus:outline-none"
                >
                  Mua Ngay
                </BuyNowButton>
              </div>
            </div>

            {/* Wishlist Heart Top Right
            <button
              onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
              className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md shadow-sm transition-all duration-300 z-10 focus:outline-none ${isLiked ? 'bg-white text-red-500' : 'bg-white/70 hover:bg-white text-gray-500 hover:text-red-500'}`}
              aria-label="Add to wishlist"
            >
              {isLiked ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
            </button> */}
          </div>
        )}

        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          <Link to={`/products/${product.productId}`}>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors leading-snug mb-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-500 text-xs sm:text-sm line-clamp-1 mb-3">
            {product.summary || "Sản phẩm chất lượng cao"}
          </p>

          <div className="mt-auto pt-2 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-red-500 leading-none">
                {product.price.toLocaleString("vi-VN")}₫
              </span>
              <span className="text-xs text-gray-400 line-through mt-1 font-medium">
                {(product.price + product.price * 0.1).toLocaleString("vi-VN")}₫
              </span>
            </div>

            {/* Small star rating display */}
            {/* <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
              <FaHeart className="w-2.5 h-2.5 text-yellow-500" />
              <span className="text-xs font-bold text-yellow-700">4.9</span>
            </div> */}
          </div>
        </div>
      </div>
    ));

    return isCarousel ? (
      <Carousel responsive={responsive}>{items}</Carousel>
    ) : (
      items
    );
  }

  return (
    <div
      className={
        isCarousel
          ? "w-full bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl p-2 sm:p-4 my-4 border border-indigo-100"
          : grid
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mt-6"
            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6"
      }
    >
      {renderContent()}
    </div>
  );
}

export default Products;
