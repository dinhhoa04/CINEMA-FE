import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Monitor, Check, Heart } from 'lucide-react';
import { showtimeApi } from '../../api/showtimeApi';

export default function BookingPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seats, setSeats] = useState([]);
  const [showtimeInfo, setShowtimeInfo] = useState(null);

  useEffect(() => {
    const fetchRealSeats = async () => {
      try {
        const response = await showtimeApi.getBookingData(showtimeId);
        const data = response.data || response;
        setShowtimeInfo(data);
        setSeats(data.seats || []);
      } catch (error) {
        console.error("Lỗi tải ghế thật:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (showtimeId) fetchRealSeats();
  }, [showtimeId]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelectedSeats(prev => {
      const isAlreadySelected = prev.find(s => s.seatId === seat.seatId);
      if (isAlreadySelected) {
        return prev.filter(s => s.seatId !== seat.seatId);
      } else {
        if (prev.length >= 8) {
          alert('Bạn chỉ được mua tối đa 8 vé trong một lần giao dịch!');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + Number(seat.price || 0), 0);

  const groupedSeats = seats.reduce((acc, seat) => {
    const rowName = seat.rowName;
    if (!acc[rowName]) acc[rowName] = [];
    acc[rowName].push(seat);
    return acc;
  }, {});

  if (isLoading) return <div className="min-h-screen bg-dark flex items-center justify-center text-primary font-bold animate-pulse">Đang tải phòng chiếu...</div>;

  return (
    <div className="bg-dark min-h-screen text-white pb-20 pt-8">
      <div className="container mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition-colors mb-8">
          <ChevronLeft size={20} className="mr-1" /> Quay lại chọn suất chiếu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#1A1A1A] rounded-2xl p-4 md:p-8 border border-gray-800 shadow-2xl overflow-hidden">
            <h2 className="text-2xl font-black mb-8 text-center text-gray-200">CHỌN GHẾ</h2>

            <div className="w-full flex flex-col items-center mb-16 relative">
              <div className="w-4/5 h-2 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_15px_30px_rgba(229,9,20,0.6)]"></div>
              <p className="text-gray-500 text-xs font-bold tracking-[0.4em] mt-6 flex items-center gap-2">
                <Monitor size={14} /> MÀN HÌNH CHÍNH
              </p>
            </div>

            <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
              <div className="min-w-[600px] flex flex-col gap-3 items-center">
                {Object.keys(groupedSeats).sort().map(row => (
                  <div key={row} className="flex items-center justify-center gap-4 w-full">
                    <div className="w-6 text-center font-bold text-gray-500">{row}</div>

                    <div className="flex justify-center gap-2 w-full max-w-[550px]">
                      {groupedSeats[row].map(seat => {
                        
                        // ✅ FIX TẬN GỐC: Bao phủ mọi trường hợp đổi tên biến của Spring Boot
                        // Nếu Backend gửi thiếu, gửi là 'active', hay gửi là 'is_active', ta bắt hết!
                        const isHidden = 
                            seat.isActive === false || 
                            seat.active === false || 
                            seat.is_active === false || 
                            seat.is_active === 0;

                        if (isHidden) {
                          // TRẢ VỀ Ô TÀNG HÌNH (Giữ nguyên cấu trúc Lối đi, tuyệt đối không dùng filter)
                          return <div key={seat.seatId || Math.random()} className={seat.typeId === 3 ? "w-[72px] md:w-[88px]" : "w-8 md:w-10"} />;
                        }

                        // Đoạn dưới này giữ nguyên như cũ...
                        const isSelected = selectedSeats.some(s => s.seatId === seat.seatId);
                        let btnClass = "h-8 md:h-10 rounded-t-lg rounded-b-sm text-[10px] font-bold transition-all duration-200 flex items-center justify-center ";

                        if (seat.typeId === 3) {
                          btnClass += " w-[72px] md:w-[88px] ";
                        } else {
                          btnClass += " w-8 md:w-10 ";
                        }

                        if (seat.status !== 'AVAILABLE') {
                          btnClass += "bg-gray-800 text-gray-600 cursor-not-allowed";
                        } else if (isSelected) {
                          if (seat.typeId === 3) btnClass += "bg-pink-600 text-white scale-110 shadow-[0_0_10px_rgba(219,39,119,0.5)]";
                          else btnClass += "bg-primary text-white scale-110 shadow-[0_0_10px_rgba(229,9,20,0.5)]";
                        } else if (seat.typeId === 2) { 
                          btnClass += "bg-transparent border border-accent text-accent hover:bg-accent/20";
                        } else if (seat.typeId === 3) { 
                          btnClass += "bg-transparent border border-pink-500 text-pink-500 hover:bg-pink-500/20";
                        } else { 
                          btnClass += "bg-transparent border border-gray-600 text-gray-400 hover:border-white hover:text-white";
                        }

                        return (
                          <button
                            key={seat.seatId}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status !== 'AVAILABLE'}
                            className={btnClass}
                            title={`Ghế ${seat.name} - ${seat.price?.toLocaleString()}đ`}
                          >
                            {isSelected ? <Check className="w-4 h-4 flex-shrink-0" strokeWidth={4} /> : seat.colIndex}
                          </button>
                        );
                      })}
                    </div>

                    <div className="w-6 text-center font-bold text-gray-500">{row}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm font-bold text-gray-400 border-t border-gray-800 pt-8">
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t border border-gray-600"></div> Thường</div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t border border-accent text-accent flex items-center justify-center text-[10px]">VIP</div> VIP</div>
              <div className="flex items-center gap-2"><div className="w-10 h-5 rounded-t border border-pink-500 text-pink-500 flex items-center justify-center"><Heart size={12} /></div> Đôi</div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-primary"></div> Đang chọn</div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-gray-800"></div> Đã bán</div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-800 shadow-2xl sticky top-8">
              <h3 className="text-xl font-bold border-l-4 border-primary pl-3 uppercase tracking-wider mb-6">Thông tin đặt vé</h3>

              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-800">
                <p className="flex justify-between"><span className="text-gray-500">Phim:</span> <span className="font-bold text-right text-white">{showtimeInfo?.movieTitle || 'Đang tải...'}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Rạp:</span> <span className="font-bold text-right text-white">{showtimeInfo?.cinemaName} - {showtimeInfo?.hallName}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Suất chiếu:</span> <span className="font-bold text-right text-white">{showtimeInfo?.showTime} - {showtimeInfo?.showDate}</span></p>

                <div className="flex justify-between items-start pt-2">
                  <span className="text-gray-500">Ghế chọn:</span>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[60%]">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map(s => (
                        <span key={s.seatId} className={`border px-2 py-1 rounded text-xs font-black shadow-sm ${s.typeId === 3 ? 'bg-pink-900/30 text-pink-500 border-pink-500/50' : s.typeId === 2 ? 'bg-yellow-900/30 text-accent border-accent/50' : 'bg-[#222] text-primary border-primary/30'}`}>
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span className="font-bold text-gray-600">Chưa chọn</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8 bg-[#222] p-4 rounded-xl border border-gray-800">
                <span className="text-gray-400 font-bold mb-1">Tổng tiền</span>
                <span className="text-3xl font-black text-accent">{totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>

              <button
                disabled={selectedSeats.length === 0}
                onClick={() => navigate('/food', { state: { selectedSeats, seatTotal: totalPrice, showtimeId, showtimeInfo } })}
                className={`w-full py-4 rounded-xl font-black transition-all duration-300 ${selectedSeats.length > 0 ? 'bg-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:bg-red-700 hover:scale-[1.02]' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
              >
                TIẾP TỤC CHỌN ĐỒ ĂN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}