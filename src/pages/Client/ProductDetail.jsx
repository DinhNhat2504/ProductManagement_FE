import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AddToCartButton,BuyNowButton } from "../../components/Client/MainContent/Button";
import { AuthContext } from "../../context/AuthContext";
import { FaStar } from 'react-icons/fa';
import Products from "../../components/Client/MainContent/Products";
import api from "../../utils/api";
import { getImageUrl } from "../../utils/helpers";

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
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productResponse, reviewsResponse, relatedResponse] = await Promise.all([
          api.get(`/Product/${productId}`),
          api.get(`/Product/${productId}/reviews`),
          api.get(`/Product/${productId}/related`)
        ]);

        if (isMounted) {
          setProduct(productResponse.data);
          
          if (Array.isArray(reviewsResponse.data)) {
            setReviews(reviewsResponse.data);
          } else {
            console.warn("Dữ liệu review không phải là mảng");
            setReviews([]);
          }

          if (Array.isArray(relatedResponse.data)) {
            setRelatedProducts(relatedResponse.data);
          } else {
            console.warn("Dữ liệu sản phẩm liên quan không phải là mảng");
            setRelatedProducts([]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Fetch error:", err);
          setError("Lỗi khi lấy dữ liệu: " + (err.response?.data?.message || err.message));
          setLoading(false);
        }
      }
    };
    
    fetchData();
    return () => { isMounted = false; };
  }, [productId]);

  if (loading)
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-500 font-medium">Đang tải sản phẩm...</div>;
  if (error) return <div className="min-h-[50vh] flex items-center justify-center text-red-500 font-medium">{error}</div>;
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
      const response = await api.post(`/api/ProductReview/${productId}/review`, {
        userId,
        productId,
        comment: reviewForm.content,
        rating: reviewForm.rating,
      });

      setReviewForm({ title: '', content: '', rating: 5 }); // Reset form
      const newReview = response.data;
      setReviews((prev) => [...prev, newReview]); // Cập nhật danh sách review
      setError(null);
    } catch (err) {
      setError('Lỗi khi gửi đánh giá: ' + (err.response?.data?.message || err.message));
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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Main Product Wrapper */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            {/* Image Box */}
            <div className="relative bg-gray-50 flex items-center justify-center p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100">
              {product.isFeatured && (
                <span className="absolute top-6 left-6 z-10 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  HOT
                </span>
              )}
              {product.imageURL ? (
                <img
                  src={getImageUrl(product.imageURL)}
                  alt={product.name}
                  className="w-full max-w-md h-auto object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-500"
                  onError={(e) => { e.target.src = "/placeholder-image.jpg"; }}
                />
              ) : (
                <div className="w-full max-w-md aspect-square bg-gray-200 flex items-center justify-center text-gray-400 rounded-2xl">
                  <span>Không có ảnh</span>
                </div>
              )}
            </div>

            {/* Product Info Box */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                {product.name}
              </h2>
              
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-black text-red-500 tracking-tight">
                  {product.price.toLocaleString("vi-VN")}₫
                </span>
                <span className="text-lg text-gray-400 font-medium line-through mb-1">
                  {(product.price + product.price * 0.1).toLocaleString("vi-VN")}₫
                </span>
                <span className="bg-red-50 text-red-600 text-sm font-bold px-2 py-1 rounded-md mb-1.5 ml-2 border border-red-100">
                  -10%
                </span>
              </div>

              <div className="prose prose-sm sm:prose-base text-gray-600 mb-8 max-w-none">
                <p className="font-medium text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">{product.summary}</p>
                <p className="mt-4 leading-relaxed">{product.description}</p>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Số Lượng</label>
                <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-full p-1 shadow-inner">
                  <button
                    onClick={decrementQuantity}
                    className="w-10 h-10 rounded-full text-gray-600 hover:bg-white hover:text-red-500 hover:shadow-sm flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                  </button>
                  <span className="text-lg font-bold w-12 text-center text-gray-800">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="w-10 h-10 rounded-full text-gray-600 hover:bg-white hover:text-red-500 hover:shadow-sm flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                 <BuyNowButton
                  product={product}
                  quantity={quantity}
                  classCustom="flex-1 flex justify-center items-center py-4 px-8 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all text-lg"
                >
                  MUA NGAY
                </BuyNowButton>
                <AddToCartButton
                  product={product}
                  quantity={quantity}
                  classCustom="flex-1 flex justify-center items-center py-4 px-8 bg-white border-2 border-rose-500 text-rose-500 font-bold rounded-xl hover:bg-rose-50 transition-colors text-lg"
                  isIcon={false}
                >
                  THÊM VÀO GIỎ
                </AddToCartButton>
              </div>
            </div>
          </div>
        </div>

      {/* Section hiển thị review */}
      <div className="mt-16 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Đánh giá sản phẩm
          </h3>
          <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm border border-gray-200">
            {reviews.length} đánh giá
          </span>
        </div>

        {reviews.length > 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleReviews.map((review) => (
                <div key={review.reviewId} className="flex gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <img
                    src={review.avatarUrl || "/placeholder-avatar.jpg"}
                    alt={`User ${review.userId} avatar`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                    onError={(e) => { e.target.src = "/placeholder-avatar.jpg"; }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-bold text-gray-900">User {review.userId}</p>
                        <p className="text-xs text-gray-500 font-medium">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div className="flex text-yellow-400 text-sm tracking-tighter shrink-0 pt-0.5">
                        {'★'.repeat(review.rating)}<span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mt-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {reviews.length > 4 && (
              <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="px-8 py-2.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-md"
                >
                  {showAllReviews ? "Thu gọn đánh giá" : `Xem thêm ${reviews.length - 4} đánh giá`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-2">Chưa có đánh giá nào cho sản phẩm này.</p>
            <p className="font-semibold text-gray-800">Hãy là người đầu tiên trải nghiệm!</p>
          </div>
        )}
      </div>
      {/* Form nhập đánh giá */}
      <div className="mt-6 max-w-5xl mx-auto">
        <div className="text-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
            Viết đánh giá của bạn
          </button>
        </div>

        <div className={`transition-all duration-500 ease-in-out overflow-hidden transform origin-top ${isOpen ? 'max-h-[1000px] opacity-100 scale-100 mt-6' : 'max-h-0 opacity-0 scale-95 mt-0'}`}>
          <div className="p-8 bg-white border border-blue-100 rounded-3xl shadow-lg relative">
            {error && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 text-red-600 px-4 py-1 rounded-full text-xs font-bold shadow-sm">{error}</div>}
            
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-center">Đánh giá chung (sao)</label>
                <div className="flex justify-center gap-3 bg-gray-50 w-fit mx-auto p-3 rounded-full border border-gray-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="focus:outline-none transform hover:scale-110 transition-transform"
                    >
                      <FaStar className={`w-8 h-8 transition-colors duration-300 drop-shadow-sm ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-2">Chia sẻ trải nghiệm của bạn</label>
                <textarea
                  name="content"
                  value={reviewForm.content}
                  onChange={handleReviewChange}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none shadow-inner"
                  rows="4"
                  placeholder="Sản phẩm này như thế nào? Cảm nhận của bạn ra sao..."
                  required
                />
              </div>

              <div className="text-center pt-2">
                <button
                  type="submit"
                  className="px-10 py-3.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 hover:shadow-lg transition-all disabled:bg-gray-300 disabled:shadow-none"
                  disabled={!isLoggedIn}
                >
                  {isLoggedIn ? "Gửi Đánh Giá" : "Đăng Nhập Để Gửi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      
      {/* Section sản phẩm liên quan */}
      <div className="mt-20 max-w-7xl mx-auto border-t border-gray-200 pt-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-red-500 rounded-full"></div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Sản phẩm tương tự</h2>
        </div>
        <Products products={relatedProducts} isCarousel={true} grid={true} />
      </div>
      </div>
    </div>
  );
};

export default ProductDetail;

