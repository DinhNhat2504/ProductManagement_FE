import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Utility function to fetch data using fetch
const fetchData = async (url, fromDate, toDate) => {
  try {
    const response = await fetch(`${url}?fromDate=${fromDate}&toDate=${toDate}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return {
      details: data.details.map(item => ({
        date: item.date,
        value: item.value || item.revenue, // Normalize 'revenue' to 'value'
        categoryName: item.categoryName || 'Tổng',
      })),
      totalQuantity: data.totalQuantity,
      totalReveneu: data.totalReveneu,
      categoryTotals: data.categoryTotals || [],
    };
  } catch (error) {
    console.error(`Lỗi khi lấy dữ liệu từ ${url}:`, error);
    return { details: [], totalQuantity: 0, totalReveneu: 0, categoryTotals: [] };
  }
};

// Utility to generate random colors for categories
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const StatisticsPage = () => {
  const [fromDate, setFromDate] = useState(new Date('2025-08-29'));
  const [toDate, setToDate] = useState(new Date('2025-09-13'));
  const [userData, setUserData] = useState({ details: [], totalQuantity: 0, totalReveneu: 0, categoryTotals: [] });
  const [productData, setProductData] = useState({ details: [], totalQuantity: 0, totalReveneu: 0, categoryTotals: [] });
  const [orderData, setOrderData] = useState({ details: [], totalQuantity: 0, totalReveneu: 0, categoryTotals: [] });
  const [importData, setImportData] = useState({ details: [], totalQuantity: 0, totalReveneu: 0, categoryTotals: [] });
  const [exportData, setExportData] = useState({ details: [], totalQuantity: 0, totalReveneu: 0, categoryTotals: [] });
  const [revenueData, setRevenueData] = useState({ details: [], totalQuantity: 0, totalReveneu: 0, categoryTotals: [] });

  // Format date to YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      const formattedFrom = formatDate(fromDate);
      const formattedTo = formatDate(toDate);

      setUserData(await fetchData('https://localhost:7278/Statistics/users', formattedFrom, formattedTo));
      setProductData(await fetchData('https://localhost:7278/Statistics/products', formattedFrom, formattedTo));
      setOrderData(await fetchData('https://localhost:7278/Statistics/orders', formattedFrom, formattedTo));
      setImportData(await fetchData('https://localhost:7278/Statistics/import', formattedFrom, formattedTo));
      setExportData(await fetchData('https://localhost:7278/Statistics/export', formattedFrom, formattedTo));
      setRevenueData(await fetchData('https://localhost:7278/Statistics/revenue', formattedFrom, formattedTo));
    };

    loadData();
  }, [fromDate, toDate]);

  // Reusable chart component for LineChart
  const LineStatisticChart = ({ title, data, isRevenue = false }) => {
    const categories = [...new Set(data.details.map(item => item.categoryName))];
    const colors = categories.reduce((acc, category) => ({ ...acc, [category]: getRandomColor() }), {});

    return (
      <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
        <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.details} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {categories.map(category => (
              <Line
                key={category}
                type="monotone"
                dataKey={item => item.categoryName === category ? item.value : null}
                name={category}
                stroke={colors[category]}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          
          {!isRevenue && <p className="text-sm text-gray-600">Tổng số lượng: <span className="font-semibold">{data.totalQuantity}</span></p>}
          {isRevenue && <p className="text-sm text-gray-600">Tổng doanh thu: <span className="font-semibold">{data.totalReveneu.toLocaleString("vi-VN")}₫</span></p>}
        </div>
      </div>
    );
  };

  // Reusable chart component for BarChart (for categoryTotals)
  const BarStatisticChart = ({ title, categoryTotals }) => {
    if (!categoryTotals || categoryTotals.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
        <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">{title} (Theo Danh Mục)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryTotals} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoryName" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalQuantity" fill="#82ca9d" name="Tổng số lượng" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Thống Kê Hệ Thống</h1>
      <div className="flex flex-col sm:flex-row justify-center mb-10 gap-4 sm:gap-6">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-600">Từ ngày:</label>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-300 rounded-md p-2 text-sm w-40 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-600">Đến ngày:</label>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border border-gray-300 rounded-md p-2 text-sm w-40 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        <LineStatisticChart title="Người Dùng" data={userData} />
        <LineStatisticChart title="Đơn Hàng" data={orderData} />
        
        <LineStatisticChart title="Sản Phẩm" data={productData} />
        <BarStatisticChart title="Sản Phẩm" categoryTotals={productData.categoryTotals} />
        <LineStatisticChart title="Nhập Hàng" data={importData} />
        <BarStatisticChart title="Nhập Hàng" categoryTotals={importData.categoryTotals} />
        <LineStatisticChart title="Xuất Hàng" data={exportData} />
        <BarStatisticChart title="Xuất Hàng" categoryTotals={exportData.categoryTotals} />
        <LineStatisticChart title="Doanh Thu" data={revenueData} isRevenue={true} />
      </div>
    </div>
  );
};

export default StatisticsPage;