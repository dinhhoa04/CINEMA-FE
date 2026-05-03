import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Ticket, KeyRound, LogOut, Clock, CalendarDays, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../api/userApi';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('history');
  const [bookings, setBookings] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Form Đổi mật khẩu
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const newPassword = watch("newPassword");

  // Form Cập nhật thông tin
  const { 
    register: registerInfo, 
    handleSubmit: handleSubmitInfo, 
    formState: { errors: errorsInfo, isSubmitting: isSubmittingInfo } 
  } = useForm({
    // Đổ dữ liệu mặc định vào ô input
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || ''
    }
  });

  // Thêm hàm update (lấy login từ store ra để cập nhật user)
  const { login } = useAuthStore(); 
  
  const onSubmitInfo = async (data) => {
    try {
      const res = await userApi.updateProfile(data);
      // Gọi hàm login() của Zustand để ghi đè user mới vào Store. 
      // Do BE không trả lại token mới, ta dùng lại token cũ đang lưu trong bộ nhớ.
      login(res.data.data, useAuthStore.getState().accessToken); 
      
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại!");
    }
  };

  // Bảo vệ trang
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Load lịch sử vé
  useEffect(() => {
    if (activeTab === 'history') {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const res = await userApi.getBookingHistory();
          setBookings(res.data?.data || res.data || []);
        } catch (error) {
          console.error("Lỗi tải lịch sử:", error);
          toast.error("Không thể tải lịch sử mua vé");
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [activeTab]);

  // Hàm chia vé sắp xem / đã xem
  const checkIsUpcoming = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return false;
    const [day, month, year] = dateStr.split('/');
    const [hour, minute] = timeStr.split(':');
    const showDateTime = new Date(year, month - 1, day, hour, minute);
    return showDateTime > new Date(); // Nếu giờ chiếu > giờ hiện tại -> Sắp chiếu
  };

  const upcomingBookings = bookings.filter(b => checkIsUpcoming(b.showDate, b.showTime));
  const pastBookings = bookings.filter(b => !checkIsUpcoming(b.showDate, b.showTime));

  const onSubmitPassword = async (data) => {
    try {
      await userApi.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      toast.success("Đổi mật khẩu thành công!");
      reset(); // Xóa trắng form
    } catch (error) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="bg-dark min-h-screen text-white pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <h1 className="text-3xl font-black uppercase tracking-wider mb-8 border-l-4 border-primary pl-4">Hồ sơ cá nhân</h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR TRÁI */}
          <div className="w-full md:w-1/4 space-y-2">
            <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-gray-800 text-center mb-6">
              <div className="w-20 h-20 bg-primary/20 text-primary border-2 border-primary/50 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4">
                {user.fullName?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-xl">{user.fullName}</h3>
              <p className="text-gray-500 text-sm">Thành viên CineBook</p>
            </div>

            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]' : 'bg-[#1A1A1A] text-gray-400 hover:bg-gray-800'}`}
            >
              <Ticket className="w-5 h-5 flex-shrink-0" /> Lịch sử đặt vé
            </button>
            <button 
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'info' ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]' : 'bg-[#1A1A1A] text-gray-400 hover:bg-gray-800'}`}
            >
              <User className="w-5 h-5 flex-shrink-0" /> Thông tin tài khoản
            </button>
            <button 
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'password' ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]' : 'bg-[#1A1A1A] text-gray-400 hover:bg-gray-800'}`}
            >
              <KeyRound className="w-5 h-5 flex-shrink-0" /> Đổi mật khẩu
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-all mt-4 border border-red-900/30"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" /> Đăng xuất
            </button>
          </div>

          {/* CONTENT PHẢI */}
          <div className="w-full md:w-3/4">
            <div className="bg-[#1A1A1A] p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl min-h-[500px]">
              
              {/* TAB 1: THÔNG TIN TÀI KHOẢN */}
              {activeTab === 'info' && (
                <div className="animate-zoom-in">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><User className="text-primary"/> Thông tin của bạn</h2>
                  
                  {/* Chuyển từ div sang form */}
                  <form onSubmit={handleSubmitInfo(onSubmitInfo)} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Họ và tên</label>
                      <input 
                        type="text" 
                        {...registerInfo('fullName', { required: 'Vui lòng nhập họ tên' })}
                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors" 
                      />
                      {errorsInfo.fullName && <p className="text-red-400 text-sm mt-1">{errorsInfo.fullName.message}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Số điện thoại</label>
                      <input 
                        type="text" 
                        {...registerInfo('phone')}
                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email đăng nhập (Không thể thay đổi)</label>
                      {/* Email vẫn để readOnly vì lý do bảo mật */}
                      <input 
                        type="text" 
                        value={user.email || ''} 
                        readOnly 
                        className="w-full bg-[#1A1A1A] border border-gray-800 text-gray-500 rounded-lg p-3 cursor-not-allowed" 
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmittingInfo}
                      className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors mt-4"
                    >
                      {isSubmittingInfo ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: ĐỔI MẬT KHẨU */}
              {activeTab === 'password' && (
                <div className="animate-zoom-in">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><KeyRound className="text-primary"/> Đổi mật khẩu</h2>
                  <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Mật khẩu cũ</label>
                      <input 
                        type="password" 
                        {...register('oldPassword', { required: 'Vui lòng nhập mật khẩu cũ' })}
                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors" 
                        placeholder="••••••••"
                      />
                      {errors.oldPassword && <p className="text-red-400 text-sm mt-1">{errors.oldPassword.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Mật khẩu mới</label>
                      <input 
                        type="password" 
                        {...register('newPassword', { 
                          required: 'Vui lòng nhập mật khẩu mới',
                          minLength: { value: 6, message: 'Mật khẩu ít nhất 6 ký tự' }
                        })}
                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors" 
                        placeholder="••••••••"
                      />
                      {errors.newPassword && <p className="text-red-400 text-sm mt-1">{errors.newPassword.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Xác nhận mật khẩu mới</label>
                      <input 
                        type="password" 
                        {...register('confirmPassword', { 
                          validate: value => value === newPassword || 'Mật khẩu không khớp'
                        })}
                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors" 
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                      {isSubmitting ? 'ĐANG XỬ LÝ...' : 'CẬP NHẬT MẬT KHẨU'}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: LỊCH SỬ ĐẶT VÉ */}
              {activeTab === 'history' && (
                <div className="animate-zoom-in">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Ticket className="text-primary"/> Lịch sử mua vé</h2>
                  
                  {isLoadingHistory ? (
                    <div className="text-center py-10 text-primary animate-pulse">Đang tải lịch sử...</div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">Bạn chưa mua vé nào.</div>
                  ) : (
                    <div className="space-y-8">
                      {/* VÉ SẮP XEM */}
                      {upcomingBookings.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-accent mb-4 border-b border-gray-800 pb-2">Vé sắp xem</h3>
                          <div className="grid grid-cols-1 gap-4">
                            {upcomingBookings.map((b, idx) => <TicketCard key={idx} data={b} isUpcoming={true} />)}
                          </div>
                        </div>
                      )}

                      {/* VÉ ĐÃ XEM CŨ */}
                      {pastBookings.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold text-gray-500 mb-4 border-b border-gray-800 pb-2">Vé đã xem</h3>
                          <div className="grid grid-cols-1 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                            {pastBookings.map((b, idx) => <TicketCard key={idx} data={b} isUpcoming={false} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Component thẻ Vé thu nhỏ
function TicketCard({ data, isUpcoming }) {
  return (
    <div className={`flex flex-col sm:flex-row bg-[#222] rounded-xl overflow-hidden border ${isUpcoming ? 'border-primary/50' : 'border-gray-700'}`}>
      <img src={data.posterUrl} alt="poster" className="w-full sm:w-24 h-36 object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/150x200' }} />
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-lg text-white">{data.movieTitle}</h4>
            <span className="bg-dark border border-gray-600 px-2 py-1 rounded text-xs font-mono">{data.bookingCode}</span>
          </div>
          <p className="text-gray-400 text-sm flex items-center gap-1 mb-1"><MapPin className="w-3 h-3"/> {data.cinemaName} - {data.hallName}</p>
          <p className="text-gray-400 text-sm flex items-center gap-1"><CalendarDays className="w-3 h-3"/> {data.showDate} <Clock className="w-3 h-3 ml-2"/> {data.showTime}</p>
        </div>
        <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-700">
          <div>
            <p className="text-xs text-gray-500">Ghế</p>
            <p className="font-bold text-primary">{data.seatNames || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="font-black text-accent text-lg">{data.totalAmount?.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>
      </div>
    </div>
  );
}