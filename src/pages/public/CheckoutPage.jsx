import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, Monitor, Ticket, Popcorn, User, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    selectedSeats = [], 
    seatTotal = 0, 
    cart = {}, 
    foods = [],
    finalTotal = 0 
  } = location.state || {};

  // Form thông tin người đặt
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    phone: '',
    email: ''
  });

  // TỰ ĐỘNG ĐIỀN THÔNG TIN USER ĐĂNG NHẬP
  useEffect(() => {
    // Trong thực tế, anh sẽ lấy thông tin user từ localStorage hoặc Redux/Context
    // Ví dụ: const storedUser = JSON.parse(localStorage.getItem('user'));
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserInfo({
        fullName: parsedUser.fullName || parsedUser.name || '',
        phone: parsedUser.phone || '',
        email: parsedUser.email || ''
      });
    } else {
      // Mock data điền sẵn để anh test giao diện nếu chưa cấu hình xong biến user
      setUserInfo({
        fullName: 'Cao Đình Hòa',
        phone: '0987654321',
        email: 'dinhhoa04@gmail.com'
      });
    }
  }, []);

  useEffect(() => {
    if (selectedSeats.length === 0) {
      navigate('/'); 
    }
  }, [selectedSeats, navigate]);

  // Dữ liệu Phim - Sửa lại đường dẫn poster gọi từ thư mục public
  const mockMovieData = {
    title: "Lật Mặt 7: Một Điều Ước",
    genre: "Tình cảm, Gia đình",
    format: "2D Tiêu Chuẩn",
    description: "Câu chuyện cảm động về tình mẫu tử và những rạn nứt trong gia đình hiện đại khi người mẹ già yếu cần người chăm sóc...",
    poster: "https://www.themoviedb.org/t/p/w1280/2mg6ktvWxsOG9iMBP4P1pwOYltk.jpg", 
    cinemaName: "CGV Vincom Bà Triệu",
    room: "Phòng 01 IMAX",
    date: "Thứ Sáu, 29/04/2026",
    time: "18:00 - 20:00"
  };

  const handlePayment = (e) => {
    e.preventDefault(); 
    if (!userInfo.fullName || !userInfo.phone || !userInfo.email) {
      alert("Vui lòng nhập đầy đủ thông tin người đặt vé!");
      return;
    }
    alert(`Đang chuyển hướng đến cổng thanh toán VNPAY/MoMo cho số tiền ${finalTotal.toLocaleString('vi-VN')}đ...`);
  };

  return (
    <div className="bg-dark min-h-screen text-white pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={20} className="mr-1" /> Quay lại chọn đồ ăn
        </button>

        <h1 className="text-3xl font-black uppercase tracking-wider mb-8 border-l-4 border-primary pl-4">Thanh Toán Giao Dịch</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* BLOCK 1: THÔNG TIN PHIM & LỊCH CHIẾU */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col md:flex-row gap-6">
              {/* Sửa lại thẻ img để hiển thị Poster chuẩn, kèm fallback nếu lỗi ảnh */}
              <img 
                src={mockMovieData.poster} 
                alt="Poster" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300/1A1A1A/FFFFFF?text=No+Poster' }}
                className="w-full md:w-40 h-60 object-cover rounded-xl shadow-lg border border-gray-700" 
              />
              
              <div className="flex-grow space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{mockMovieData.title}</h2>
                  <p className="text-sm text-gray-400 mb-2">{mockMovieData.genre} • {mockMovieData.format}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{mockMovieData.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-400">Rạp chiếu</p>
                      <p className="font-bold">{mockMovieData.cinemaName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Monitor className="text-primary mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-400">Phòng chiếu</p>
                      <p className="font-bold">{mockMovieData.room}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="text-primary mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-400">Ngày chiếu</p>
                      <p className="font-bold">{mockMovieData.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="text-primary mt-1" size={18} />
                    <div>
                      <p className="text-sm text-gray-400">Thời gian</p>
                      <p className="font-bold">{mockMovieData.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCK 2: GHẾ NGỒI ĐÃ CHỌN */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Ticket className="text-primary" size={20} /> Ghế Đã Chọn
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
            {Object.keys(cart).length > 0 ? (
              <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Popcorn className="text-primary" size={20} /> Đồ Ăn & Thức Uống
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
            ) : (
              <div className="bg-[#1A1A1A]/50 rounded-2xl p-6 border border-gray-800 border-dashed text-center text-gray-500">
                Không có combo đồ ăn nào được chọn.
              </div>
            )}

            {/* BLOCK 4: THÔNG TIN NGƯỜI ĐẶT (Tự động điền) */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="text-primary" size={20} /> Thông Tin Khách Hàng
              </h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Họ và Tên *</label>
                  <input type="text" placeholder="Nhập họ và tên..." required 
                    value={userInfo.fullName}
                    onChange={e => setUserInfo({...userInfo, fullName: e.target.value})}
                    className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Số điện thoại *</label>
                  <input type="tel" placeholder="Nhập số điện thoại..." required 
                    value={userInfo.phone}
                    onChange={e => setUserInfo({...userInfo, phone: e.target.value})}
                    className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email * (Để nhận vé điện tử)</label>
                  <input type="email" placeholder="Nhập địa chỉ email..." required 
                    value={userInfo.email}
                    onChange={e => setUserInfo({...userInfo, email: e.target.value})}
                    className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </form>
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
                <CreditCard size={20} /> THANH TOÁN NGAY
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc bấm Thanh Toán, bạn đồng ý với Điều khoản và Chính sách của hệ thống rạp.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}