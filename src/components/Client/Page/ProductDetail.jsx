import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AddToCartButton,BuyNowButton } from "../MainContent/Button";
import { AuthContext } from "../../../context/AuthContext";
import { FaStar } from 'react-icons/fa';
import Products from "../MainContent/Products";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewForm, setReviewForm] = useState({content: '', rating: 5 });
  const [quantity, setQuantity] = useState(1);  
  const { isLoggedIn, userId, token } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await fetch(
          `https://localhost:7278/Product/${productId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!productResponse.ok)
          throw new Error(
            `HTTP error product! Status: ${productResponse.status}`
          );
        const productData = await productResponse.json();
        console.log("Product detail data:", productData);
        setProduct(productData);

        const reviewsResponse = await fetch(
          `https://localhost:7278/Product/${productId}/reviews`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!reviewsResponse.ok)
          throw new Error(
            `HTTP error reviews! Status: ${reviewsResponse.status}`
          );
        const reviewsData = await reviewsResponse.json();
        console.log("Reviews data:", reviewsData);
        if (Array.isArray(reviewsData)) setReviews(reviewsData);
        else throw new Error("Dữ liệu review không phải là mảng");
        const relatedResponse = await fetch(`https://localhost:7278/Product/${productId}/related`);
        if (!relatedResponse.ok) throw new Error(`HTTP error related products! Status: ${relatedResponse.status}`);
        const relatedData = await relatedResponse.json();
        console.log("Related products data:", relatedData);
        if (Array.isArray(relatedData)) setRelatedProducts(relatedData);
        else throw new Error("Dữ liệu sản phẩm liên quan không phải là mảng");
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Lỗi khi lấy dữ liệu: " + err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  if (loading)
    return <div className="text-center text-gray-500">Đang tải...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!product)
    return (
      <div className="text-center text-gray-500">Không tìm thấy sản phẩm.</div>
    );

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4);

  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () => setQuantity(quantity > 1 ? quantity - 1 : 1);
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError('Vui lòng đăng nhập để gửi đánh giá!');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7278/api/ProductReview/${productId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId,
          comment: reviewForm.content,
          rating: reviewForm.rating,
        }),
      });

      if (response.ok) {
        setReviewForm({ title: '', content: '', rating: 5 }); // Reset form
        const newReview = await response.json();
        setReviews((prev) => [...prev, newReview]); // Cập nhật danh sách review
        setError(null);
      } else {
        setError('Gửi đánh giá thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      setError('Lỗi khi gửi đánh giá: ' + err.message);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };
  const handleRatingChange = (star) => {
    setReviewForm({ ...reviewForm, rating: star });
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-4xl font-bold text-brown-700 mb-6 text-center">
        Chi tiết sản phẩm
      </h2>
      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-lg shadow-lg bg-no-repeat">
        {product.imageURL && (
          <img
            src={`https://localhost:7278${product.imageURL}`}
            alt={product.name}
            className="w-full md:w-2/5 h-full object-cover rounded-lg shadow-md transition-transform hover:scale-105 object-center"
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
          />
        )}
        <div className="md:w-1/2 space-y-4">
          <h3 className="text-3xl font-semibold text-brown-700">
            {product.name}
          </h3>
          <p className="text-gray-600">{product.summary}</p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xl font-bold text-red-500 mt-2">
              {product.price.toLocaleString("vi-VN")}₫
            </span>
            <span className="text-sm text-gray-500 mt-2 line-through">
              {(product.price + product.price * 0.1).toLocaleString("vi-VN")}₫
            </span>
          </div>
          <p className="text-gray-700">{product.description}</p>
          {product.isFeatured && (
            <span className="inline-block bg-red-200 text-red-800 text-sm px-3 py-1 rounded-full">
              Nổi bật
            </span>
          )}

          {/* Điều chỉnh số lượng */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={decrementQuantity}
              className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-medium">{quantity}</span>
            <button
              onClick={incrementQuantity}
              className="w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              +
            </button>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-4 mt-6">
            <AddToCartButton
              product={product}
              quantity={quantity}
              classCustom="relative px-6 py-3 text-sm text-red-500 overflow-hidden group border-2 border-red-500 rounded-md "
              isIcon={false}
            >
              Thêm vào giỏ hàng
            </AddToCartButton>
            <BuyNowButton
              product={product}
              quantity={quantity}
              classCustom="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
            >
              Mua ngay
            </BuyNowButton>
          </div>
        </div>
      </div>

      {/* Section hiển thị review */}
      <div className="mt-10">
        <h3 className="text-3xl font-bold text-brown-700 mb-6">
          Đánh giá từ người dùng
        </h3>
        {reviews.length > 0 ? (
          <>
            <div className="space-y-6">
              {visibleReviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="border border-gray-200 p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={review.avatarUrl || "/placeholder-avatar.jpg"}
                      alt={`User ${review.userId} avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-avatar.jpg";
                      }}
                    />
                    <div>
                      <p className="font-semibold text-brown-700">
                        User {review.userId}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
              <p className="text-yellow-500">{'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}</p>
                </div>
              ))}
            </div>
            {reviews.length > 4 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                {showAllReviews ? "Ẩn bớt" : "Xem thêm"}
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500">Chưa có đánh giá nào.</p>
        )}
      </div>
      {/* Form nhập đánh giá */}
      <div className="mt-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xl font-bold text-red-500 mb-2 focus:outline-none"
      >
        Viết đánh giá của bạn
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[1000px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'
        }`}
      >
        <div className="mt-2 p-6 bg-gray-50 rounded-lg shadow-inner">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Nội dung</label>
              <textarea
                name="content"
                value={reviewForm.content}
                onChange={handleReviewChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Viết đánh giá của bạn..."
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Đánh giá (sao)</label>
               <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleRatingChange(star)}
          className="focus:outline-none"
        >
          <FaStar
            className={`w-4 h-4 transition-colors duration-300 ${
              star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>

            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
              disabled={!isLoggedIn}
            >
              Gửi đánh giá
            </button>
          </form>
        </div>
      </div>
    </div>

      
      {/* Section sản phẩm liên quan */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sản phẩm liên quan</h2>
        <Products products={relatedProducts} />
      </div>
    </div>
  );
};

export default ProductDetail;
