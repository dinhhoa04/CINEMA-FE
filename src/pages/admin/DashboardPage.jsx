import React from 'react';

const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan Hệ thống</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-600">Chào mừng bạn đến với trang quản trị CineBook.</p>
        <p className="text-gray-600 mt-2">Vui lòng chọn các chức năng bên menu trái để bắt đầu quản lý.</p>
      </div>
    </div>
  );
};

export default DashboardPage;