import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, MapPin, MonitorPlay, Building2 } from 'lucide-react';
import { systemApi } from '../../api/systemApi';
import AdminSeatMapModal from './AdminSeatMapModal';

export default function AdminCinemaPage() {
  // --- TABS ---
  const [activeTab, setActiveTab] = useState('cinemas'); // 'cinemas' hoặc 'halls'

  // --- DATA STATES ---
  const [cinemas, setCinemas] = useState([]);
  const [halls, setHalls] = useState([]);
  const [cities, setCities] = useState([]);
  const [chains, setChains] = useState([]);
  const [hallTypes, setHallTypes] = useState([]);

  // --- MODAL STATES ---
  const [isCinemaModalOpen, setIsCinemaModalOpen] = useState(false);
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // State quản lý việc mở Sơ đồ ghế
  const [selectedHallForSeatMap, setSelectedHallForSeatMap] = useState(null);

  // --- FILTER & PAGINATION STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [cinemaForm, setCinemaForm] = useState({ name: '', slug: '', address: '', phone: '', email: '', logoUrl: '', cityId: '', chainId: '', isActive: true });
  const [hallForm, setHallForm] = useState({ name: '', cinemaId: '', hallTypeId: '', totalRows: '', totalCols: '', isActive: true });

  const fetchData = async () => {
    try {
      const [cinRes, hallRes, cityRes, chainRes, typeRes] = await Promise.all([
        systemApi.getAllCinemas(), systemApi.getAllHalls(),
        systemApi.getCities(), systemApi.getCinemaChains(), systemApi.getHallTypes()
      ]);
      
      const extractData = (res) => Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
      
      setCinemas(extractData(cinRes)); setHalls(extractData(hallRes));
      setCities(extractData(cityRes)); setChains(extractData(chainRes)); setHallTypes(extractData(typeRes));
    } catch (error) {
      console.error("Lỗi tải dữ liệu System:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeTab]); // Reset trang khi đổi tab/tìm kiếm

  // --- LOGIC HIỂN THỊ DỮ LIỆU HIỆN TẠI ---
  const currentDataset = activeTab === 'cinemas' ? cinemas : halls;
  const filteredData = currentDataset.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- SUBMIT CINEMA ---
  const handleCinemaSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await systemApi.updateCinema(editingId, cinemaForm);
      else await systemApi.createCinema(cinemaForm);
      setIsCinemaModalOpen(false); fetchData();
    } catch (err) { alert("Lỗi lưu Rạp!"); }
  };

  // --- SUBMIT HALL ---
  const handleHallSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await systemApi.updateHall(editingId, hallForm);
      else await systemApi.createHall(hallForm);
      setIsHallModalOpen(false); fetchData();
    } catch (err) { alert("Lỗi lưu Phòng chiếu!"); }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Bạn có chắc muốn xóa ${type === 'cinema' ? 'Rạp' : 'Phòng chiếu'} này?`)) {
      try {
        if (type === 'cinema') await systemApi.deleteCinema(id);
        else await systemApi.deleteHall(id);
        fetchData();
      } catch (err) { alert("Lỗi xóa!"); }
    }
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* 1. HEADER & TABS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Hệ thống Rạp</h1>
          <button 
            onClick={() => { setEditingId(null); activeTab === 'cinemas' ? setIsCinemaModalOpen(true) : setIsHallModalOpen(true); }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
          >
            <Plus size={20} /><span>Thêm {activeTab === 'cinemas' ? 'Rạp' : 'Phòng'} Mới</span>
          </button>
        </div>

        <div className="flex gap-4 border-b">
          <button onClick={() => setActiveTab('cinemas')} className={`flex items-center gap-2 pb-3 px-2 font-medium transition-colors ${activeTab === 'cinemas' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-800'}`}>
            <Building2 size={18} /> Danh sách Rạp
          </button>
          <button onClick={() => setActiveTab('halls')} className={`flex items-center gap-2 pb-3 px-2 font-medium transition-colors ${activeTab === 'halls' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-800'}`}>
            <MonitorPlay size={18} /> Danh sách Phòng chiếu
          </button>
        </div>
      </div>

      {/* 2. STATS & SEARCH */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[200px]">
          <span className="text-gray-500 text-sm font-medium">Tổng số {activeTab === 'cinemas' ? 'Rạp' : 'Phòng'}</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{currentDataset.length}</div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[200px]">
          <span className="text-gray-500 text-sm font-medium">Đang hoạt động</span>
          <div className="text-2xl font-bold text-green-600 mt-1">{currentDataset.filter(i => i.isActive).length}</div>
        </div>
        
        <div className="relative flex-[2] min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" placeholder={`Tìm kiếm theo tên ${activeTab === 'cinemas' ? 'rạp' : 'phòng'}...`}
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* 3. BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">{activeTab === 'cinemas' ? 'Tên Rạp' : 'Tên Phòng'}</th>
              <th className="p-4 font-semibold">{activeTab === 'cinemas' ? 'Khu Vực' : 'Thuộc Rạp'}</th>
              <th className="p-4 font-semibold">{activeTab === 'cinemas' ? 'Cụm Rạp' : 'Loại / Ghế'}</th>
              <th className="p-4 font-semibold">Trạng thái</th>
              <th className="p-4 font-semibold text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagedData.length > 0 ? pagedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-500 font-medium">#{item.id}</td>
                <td className="p-4 font-medium text-gray-800">{item.name}</td>
                
                {/* Cột 3: Tùy theo Tab */}
                <td className="p-4">
                  {activeTab === 'cinemas' 
                    ? <span className="flex items-center gap-1 text-sm text-gray-600"><MapPin size={14}/> {item.city?.name}</span>
                    : <span className="text-sm text-gray-800 font-medium">{item.cinema?.name}</span>
                  }
                </td>

                {/* Cột 4: Tùy theo Tab */}
                <td className="p-4">
                  {activeTab === 'cinemas' 
                    ? <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{item.cinemaChain?.name || 'N/A'}</span>
                    : <div className="flex flex-col gap-1">
                        <span className="bg-purple-100 text-purple-700 w-fit px-2 py-1 rounded text-xs">{item.hallType?.name}</span>
                        <span className="text-xs text-gray-500">{item.totalSeats} ghế ({item.totalRows}x{item.totalCols})</span>
                      </div>
                  }
                </td>

                <td className="p-4">
                  {item.isActive ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Hoạt động</span>
                                 : <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-semibold">Đã đóng</span>}
                </td>
                
                {/* Cột Hành Động */}
                <td className="p-4 flex justify-center gap-3">
                  {/* Nút Sơ đồ ghế (Chỉ hiện ở tab Phòng chiếu) */}
                  {activeTab === 'halls' && (
                    <button 
                      onClick={() => setSelectedHallForSeatMap(item)} 
                      className="text-green-600 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 font-medium text-sm flex items-center gap-1"
                      title="Cấu hình sơ đồ ghế"
                    >
                      Sơ đồ
                    </button>
                  )}

                  <button onClick={() => {
                    setEditingId(item.id);
                    if(activeTab === 'cinemas') { setCinemaForm({...item, cityId: item.city?.id, chainId: item.cinemaChain?.id}); setIsCinemaModalOpen(true); }
                    else { setHallForm({...item, cinemaId: item.cinema?.id, hallTypeId: item.hallType?.id}); setIsHallModalOpen(true); }
                  }} className="text-blue-500 bg-blue-50 p-2 rounded-lg hover:text-blue-700"><Edit size={18} /></button>
                  
                  <button onClick={() => handleDelete(item.id, activeTab === 'cinemas' ? 'cinema' : 'hall')} className="text-red-500 bg-red-50 p-2 rounded-lg hover:text-red-700"><Trash2 size={18} /></button>
                </td>
              </tr>
            )) : <tr><td colSpan="6" className="p-8 text-center text-gray-500">Không có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>

      {/* 4. PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg border font-medium ${currentPage === page ? 'bg-red-600 text-white' : 'hover:bg-gray-50'}`}>{page}</button>
          ))}
        </div>
      )}

      {/* MODAL CINEMA */}
      {isCinemaModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingId ? 'Cập nhật Rạp' : 'Thêm Rạp Mới'}</h2>
              <button onClick={() => setIsCinemaModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleCinemaSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Tên Rạp *</label><input required value={cinemaForm.name} onChange={e => setCinemaForm({...cinemaForm, name: e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Slug (URL) *</label><input required value={cinemaForm.slug} onChange={e => setCinemaForm({...cinemaForm, slug: e.target.value})} className="w-full border p-2 rounded" /></div>
                
                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Địa chỉ chi tiết *</label><input required value={cinemaForm.address} onChange={e => setCinemaForm({...cinemaForm, address: e.target.value})} className="w-full border p-2 rounded" /></div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Thành phố *</label>
                  <select required value={cinemaForm.cityId} onChange={e => setCinemaForm({...cinemaForm, cityId: e.target.value})} className="w-full border p-2 rounded bg-white">
                    <option value="">Chọn thành phố</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cụm rạp</label>
                  <select required value={cinemaForm.chainId} onChange={e => setCinemaForm({...cinemaForm, chainId: e.target.value})} className="w-full border p-2 rounded bg-white">
                    <option value="">Chọn cụm rạp</option>
                    {chains.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div><label className="block text-sm font-medium mb-1">Số điện thoại</label><input value={cinemaForm.phone} onChange={e => setCinemaForm({...cinemaForm, phone: e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Link Bản đồ (Map URL)</label><input value={cinemaForm.logoUrl} onChange={e => setCinemaForm({...cinemaForm, logoUrl: e.target.value})} className="w-full border p-2 rounded" /></div>

                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="cinemaActive" checked={cinemaForm.isActive} onChange={e => setCinemaForm({...cinemaForm, isActive: e.target.checked})} className="w-5 h-5 text-red-600 rounded" />
                  <label htmlFor="cinemaActive" className="font-medium">Cho phép hoạt động</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsCinemaModalOpen(false)} className="px-6 py-2 border rounded-lg">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HALL */}
      {isHallModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{editingId ? 'Cập nhật Phòng' : 'Thêm Phòng Mới'}</h2>
              <button onClick={() => setIsHallModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleHallSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Tên Phòng chiếu *</label><input required placeholder="VD: Phòng 1, Phòng IMAX..." value={hallForm.name} onChange={e => setHallForm({...hallForm, name: e.target.value})} className="w-full border p-2 rounded" /></div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Thuộc Rạp *</label>
                <select required value={hallForm.cinemaId} onChange={e => setHallForm({...hallForm, cinemaId: e.target.value})} className="w-full border p-2 rounded bg-white">
                  <option value="">Chọn rạp</option>
                  {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Loại Phòng chiếu *</label>
                <select required value={hallForm.hallTypeId} onChange={e => setHallForm({...hallForm, hallTypeId: e.target.value})} className="w-full border p-2 rounded bg-white">
                  <option value="">Chọn loại phòng</option>
                  {hallTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Số hàng ghế *</label><input type="number" required value={hallForm.totalRows} onChange={e => setHallForm({...hallForm, totalRows: e.target.value})} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Số ghế mỗi hàng *</label><input type="number" required value={hallForm.totalCols} onChange={e => setHallForm({...hallForm, totalCols: e.target.value})} className="w-full border p-2 rounded" /></div>
              </div>
              <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded border">Tổng số ghế dự kiến: <b>{Number(hallForm.totalRows || 0) * Number(hallForm.totalCols || 0)} ghế</b></div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="hallActive" checked={hallForm.isActive} onChange={e => setHallForm({...hallForm, isActive: e.target.checked})} className="w-5 h-5 text-red-600 rounded" />
                <label htmlFor="hallActive" className="font-medium">Cho phép mở bán vé</label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsHallModalOpen(false)} className="px-6 py-2 border rounded-lg">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GỌI MODAL SƠ ĐỒ GHẾ Ở ĐÂY */}
      {selectedHallForSeatMap && (
        <AdminSeatMapModal 
          hall={selectedHallForSeatMap} 
          onClose={() => setSelectedHallForSeatMap(null)} 
        />
      )}
    </div>
  );
}