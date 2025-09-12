import React, { useState, useEffect } from 'react';
import { banners } from '../../../data';


const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Tự động chuyển slide mỗi 3 giây
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(slideInterval);
  }, []);
  
  return (
    <div className="w-full  mx-auto overflow-hidden relative h-[500px]">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-[500px] relative">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 w-full bg-non bg-opacity-50 text-white p-4">
              <h3 className="text-xl font-bold">{banner.title}</h3>
              <p className="text-sm">{banner.description}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Nút điều hướng */}
      <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 transform -translate-y-1/2">
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          className=" text-white p-2 rounded-full hover:bg-gray-600"
        >
          ❮
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          className=" text-white p-2 rounded-full hover:bg-gray-600"
        >
          ❯
        </button>
      </div>
      {/* Điểm điều hướng */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {banners.map((_, index) => (
          <div
            key={index}
            className={`h-3 w-3 rounded-full cursor-pointer ${
              currentSlide === index ? 'bg-white' : 'bg-gray-400'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;