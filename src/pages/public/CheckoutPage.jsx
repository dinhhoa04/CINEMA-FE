import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, Monitor, Ticket, Popcorn, User, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore'; // Sử dụng store của bạn để lấy user
import { bookingApi } from '../../api/bookingApi';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy user đăng nhập hiện tại từ Zustand
  const { user } = useAuthStore();

  // Nhận toàn bộ dữ liệu từ trang trước truyền sang
  const { 
    selectedSeats = [], 
    seatTotal = 0, 
    cart = {}, 
    foods = [],
    finalTotal = 0,
    showtimeId,      // <--- BỔ SUNG DÒNG NÀY ĐỂ KHÔNG BỊ LỖI UNDEFINED
    showtimeInfo 
  } = location.state || {};

  // Bảo vệ trang: Nếu không có data ghế hoặc phim, đẩy về trang chủ
  useEffect(() => {
    if (selectedSeats.length === 0 || !showtimeInfo) {
      navigate('/'); 
    }
  }, [selectedSeats, showtimeInfo, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault(); 
    if (!user) {
      alert("Vui lòng đăng nhập để thực hiện thanh toán!");
      navigate('/login');
      return;
    }

    try {
      // Bật loading nếu muốn
      const requestData = {
        showtimeId: showtimeId,
        seatIds: selectedSeats.map(seat => seat.id), // Chỉ gửi mảng ID ghế
        cart: cart, 
        finalTotal: finalTotal
      };

      // GỌI API XUỐNG SPRING BOOT
      const response = await bookingApi.createBooking(requestData);
      const bookingCode = response.data; // Mã vé BE trả về

      // CHUYỂN HƯỚNG SANG TRANG SUCCESS
      navigate('/payment-success', { 
        state: { 
          bookingCode: bookingCode,
          movieTitle: showtimeInfo.movieTitle,
          cinemaName: showtimeInfo.cinemaName
        } 
      });

    } catch (error) {
      console.error("Lỗi đặt vé:", error);
      alert("Có lỗi xảy ra trong quá trình thanh toán!");
    }
  };

  // Tránh lỗi render rỗng màn hình khi đang redirect
  if (!showtimeInfo) return null;

  return (
    <div className="bg-dark min-h-screen text-white pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* ĐÃ FIX ICON QUAY LẠI */}
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition-colors mb-8">
          <ChevronLeft className="w-5 h-5 mr-1 flex-shrink-0" /> Quay lại chọn đồ ăn
        </button>

        <h1 className="text-3xl font-black uppercase tracking-wider mb-8 border-l-4 border-primary pl-4">Thanh Toán Giao Dịch</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* BLOCK 1: THÔNG TIN PHIM */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col md:flex-row gap-6">
              <img 
                src={showtimeInfo.posterUrl} 
                alt={showtimeInfo.movieTitle} 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300/1A1A1A/FFFFFF?text=No+Poster' }}
                className="w-full md:w-40 h-60 object-cover rounded-xl shadow-lg border border-gray-700" 
              />
              
              <div className="flex-grow space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{showtimeInfo.movieTitle}</h2>
                  <p className="text-sm text-gray-400 mb-2">Định dạng: {showtimeInfo.format}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div className="flex items-start gap-3">
                    {/* ĐÃ FIX SIZE ICON */}
                    <MapPin className="text-primary mt-1 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Rạp chiếu</p>
                      <p className="font-bold">{showtimeInfo.cinemaName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    {/* ĐÃ FIX SIZE ICON */}
                    <Monitor className="text-primary mt-1 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Phòng chiếu</p>
                      <p className="font-bold">{showtimeInfo.hallName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    {/* ĐÃ FIX SIZE ICON */}
                    <Calendar className="text-primary mt-1 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Ngày chiếu</p>
                      <p className="font-bold">{showtimeInfo.showDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    {/* ĐÃ FIX SIZE ICON */}
                    <Clock className="text-primary mt-1 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400">Thời gian</p>
                      <p className="font-bold">{showtimeInfo.showTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCK 2: GHẾ NGỒI ĐÃ CHỌN */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                {/* ĐÃ FIX SIZE ICON */}
                <Ticket className="text-primary w-5 h-5 flex-shrink-0" /> Ghế Đã Chọn
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(s => (
                  <span key={s.id} className="bg-[#222] border border-primary/50 text-primary px-4 py-2 rounded-lg font-bold shadow-[0_0_10px_rgba(229,9,20,0.2)]">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* BLOCK 3: COMBO ĐỒ ĂN */}
            {Object.keys(cart).length > 0 && (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  {/* ĐÃ FIX SIZE ICON */}
                  <Popcorn className="text-primary w-5 h-5 flex-shrink-0" /> Đồ Ăn & Thức Uống
                </h3>
                <div className="space-y-3">
                  {Object.keys(cart).map(id => {
                    const food = foods.find(f => f.id === parseInt(id));
                    if (!food) return null;
                    return (
                      <div key={id} className="flex justify-between items-center bg-[#222] p-3 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-4">
                          <img src={`/image/combofood/${food.imageUrl}`} alt={food.name} className="w-12 h-12 rounded object-cover" />
                          <div>
                            <p className="font-bold">{food.name}</p>
                            <p className="text-xs text-gray-500">{food.price.toLocaleString('vi-VN')} đ</p>
                          </div>
                        </div>
                        <p className="font-black">x{cart[id]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BLOCK 4: THÔNG TIN KHÁCH HÀNG (TỰ ĐỘNG ĐIỀN TỪ useAuthStore, KHÔNG CHO SỬA) */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                {/* ĐÃ FIX SIZE ICON */}
                <User className="text-primary w-5 h-5 flex-shrink-0" /> Thông Tin Khách Hàng
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Họ và Tên</label>
                  <div className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white font-medium">
                    {user ? user.fullName : "Vui lòng đăng nhập để xem thông tin"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Số điện thoại</label>
                  <div className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white font-medium">
                    {/* Fallback nếu DTO đăng nhập BE chưa trả về sđt */}
                    {user ? (user.phone || "Chưa cập nhật SĐT") : "Vui lòng đăng nhập"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <div className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white font-medium">
                    {user ? (user.email || "Chưa cập nhật Email") : "Vui lòng đăng nhập"}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: TỔNG KẾT & NÚT THANH TOÁN */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-800 shadow-2xl sticky top-8">
              <h3 className="text-xl font-bold border-l-4 border-primary pl-3 uppercase tracking-wider mb-6">Tóm Tắt Đơn Hàng</h3>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-800">
                <div className="flex justify-between text-gray-400">
                  <span>Tiền vé ({selectedSeats.length} ghế)</span>
                  <span className="text-white font-bold">{seatTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tiền F&B</span>
                  <span className="text-white font-bold">{(finalTotal - seatTotal).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Phí giao dịch</span>
                  <span className="text-white font-bold">0 đ</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8 bg-[#222] p-4 rounded-xl border border-gray-800">
                <span className="text-gray-400 font-bold mb-1">Tổng cộng</span>
                <span className="text-3xl font-black text-accent">
                  {finalTotal.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <button 
                onClick={handlePayment}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black transition-all duration-300 bg-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:bg-red-700 hover:scale-[1.02]"
              >
                {/* ĐÃ FIX SIZE ICON */}
                <CreditCard className="w-5 h-5 flex-shrink-0" /> THANH TOÁN NGAY
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}