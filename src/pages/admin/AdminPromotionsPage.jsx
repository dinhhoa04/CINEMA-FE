import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { promotionApi } from '../../api/promotionApi';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form Data khớp với PromotionRequest.java
  const [formData, setFormData] = useState({
    code: '', name: '', description: '', imageUrl: '', discountType: 'PERCENT', discountValue: '',
    minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', perUserLimit: 1,
    startDate: '', endDate: '', isActive: true
  });

  const fetchPromotions = async () => {
    try {
      const response = await promotionApi.getAllPromotions();
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (response && response.data) data = Array.isArray(response.data) ? response.data : response.data.data;
      
      const sortedData = data.sort((a, b) => a.id - b.id);
      setPromotions(sortedData);
    } catch (error) {
      console.error("Lỗi:", error);
      setPromotions([]);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Mở modal Thêm Mới
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      code: '', name: '', description: '', discountType: 'PERCENT', discountValue: '',
      minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', perUserLimit: 1,
      startDate: '', endDate: '', isActive: true
    });
    setIsModalOpen(true);
  };

  // Mở modal Cập Nhật
  const handleOpenEdit = (promo) => {
    setEditingId(promo.id);
    setFormData({
      code: promo.code || '', name: promo.name || '', description: promo.description || '',imageUrl: promo.imageUrl || '',
      discountType: promo.discountType || 'PERCENT', discountValue: promo.discountValue || '',
      minOrderAmount: promo.minOrderAmount || '', maxDiscountAmount: promo.maxDiscountAmount || '',
      usageLimit: promo.usageLimit || '', perUserLimit: promo.perUserLimit || 1,
      startDate: promo.startDate ? promo.startDate.slice(0, 16) : '', 
      endDate: promo.endDate ? promo.endDate.slice(0, 16) : '',
      isActive: promo.isActive
    });
    setIsModalOpen(true);
  };

  // Lưu dữ liệu (Thêm hoặc Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await promotionApi.updatePromotion(editingId, formData);
        alert("Cập nhật thành công!");
      } else {
        await promotionApi.createPromotion(formData);
        alert("Thêm mới thành công!");
      }
      setIsModalOpen(false);
      fetchPromotions(); // Tải lại bảng
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!");
      console.error(error);
    }
  };

  // Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      try {
        await promotionApi.deletePromotion(id);
        alert("Đã xóa thành công!");
        fetchPromotions();
      } catch (error) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Khuyến mãi</h1>
        </div>
        <button onClick={handleOpenCreate} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
          <Plus size={20} /><span>Thêm Khuyến Mãi</span>
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Tên Chương Trình</th>
              <th className="p-4 font-semibold">Mã Code</th>
              <th className="p-4 font-semibold">Mức Giảm</th>
              <th className="p-4 font-semibold">Trạng Thái</th>
              <th className="p-4 font-semibold text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {promotions?.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-600">#{promo.id}</td>
                <td className="p-4 font-medium text-gray-800">{promo.name}</td>
                <td className="p-4"><span className="bg-gray-100 text-gray-800 px-2 py-1 rounded border font-mono text-sm">{promo.code}</span></td>
                <td className="p-4 text-gray-600 text-sm truncate max-w-[200px]" title={promo.description}>{promo.description}</td>
                <td className="p-4">
                  {promo.isActive ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">Đang chạy</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200">Đã tắt</span>
                  )}
                </td>
                <td className="p-4 flex justify-center gap-3">
                  <button onClick={() => handleOpenEdit(promo)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(promo.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingId ? 'Cập nhật Khuyến mãi' : 'Thêm mới Khuyến mãi'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mã Code *</label>
                  <input required name="code" value={formData.code} onChange={handleChange} className="w-full border p-2 rounded focus:ring-red-500" placeholder="VD: SUMMER25" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tên chương trình</label>
                  <input required name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <input name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Link Ảnh Khuyến Mãi (URL) *</label>
                  <input required name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full border p-2 rounded focus:ring-red-500" placeholder="VD: https://image.tmdb.org/.../uudai.jpg" />
                  {/* (Tùy chọn) Hiển thị ảnh xem trước nếu đã có link */}
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" className="mt-2 h-20 object-contain border rounded" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Loại giảm giá</label>
                  <select name="discountType" value={formData.discountType} onChange={handleChange} className="w-full border p-2 rounded">
                    <option value="PERCENT">Giảm theo %</option>
                    <option value="FIXED">Giảm tiền mặt (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mức giảm</label>
                  <input type="number" required name="discountValue" value={formData.discountValue} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Đơn tối thiểu (VNĐ)</label>
                  <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giảm tối đa (VNĐ)</label>
                  <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                  <input type="datetime-local" required name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                  <input type="datetime-local" required name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Số lượng mã tối đa</label>
                  <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giới hạn mỗi User</label>
                  <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>

                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 text-red-600 rounded" />
                  <label htmlFor="isActive" className="font-medium cursor-pointer">Cho phép hoạt động ngay lập tức</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  {editingId ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}