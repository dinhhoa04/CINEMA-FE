import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Ticket } from 'lucide-react';
import { useEffect } from 'react';

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingCode, movieTitle, cinemaName } = location.state || {};

  // Bảo vệ trang: Tránh user gõ url vào thẳng
  useEffect(() => {
    if (!bookingCode) navigate('/');
  }, [bookingCode, navigate]);

  if (!bookingCode) return null;

  return (
    <div className="min-h-[80vh] bg-dark flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] p-8 md:p-12 rounded-2xl border border-gray-800 shadow-2xl text-center max-w-lg w-full animate-zoom-in">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
        
        <h1 className="text-3xl font-black text-white mb-2 uppercase">Thanh toán thành công!</h1>
        <p className="text-gray-400 mb-8">Cảm ơn bạn đã sử dụng dịch vụ của CineBook.</p>

        <div className="bg-[#222] p-6 rounded-xl border border-gray-700 mb-8 text-left">
          <p className="text-sm text-gray-400 mb-1">Mã vé điện tử của bạn:</p>
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="text-primary w-6 h-6 flex-shrink-0" />
            <span className="text-3xl font-black text-accent tracking-wider">{bookingCode}</span>
          </div>
          
          <div className="pt-4 border-t border-gray-700 space-y-2">
            <p className="flex justify-between"><span className="text-gray-500">Phim:</span> <span className="font-bold text-white text-right">{movieTitle}</span></p>
            <p className="flex justify-between"><span className="text-gray-500">Rạp:</span> <span className="font-bold text-white text-right">{cinemaName}</span></p>
          </div>
        </div>

        <Link 
          to="/"
          className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black transition-all bg-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:bg-red-700 hover:scale-[1.02]"
        >
          QUAY VỀ TRANG CHỦ <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}