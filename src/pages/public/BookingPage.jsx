import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Monitor, Check, Heart } from 'lucide-react'; // Thêm icon Heart cho ghế đôi

export default function BookingPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seats, setSeats] = useState([]);

  // 1. THUẬT TOÁN TẠO GHẾ (ĐÃ UPDATE THEO YÊU CẦU MỚI)
  useEffect(() => {
    const generateMockSeats = () => {
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const mockSeats = [];
      let idCounter = 1;

      rows.forEach(row => {
        // Hàng H là ghế đôi nên chỉ có 6 ghế, các hàng khác 12 ghế
        const colCount = row === 'H' ? 6 : 12;

        for (let col = 1; col <= colCount; col++) {
          const isBooked = Math.random() < 0.15; 
          
          let seatType = 'NORMAL';
          let price = 80000;

          if (['E', 'F', 'G'].includes(row)) {
            seatType = 'VIP';
            price = 120000;
          } else if (row === 'H') {
            seatType = 'COUPLE';
            price = 180000;
          }

          mockSeats.push({
            id: idCounter++,
            name: `${row}${col}`,
            row: row,
            col: col,
            type: seatType,
            price: price,
            status: isBooked ? 2 : 1 
          });
        }
      });
      setSeats(mockSeats);
      setTimeout(() => setIsLoading(false), 500);
    };

    generateMockSeats();
  }, [showtimeId]);

  // 2. HÀM XỬ LÝ CLICK CHỌN GHẾ
  const handleSeatClick = (seat) => {
    if (seat.status === 2) return; 

    setSelectedSeats(prev => {
      const isAlreadySelected = prev.find(s => s.id === seat.id);
      if (isAlreadySelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        if (prev.length >= 8) {
          alert('Bạn chỉ được mua tối đa 8 vé trong một lần giao dịch!');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  // 3. TÍNH TỔNG TIỀN
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  // 4. NHÓM GHẾ THEO HÀNG
  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  if (isLoading) {
    return <div className="min-h-screen bg-dark flex items-center justify-center text-primary font-bold animate-pulse">Đang tải phòng chiếu...</div>;
  }

  return (
    <div className="bg-dark min-h-screen text-white pb-20 pt-8">
      <div className="container mx-auto px-4">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={20} className="mr-1" /> Quay lại chọn suất chiếu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: SƠ ĐỒ GHẾ NGỒI */}
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
                {Object.keys(groupedSeats).map(row => (
                  <div key={row} className="flex items-center justify-center gap-4 w-full">
                    <div className="w-6 text-center font-bold text-gray-500">{row}</div>
                    
                    <div className="flex justify-center gap-2 w-full max-w-[550px]">
                      {groupedSeats[row].map(seat => {
                        const isSelected = selectedSeats.some(s => s.id === seat.id);
                        
                        // Cấu hình class dùng chung
                        let btnClass = "h-8 md:h-10 rounded-t-lg rounded-b-sm text-[10px] font-bold transition-all duration-200 flex items-center justify-center ";
                        
                        // Chiều rộng riêng: Ghế đôi rộng gấp đôi ghế thường
                        if (seat.type === 'COUPLE') {
                          btnClass += " w-[72px] md:w-[88px] ";
                        } else {
                          btnClass += " w-8 md:w-10 ";
                        }
                        
                        // Màu sắc theo trạng thái và loại ghế
                        if (seat.status === 2) {
                          btnClass += "bg-gray-800 text-gray-600 cursor-not-allowed";
                        } else if (isSelected) {
                          if (seat.type === 'COUPLE') {
                            btnClass += "bg-pink-600 text-white scale-110 shadow-[0_0_10px_rgba(219,39,119,0.5)]";
                          } else {
                            btnClass += "bg-primary text-white scale-110 shadow-[0_0_10px_rgba(229,9,20,0.5)]";
                          }
                        } else if (seat.type === 'VIP') {
                          btnClass += "bg-transparent border border-accent text-accent hover:bg-accent/20";
                        } else if (seat.type === 'COUPLE') {
                          btnClass += "bg-transparent border border-pink-500 text-pink-500 hover:bg-pink-500/20";
                        } else {
                          btnClass += "bg-transparent border border-gray-600 text-gray-400 hover:border-white hover:text-white";
                        }

                        return (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 2}
                            className={btnClass}
                            title={`Ghế ${seat.name} - ${seat.price.toLocaleString()}đ`}
                          >
                            {isSelected ? <Check size={16} strokeWidth={4} /> : (
                              seat.type === 'COUPLE' ? (
                                <div className="flex items-center gap-1"><Heart size={12} /> {seat.col}</div>
                              ) : seat.col
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="w-6 text-center font-bold text-gray-500">{row}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chú thích màu sắc */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm font-bold text-gray-400 border-t border-gray-800 pt-8">
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t border border-gray-600"></div> Thường (80k)</div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t border border-accent text-accent flex items-center justify-center text-[10px]">VIP</div> VIP (120k)</div>
              <div className="flex items-center gap-2"><div className="w-10 h-5 rounded-t border border-pink-500 text-pink-500 flex items-center justify-center"><Heart size={12}/></div> Đôi (180k)</div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-primary"></div> Đang chọn</div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-t bg-gray-800"></div> Đã bán</div>
            </div>
          </div>

          {/* CỘT PHẢI: BẢNG TÍNH TIỀN (Giữ nguyên) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-800 shadow-2xl sticky top-8">
              <h3 className="text-xl font-bold border-l-4 border-primary pl-3 uppercase tracking-wider mb-6">Thông tin đặt vé</h3>
              
              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-800">
                <p className="flex justify-between"><span className="text-gray-500">Phim:</span> <span className="font-bold text-right text-white">Lật Mặt 7</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Rạp:</span> <span className="font-bold text-right text-white">CGV Hà Nội</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Suất chiếu:</span> <span className="font-bold text-right text-white">10:15 - Hôm nay</span></p>
                
                <div className="flex justify-between items-start pt-2">
                  <span className="text-gray-500">Ghế chọn:</span> 
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[60%]">
                    {selectedSeats.length > 0 ? (
                      selectedSeats.map(s => (
                        <span 
                          key={s.id} 
                          className={`border px-2 py-1 rounded text-xs font-black shadow-sm ${
                            s.type === 'COUPLE' ? 'bg-pink-900/30 text-pink-500 border-pink-500/50' :
                            s.type === 'VIP' ? 'bg-yellow-900/30 text-accent border-accent/50' : 
                            'bg-[#222] text-primary border-primary/30'
                          }`}
                        >
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
                <span className="text-3xl font-black text-accent">
                  {totalPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <button 
  disabled={selectedSeats.length === 0}
  // SỬA CHỖ NÀY: Đổi '/FoodSelectionPage' thành '/food'
  // Đổi '/FoodSelectionPage' thành '/food'
onClick={() => navigate('/food', { state: { selectedSeats: selectedSeats, seatTotal: totalPrice } })}
  className={`w-full py-4 rounded-xl font-black transition-all duration-300 ${
    selectedSeats.length > 0 
    ? 'bg-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:bg-red-700 hover:scale-[1.02]' 
    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
  }`}
>
  TIẾP TỤC THANH TOÁN
</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}