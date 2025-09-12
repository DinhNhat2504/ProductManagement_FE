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
        className={`${
          isCarousel ? "m-0.5 sm:m-2 sm:mb-4 sm:mt-4 " : "w-full m-0.5 sm:m-2"
        } bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl relative group`}
      >
        {product.imageURL && (
          <div className="relative group">
            <Link to={`/products/${product.productId}`}>
              <img
                src={`https://localhost:7278${product.imageURL}`}
                alt={product.name} 
                className="h-48 w-full sm:h-64 object-cover object-center"
              />
            </Link>
            <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 pointer-events-none">
              <div className="relative pointer-events-auto">
                <AddToCartButton
                  product={product}
                  quantity={1}
                  
                  classCustom="peer p-3 bg-white rounded-full hover:bg-red-400 transition-all duration-500 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <FaShoppingCart className="w-6 h-6 text-gray-800 hover:text-white" />
                </AddToCartButton >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 peer-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Thêm vào giỏ hàng
                </div>
              </div>
              <div className="relative pointer-events-auto">
                <BuyNowButton
                  product={product}
                  quantity={1}
                  classCustom="peer p-3 bg-white rounded-full hover:bg-red-400 transition-all duration-500 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <FaMoneyBillWave className="w-6 h-6 text-gray-800 hover:text-white" />
                </BuyNowButton>

                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 peer-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Mua ngay
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{product.name}</h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {product.summary}
          </p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-bold text-green-600 mt-2">
              {product.price.toLocaleString("vi-VN")}₫
            </span>
            <span className="text-sm text-gray-500 mt-2 line-through">
              {(product.price + product.price * 0.1).toLocaleString("vi-VN")}₫
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              {product.isFeatured && (
                <span className="inline-block bg-red-500 text-yellow-400 font-bold text-xs px-2 py-1 rounded-full mt-2">
                  Hot
                </span>
              )}
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 rounded-full bg-gray-100 transition-colors duration-300 hover:bg-gray-200 flex items-center gap-2"
              aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isLiked ? (
                <FaHeart className="w-3 h-3 text-red-500" />
              ) : (
                <FaRegHeart className="w-3 h-3 text-gray-600" />
              )}
            </button>
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
    <>
      <div
  className={
    isCarousel
      ? "w-full"
      : grid
      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-5 gap-2"
      : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5 gap-2"
  }
>

        {renderContent()}
      </div>
    </>
  );
}

export default Products;
