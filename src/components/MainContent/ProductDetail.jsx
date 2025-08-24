import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await fetch(`https://localhost:7278/Product/${productId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!productResponse.ok) throw new Error(`HTTP error product! Status: ${productResponse.status}`);
        const productData = await productResponse.json();
        console.log('Product detail data:', productData);
        setProduct(productData);

        const reviewsResponse = await fetch(`https://localhost:7278/Product/${productId}/reviews`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!reviewsResponse.ok) throw new Error(`HTTP error reviews! Status: ${reviewsResponse.status}`);
        const reviewsData = await reviewsResponse.json();
        console.log('Reviews data:', reviewsData);
        if (Array.isArray(reviewsData)) setReviews(reviewsData);
        else throw new Error('Dữ liệu review không phải là mảng');
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Lỗi khi lấy dữ liệu: ' + err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  if (loading) return <div className="text-center text-gray-500">Đang tải...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!product) return <div className="text-center text-gray-500">Không tìm thấy sản phẩm.</div>;

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 4);

  const handleAddToCart = () => {
    console.log(`Thêm ${quantity} sản phẩm vào giỏ hàng: ${product.name}`);
    // Logic thêm vào giỏ hàng (có thể tích hợp Redux hoặc context)
  };

  const handleBuyNow = () => {
    console.log(`Mua ngay ${quantity} sản phẩm: ${product.name}`);
    // Logic mua ngay (chuyển hướng checkout)
  };

  const incrementQuantity = () => setQuantity(quantity + 1);
  const decrementQuantity = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-4xl font-bold text-brown-700 mb-6 text-center">Chi tiết sản phẩm</h2>
      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-lg shadow-lg">
        {product.imageURL && (
          <img
            src={`https://localhost:7278${product.imageURL}`}
            alt={product.name}
            className="w-full md:w-1/2 h-96 object-cover rounded-lg shadow-md transition-transform hover:scale-105"
            onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
          />
        )}
        <div className="md:w-1/2 space-y-4">
          <h3 className="text-3xl font-semibold text-brown-700">{product.name}</h3>
          <p className="text-gray-600">{product.summary}</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {product.price.toLocaleString('vi-VN')} VND
          </p>
          <p className="text-gray-700">{product.description}</p>
          {product.isFeatured && (
            <span className="inline-block bg-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full">
              Nổi bật
            </span>
          )}

          {/* Điều chỉnh số lượng */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={decrementQuantity}
              className="w-10 h-10 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-medium">{quantity}</span>
            <button
              onClick={incrementQuantity}
              className="w-10 h-10 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
            >
              +
            </button>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-md hover:shadow-lg"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={handleBuyNow}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-md hover:shadow-lg"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Section hiển thị review */}
      <div className="mt-10">
        <h3 className="text-3xl font-bold text-brown-700 mb-6">Đánh giá từ người dùng</h3>
        {reviews.length > 0 ? (
          <>
            <div className="space-y-6">
              {visibleReviews.map((review) => (
                <div key={review.reviewId} className="border border-gray-200 p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <img
                      src={review.avatarUrl || '/placeholder-avatar.jpg'}
                      alt={`User ${review.userId} avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder-avatar.jpg'; }}
                    />
                    <div>
                      <p className="font-semibold text-brown-700">User {review.userId}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-3">{review.comment}</p>
                  <p className="text-amber-500 mt-1">Đánh giá: {review.rating} / 5</p>
                </div>
              ))}
            </div>
            {reviews.length > 4 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="mt-6 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all"
              >
                {showAllReviews ? 'Ẩn bớt' : 'Xem thêm'}
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500">Chưa có đánh giá nào.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;