import React, { useState, useEffect, useRef } from "react";
import { FiX, FiSearch } from "react-icons/fi";

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState(""); // Từ khóa tìm kiếm
  const [results, setResults] = useState([]); // Kết quả sản phẩm từ API
  const [showDropdown, setShowDropdown] = useState(false); // Trạng thái hiển thị dropdown
  const inputRef = useRef(null); // Ref để giữ focus trên input
  const debounceTimeout = useRef(null); // Để debounce API call
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Hàm gọi API với fetch và async/await
  const fetchResults = async (searchQuery) => {
    if (searchQuery.trim() === "") {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7278/Product/search?query=${encodeURIComponent(
          searchQuery
        )}`
      );
      if (!response.ok) {
        throw new Error("Lỗi khi gọi API");
      }
      const data = await response.json();
      setResults(data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Lỗi khi gọi API tìm kiếm:", error);
      setResults([]);
      setShowDropdown(false);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce: Hủy timeout cũ và tạo mới
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchResults(value);
    }, 300); // Chờ 300ms
  };

  // Giữ focus trên input khi dropdown hiển thị
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [showDropdown]);

  // Ẩn dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="text-gray-500 hover:text-red-400 focus:outline-none"
      >
        <FiSearch size={24} />
      </button>
      {isSearchOpen && (
        <div className="fixed top-0 left-0 w-full z-20">
          <div className="w-full bg-white shadow-lg z-20">
            <div className="max-w-7xl mx-auto p-4">
              {/* Thanh tìm kiếm và nút đóng */}
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full p-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                <button
                  onClick={()=>setIsSearchOpen(false)}
                  className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {/* Dropdown kết quả */}
              {showDropdown && (
                <div className="w-full max-h-[33vh] bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto mt-2 transform transition-all duration-300 ease-in-out translate-y-0 opacity-100">
                  {results.length > 0 ? (
                    results.map((product) => (
                      <div
                        key={product.productId}
                        className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition duration-150"
                        onClick={() => {
                          console.log(
                            "Chuyển đến sản phẩm:",
                            product.productId
                          );
                          setShowDropdown(false);
                          onClose(); // Đóng SearchBar khi click sản phẩm
                        }}
                      >
                        <img
                          src={`https://localhost:7278${product.imageURL}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded mr-3"
                        />
                        <div>
                          <h4 className="text-sm font-medium text-gray-800">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Giá: {product.price} VND
                          </p>
                          <p className="text-xs text-gray-500">
                            Danh mục: {product.categoryName}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-gray-500">
                      Không tìm thấy sản phẩm
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
