import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Trash2, Eye, Key, UserPlus, Filter, ShieldAlert, X, Unlock } from 'lucide-react';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';

export default function AdminUserPage() {
  // ==========================================
  // 1. QUẢN LÝ TRẠNG THÁI (STATE)
  // ==========================================
  const [activeTab, setActiveTab] = useState('customers');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Quản lý Đóng/Mở các Modal
  const [modals, setModals] = useState({ add: false, detail: false, role: false, reset: false });
  const [selectedUser, setSelectedUser] = useState(null);


  const [userBookings, setUserBookings] = useState([]);
  // Dữ liệu Form
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({
    fullName: '', email: '', password: '', phone: '', gender: 'MALE', dateOfBirth: '', roleId: ''
  });

  // ==========================================
  // 2. LẤY DỮ LIỆU TỪ BACKEND
  // ==========================================
  // ==========================================
  // 2. LẤY DỮ LIỆU TỪ BACKEND (PHIÊN BẢN SIÊU AN TOÀN)
  // ==========================================
  const fetchData = async () => {
    try {
      const [userRes, roleRes] = await Promise.all([userApi.getAllUsers(), userApi.getRoles()]);
      
      // Hàm nội bộ giúp móc dữ liệu ra bất chấp Backend trả về cấu trúc gì
      const extractData = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res; // Nếu là mảng trực tiếp
        if (res.data && Array.isArray(res.data)) return res.data; // Nếu nằm trong ApiResponse.data
        if (res.data?.data && Array.isArray(res.data.data)) return res.data.data; // Nếu bị bọc 2 lớp
        return [];
      };

      const fetchedUsers = extractData(userRes);
      const fetchedRoles = extractData(roleRes);

      setUsers(fetchedUsers);
      setRoles(fetchedRoles);
      
      console.log("Đã tải xong Users:", fetchedUsers); // In ra console để theo dõi
    } catch (error) {
      toast.error('Lỗi kết nối. Hãy xem tab Console (F12)!');
      console.error("CHI TIẾT LỖI API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ==========================================
  // 3. CÁC HÀM XỬ LÝ SỰ KIỆN (HANDLERS)
  // ==========================================
  const openModal = async (modalName, user = null) => {
    if (user) setSelectedUser(user);
    if (modalName === 'reset') setNewPassword('');
    
    // --- ĐOẠN MỚI THÊM: Nếu mở modal Chi tiết thì gọi API lấy vé ---
    if (modalName === 'detail' && user) {
       try {
          const res = await userApi.getUserBookings(user.id);
          setUserBookings(res.data || []);
       } catch (error) {
          toast.error("Không tải được lịch sử vé!");
          setUserBookings([]);
       }
    }
    // -------------------------------------------------------------

    setModals({ ...modals, [modalName]: true });
  };

  const closeModal = (modalName) => {
    setModals({ ...modals, [modalName]: false });
  };

  const handleToggleLock = async (id, name, status) => {
    const actionName = status ? 'KHÓA' : 'MỞ KHÓA';
    if (window.confirm(`Xác nhận ${actionName} tài khoản ${name}?`)) {
      try {
        const res = await userApi.toggleLockUser(id);
        toast.success(res.message || 'Thành công!');
        fetchData();
      } catch (error) { toast.error('Lỗi thao tác!'); }
    }
  };

  const handleAddUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password || !newUser.roleId) {
      return toast.error("Vui lòng điền đủ Họ tên, Email, Mật khẩu và Vai trò!");
    }
    try {
      await userApi.createUser(newUser);
      toast.success('Thêm mới thành công!');
      closeModal('add');
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || 'Lỗi thêm mới!'); }
  };

  const handleChangeRole = async (roleId) => {
    try {
      await userApi.updateRole(selectedUser.id, roleId);
      toast.success('Cập nhật quyền thành công!');
      closeModal('role');
      fetchData();
    } catch (error) { toast.error('Lỗi cập nhật!'); }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) return toast.error("Mật khẩu phải từ 6 ký tự!");
    try {
      const res = await userApi.resetPassword(selectedUser.id, newPassword);
      toast.success(res.message || 'Cấp lại mật khẩu thành công!');
      closeModal('reset');
    } catch (error) { toast.error(error.response?.data?.message || 'Lỗi!'); }
  };

  // ==========================================
  // 4. LỌC DỮ LIỆU HIỂN THỊ
  // ==========================================
  const customerList = users.filter(u => u.roleName === 'CUSTOMER' || !u.roleName);
  const staffList = users.filter(u => u.roleName === 'STAFF' || u.roleName === 'ADMIN');
  const currentData = (activeTab === 'customers' ? customerList : staffList).filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  // ==========================================
  // 5. GIAO DIỆN CHÍNH (RENDER)
  // ==========================================
  return (
    <div className="space-y-6 relative pb-10">
      
      {/* HEADER VỚI KÍCH THƯỚC LỚN GIÚP DỄ QUAN SÁT VÀ THAO TÁC */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Quản lý Hệ thống</h1>
           <div className="flex gap-6 mt-5 text-lg">
              <button 
                onClick={() => setActiveTab('customers')} 
                className={`pb-2 px-2 transition-all ${activeTab === 'customers' ? 'border-b-4 border-blue-600 text-blue-700 font-black' : 'text-gray-500 font-semibold hover:text-gray-800'}`}
              >
                Khách hàng ({customerList.length})
              </button>
              <button 
                onClick={() => setActiveTab('staffs')} 
                className={`pb-2 px-2 transition-all ${activeTab === 'staffs' ? 'border-b-4 border-blue-600 text-blue-700 font-black' : 'text-gray-500 font-semibold hover:text-gray-800'}`}
              >
                Nhân sự & Quản lý ({staffList.length})
              </button>
           </div>
        </div>
        <button 
          onClick={() => openModal('add')} 
          className="bg-blue-600 text-white px-6 py-3 text-lg font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all"
        >
           <UserPlus size={24} /> Thêm người dùng
        </button>
      </div>

      {/* THANH TÌM KIẾM & BỘ LỌC */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Tìm Tên, SĐT, Email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm uppercase">
              <th className="p-4 w-16">ID</th>
              <th className="p-4">Thông tin cá nhân</th>
              <th className="p-4">Liên hệ</th>
              {activeTab === 'staffs' && <th className="p-4">Chức vụ</th>}
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? <tr><td colSpan="5" className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr> :
              currentData.length > 0 ? currentData.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.isActive ? 'opacity-50 bg-gray-50' : ''}`}>
                  <td className="p-4 text-gray-500 font-medium">#{user.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                      {user.fullName}
                      {!user.isActive && <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase">Đã khóa</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-800">{user.email}</div>
                    <div className="text-xs text-gray-500">{user.phone || 'Chưa có SĐT'}</div>
                  </td>
                  {activeTab === 'staffs' && (
                    <td className="p-4">
                      <span className={`flex items-center gap-1 w-fit px-3 py-1 rounded-full text-xs font-bold ${user.roleName === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.roleName === 'ADMIN' ? <Shield size={14} /> : <ShieldAlert size={14} />}
                        {user.roleName}
                      </span>
                    </td>
                  )}
                  <td className="p-4 flex justify-center gap-2">
                    <butt on title="Xem chi tiết" onClick={() => openModal('detail', user)} className="text-blue-500 bg-blue-50 p-2 rounded hover:text-white hover:bg-blue-500"><Eye size={18} /></butt>
                    {activeTab === 'staffs' && (
                      <button title="Phân quyền" onClick={() => openModal('role', user)} className="text-purple-600 bg-purple-50 p-2 rounded hover:text-white hover:bg-purple-600"><ShieldAlert size={18} /></button>
                    )}
                    <button title="Đổi mật khẩu" onClick={() => openModal('reset', user)} className="text-yellow-600 bg-yellow-50 p-2 rounded hover:text-white hover:bg-yellow-500"><Key size={18} /></button>
                    {user.roleName !== 'ADMIN' && (
                      <button title="Khóa/Mở Khóa" onClick={() => handleToggleLock(user.id, user.fullName, user.isActive)} className={`p-2 rounded hover:text-white transition-colors ${user.isActive ? 'text-red-500 bg-red-50 hover:bg-red-500' : 'text-green-600 bg-green-50 hover:bg-green-600'}`}>
                        {user.isActive ? <Trash2 size={18} /> : <Unlock size={18} />}
                      </button>
                    )}
                  </td>
                </tr>
              )) : <tr><td colSpan="5" className="p-8 text-center text-gray-500">Không có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ============================================================== */}
      {/* KHU VỰC CHỨA CÁC MODAL */}
      {/* ============================================================== */}

      {/* MODAL 1: THÊM NGƯỜI DÙNG */}
      {modals.add && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-blue-600"><UserPlus /> Thêm tài khoản mới</h2>
              <button onClick={() => closeModal('add')} className="text-gray-400 hover:text-red-500"><X/></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-bold text-gray-700">Họ tên *</label><input type="text" onChange={e => setNewUser({...newUser, fullName: e.target.value})} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div><label className="text-sm font-bold text-gray-700">Email *</label><input type="email" onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div><label className="text-sm font-bold text-gray-700">Mật khẩu *</label><input type="password" onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div><label className="text-sm font-bold text-gray-700">Số điện thoại</label><input type="text" onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div><label className="text-sm font-bold text-gray-700">Ngày sinh</label><input type="date" onChange={e => setNewUser({...newUser, dateOfBirth: e.target.value})} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500"/></div>
              <div><label className="text-sm font-bold text-gray-700">Giới tính</label>
                <select onChange={e => setNewUser({...newUser, gender: e.target.value})} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option>
                </select>
              </div>
              <div className="col-span-2"><label className="text-sm font-bold text-gray-700">Cấp quyền (Vai trò) *</label>
                <select onChange={e => setNewUser({...newUser, roleId: e.target.value})} className="w-full border p-2 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name} - {r.description}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => closeModal('add')} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200">Hủy bỏ</button>
              <button onClick={handleAddUser} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow">Tạo tài khoản</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: XEM CHI TIẾT & LỊCH SỬ VÉ */}
      {modals.detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><Eye/> {selectedUser?.fullName}</h2>
                <p className="opacity-80 mt-1">{selectedUser?.email} | {selectedUser?.phone || 'Chưa cập nhật SĐT'}</p>
              </div>
              <button onClick={() => closeModal('detail')} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition"><X/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h3 className="font-bold text-gray-700 mb-4 border-l-4 border-blue-600 pl-2 text-lg">Lịch sử giao dịch (Đang mô phỏng)</h3>
              <table className="w-full text-sm text-left border">
                <thead className="bg-gray-100">
                  <tr><th className="p-3 border-b">Phim</th><th className="p-3 border-b">Rạp</th><th className="p-3 border-b">Ghế</th><th className="p-3 border-b">Ngày mua</th><th className="p-3 border-b text-right">Tổng tiền</th></tr>
                </thead>
                <tbody className="divide-y">
                  {userBookings.length > 0 ? userBookings.map((booking, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-blue-600">{booking.movieName}</td>
                      <td className="p-3">{booking.cinemaName}</td>
                      <td className="p-3 font-medium">{booking.seatNames}</td>
                      <td className="p-3 text-gray-500">{booking.bookingDate}</td>
                      <td className="p-3 text-right font-bold text-red-600">
                        {booking.totalPrice?.toLocaleString()}đ
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500 italic">Khách hàng này chưa có lịch sử mua vé.</td></tr>
                  )}
                </tbody>
              </table>
              <span className="text-2xl font-black text-blue-700">
                    {userBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()} VNĐ
                 </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CẤP QUYỀN (CHỈ DÀNH CHO NHÂN VIÊN) */}
      {modals.role && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-purple-700"><ShieldAlert/> Cấp quyền hệ thống</h2>
              <button onClick={() => closeModal('role')} className="text-gray-400 hover:text-red-500"><X/></button>
            </div>
            <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border">
              Chọn chức năng làm việc mới cho <strong className="text-gray-900">{selectedUser?.fullName}</strong> ({selectedUser?.email}):
            </p>
            <div className="space-y-3">
              {roles.map(r => (
                <button key={r.id} onClick={() => handleChangeRole(r.id)} className={`w-full p-4 border-2 rounded-xl text-left transition-all flex items-center justify-between group ${selectedUser?.roleName === r.name ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'}`}>
                  <div>
                    <p className={`font-bold ${selectedUser?.roleName === r.name ? 'text-purple-700' : 'text-gray-800'}`}>{r.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{r.description || 'Chưa có mô tả chi tiết'}</p>
                  </div>
                  <Shield className={selectedUser?.roleName === r.name ? 'text-purple-600' : 'text-gray-300 group-hover:text-purple-400'} size={24}/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CẤP LẠI MẬT KHẨU */}
      {modals.reset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-yellow-50 p-4 flex justify-between items-center border-b border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800 font-bold"><Key size={20} /> Cấp lại Mật khẩu</div>
              <button onClick={() => closeModal('reset')} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 border border-gray-100">
                Tài khoản: <strong className="text-gray-800">{selectedUser?.email}</strong><br/>
                Chủ sở hữu: <strong className="text-gray-800">{selectedUser?.fullName}</strong>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nhập mật khẩu mới</label>
                <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nhập ít nhất 6 ký tự..." className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500"/>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => closeModal('reset')} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
              <button onClick={handleResetPassword} className="px-6 py-2 bg-yellow-500 text-white font-bold hover:bg-yellow-600 rounded-lg transition-colors shadow">Lưu Mật khẩu</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}