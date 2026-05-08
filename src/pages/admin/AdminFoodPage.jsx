import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { foodApi } from '../../api/foodApi';

export default function AdminFoodPage() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- STATE CHO TÌM KIẾM & LỌC ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // --- STATE CHO PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // 15 sản phẩm 1 trang theo yêu cầu

  const [formData, setFormData] = useState({
    name: '', categoryId: '', price: '', description: '', 
    imageUrl: '', sortOrder: 0, isAvailable: true
  });

  const fetchData = async () => {
    try {
      const [foodRes, catRes] = await Promise.all([
        foodApi.getAllFoods(),
        foodApi.getCategories()
      ]);
      
      let foodData = Array.isArray(foodRes) ? foodRes : (foodRes?.data?.data || foodRes?.data || []);
      let catData = Array.isArray(catRes) ? catRes : (catRes?.data?.data || catRes?.data || []);

      setFoods(foodData);
      setCategories(catData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu F&B:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIC QUICK STATS (Thống kê nhanh) ---
  const totalFoods = foods.length;
  const activeFoods = foods.filter(f => f.isAvailable).length;
  const inactiveFoods = totalFoods - activeFoods;

  // --- LOGIC TÌM KIẾM & LỌC ---
  // Reset về trang 1 mỗi khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  const filteredFoods = foods.filter(food => {
    const matchName = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === '' || food.category?.id.toString() === filterCategory;
    const matchStatus = filterStatus === '' || 
                        (filterStatus === 'active' && food.isAvailable) || 
                        (filterStatus === 'inactive' && !food.isAvailable);
    return matchName && matchCategory && matchStatus;
  });

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(filteredFoods.length / itemsPerPage);
  const currentData = filteredFoods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- HÀM XỬ LÝ ẢNH THÔNG MINH ---
  const renderImage = (imgUrl) => {
    if (!imgUrl) return 'https://placehold.co/100x100?text=No+Image'; 
    if (imgUrl.startsWith('http')) return imgUrl; 
    return `/image/combofood/${imgUrl}`; // Đổi 'foods' thành 'combofood'
  };

  // --- CÁC HÀM XỬ LÝ FORM (Giữ nguyên) ---
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: '', categoryId: categories[0]?.id || '', price: '', 
      description: '', imageUrl: '', sortOrder: 0, isAvailable: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (food) => {
    setEditingId(food.id);
    setFormData({
      name: food.name || '', categoryId: food.category?.id || '', price: food.price || '',
      description: food.description || '', imageUrl: food.imageUrl || '',
      sortOrder: food.sortOrder || 0, isAvailable: food.isAvailable
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await foodApi.updateFood(editingId, formData);
      else await foodApi.createFood(formData);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Lỗi! Vui lòng kiểm tra lại thông tin.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa món này?")) {
      try {
        await foodApi.deleteFood(id);
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* 1. HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Đồ Ăn (F&B)</h1>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium">
          <Plus size={20} /><span>Thêm Món Mới</span>
        </button>
      </div>

      {/* 2. QUICK STATS (Thống kê nhanh) */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-gray-500 text-sm font-medium">Tổng số món</span>
          <span className="text-2xl font-bold text-blue-600">{totalFoods}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-gray-500 text-sm font-medium">Đang bán</span>
          <span className="text-2xl font-bold text-green-600">{activeFoods}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <span className="text-gray-500 text-sm font-medium">Hết hàng / Tạm ẩn</span>
          <span className="text-2xl font-bold text-red-600">{inactiveFoods}</span>
        </div>
      </div>

      {/* 3. TOOLBAR ĐIỀU HƯỚNG & TÌM KIẾM */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
        {/* Tìm kiếm */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên món..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
          />
        </div>
        
        {/* Lọc Danh mục */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="text-gray-400" size={18} />
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full border p-2 rounded-lg bg-gray-50 focus:outline-none"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Lọc Trạng thái */}
        <div className="min-w-[180px]">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border p-2 rounded-lg bg-gray-50 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Hết hàng / Đã tắt</option>
          </select>
        </div>
      </div>

      {/* 4. BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Hình ảnh</th>
              <th className="p-4 font-semibold">Tên Món</th>
              <th className="p-4 font-semibold">Danh mục</th>
              <th className="p-4 font-semibold">Giá (VNĐ)</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.length > 0 ? currentData.map((food) => (
              <tr key={food.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-500 font-medium">#{food.id}</td>
                <td className="p-4">
                  <img 
                    src={renderImage(food.imageUrl)} 
                    alt={food.name} 
                    className="w-16 h-16 object-cover rounded-lg border bg-gray-50"
                    onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=L%E1%BB%97i+%E1%BA%A3nh' }}
                  />
                </td>
                <td className="p-4 font-medium text-gray-800">{food.name}</td>
                <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{food.category?.name || 'N/A'}</span></td>
                <td className="p-4 text-red-600 font-semibold">{Number(food.price).toLocaleString()}đ</td>
                <td className="p-4">
                  {food.isAvailable ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">Đang Bán</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200">Hết Hàng</span>
                  )}
                </td>
                <td className="p-4 flex justify-center gap-3">
                  <button onClick={() => handleOpenEdit(food)} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:text-blue-700"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(food.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:text-red-700"><Trash2 size={18} /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">Không tìm thấy món ăn nào phù hợp với bộ lọc.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. PHÂN TRANG (Pagination) */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <span className="text-sm text-gray-600">
            Hiển thị <b>{(currentPage - 1) * itemsPerPage + 1}</b> - <b>{Math.min(currentPage * itemsPerPage, filteredFoods.length)}</b> trong số <b>{filteredFoods.length}</b> món
          </span>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg border font-medium ${currentPage === page ? 'bg-red-600 text-white border-red-600' : 'hover:bg-gray-50'}`}
              >
                {page}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL FORM THÊM/SỬA (Giữ nguyên như cũ) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{editingId ? 'Cập nhật Món Ăn' : 'Thêm Món Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên Món *</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Danh mục</label>
                  <select required name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border p-2 rounded bg-white">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" rows="2" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Giá bán (VNĐ) *</label>
                  <input type="number" required name="price" value={formData.price} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thứ tự hiển thị (Sort Order)</label>
                  <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Link Ảnh Món Ăn (URL)</label>
                  <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full border p-2 rounded" placeholder="https://..." />
                  {formData.imageUrl && (
                    <img 
                      src={renderImage(formData.imageUrl)} 
                      alt="Preview" 
                      className="mt-2 h-20 w-20 object-cover rounded border"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>

                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="isAvailable" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="w-5 h-5 text-red-600 rounded" />
                  <label htmlFor="isAvailable" className="font-medium cursor-pointer">Cho phép bán ngay</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  {editingId ? 'Lưu thay đổi' : 'Tạo món ăn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}