import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Copy, CheckCircle, Tag, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function PromotionDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { promo } = location.state || {}; // Nhận data từ trang trước truyền sang
  
  const [copied, setCopied] = useState(false);

  // Nếu truy cập thẳng vào link mà ko có data, đẩy về trang danh sách
  if (!promo) {
    navigate('/promotions');
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(promo.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Tắt thông báo sau 2s
  };

  // --- LOGIC THANH SHOPEE PROGRESS BAR ---
  const limit = promo.usageLimit || 0;
  const used = promo.usageCount || 0;
  
  // Tính % đã dùng. Dùng Math.min và Math.max để đảm bảo % luôn nằm trong khoảng 0 -> 100
  let percentage = limit > 0 ? (used / limit) * 100 : 0;
  percentage = Math.min(100, Math.max(0, percentage));
  
  const isSoldOut = used >= limit;

  return (
    <div className="bg-[#111] min-h-screen pt-8 pb-24 text-white">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Nút Back */}
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition-colors mb-6">
          <ChevronLeft className="w-5 h-5 mr-1" /> Quay lại danh sách
        </button>

        <div className="bg-[#1A1A1A] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
    {/* Ảnh Cover Banner */}
    <div className="w-full h-64 md:h-80 bg-gray-800">
        <img 
    src={promo.imageUrl?.startsWith('http') ? promo.imageUrl : `/image/promotions/${promo.imageUrl}`} 
    alt={promo.name} 
    className="w-full h-full object-cover"
    onError={(e) => { e.target.style.display = 'none'; }}
/>
    </div>

          <div className="p-6 md:p-10">
            {/* Header thông tin */}
            <h1 className="text-3xl md:text-4xl font-black mb-4">{promo.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 border-b border-gray-800 pb-6">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary w-4 h-4" />
                Hạn sử dụng: <span className="text-white font-bold">{new Date(promo.startDate).toLocaleDateString('vi-VN')} đến {new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* CỘT TRÁI: KHU VỰC LẤY MÃ (SHOPEE STYLE) */}
              <div className="md:col-span-1">
                <div className="bg-[#222] p-5 rounded-2xl border border-gray-700 sticky top-24">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" /> Mã Khuyến Mãi
                  </h3>
                  
                  {/* Ô chứa mã và nút copy */}
                  <div className="flex bg-dark rounded-xl border border-gray-600 border-dashed overflow-hidden mb-4">
                    <div className="px-4 py-3 font-black text-xl text-center flex-grow tracking-widest text-primary">
                      {promo.code}
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="bg-gray-700 hover:bg-gray-600 px-4 flex items-center justify-center transition-colors"
                    >
                      {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* THANH PROGRESS BAR KIỂU SHOPEE */}
                  {limit > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Đã dùng: <span className="text-white font-bold">{used}/{limit}</span></span>
                        {isSoldOut ? (
                           <span className="text-primary font-bold">Đã hết mã</span>
                        ) : (
                           <span className="text-gray-400">Còn lại <span className="text-green-500 font-bold">{limit - used}</span></span>
                        )}
                      </div>
                      
                      {/* Thanh chứa */}
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden relative">
                        {/* Thanh màu đỏ chạy (Width tính bằng % Toán học ở trên) */}
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isSoldOut ? 'bg-gray-500' : 'bg-gradient-to-r from-red-600 to-primary'}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {isSoldOut && (
                    <div className="mt-4 flex items-center gap-2 text-primary text-sm bg-primary/10 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>Rất tiếc, chương trình đã hết số lượng sử dụng!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CỘT PHẢI: MÔ TẢ CHI TIẾT */}
              <div className="md:col-span-2 text-gray-300 leading-relaxed space-y-4">
                <h3 className="font-bold text-xl text-white mb-2">Chi tiết chương trình</h3>
                
                {/* Nếu trong DB bạn lưu description có xuống dòng (\n) thì dùng cách này để React hiểu */}
                <div className="whitespace-pre-line text-sm md:text-base">
                  {promo.description ? promo.description : "Đang cập nhật chi tiết chương trình khuyến mãi..."}
                </div>

                <div className="mt-8 p-4 bg-[#222] rounded-xl border-l-4 border-yellow-500">
                  <h4 className="font-bold text-white mb-2">Điều kiện áp dụng:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-gray-400">
                    <li>Mỗi khách hàng chỉ được sử dụng {promo.perUserLimit} lần.</li>
                    {promo.minOrderAmount > 0 && <li>Áp dụng cho đơn hàng từ {promo.minOrderAmount.toLocaleString('vi-VN')}đ.</li>}
                    {promo.applicableCinemaIds && <li>Chỉ áp dụng tại một số cụm rạp nhất định.</li>}
                    <li>Không áp dụng đồng thời cùng các chương trình khuyến mãi khác.</li>
                  </ul>
                </div>
                
                <button 
                  onClick={() => navigate('/')}
                  className="mt-8 px-8 py-3 bg-primary hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/30"
                >
                  ĐẶT VÉ NGAY
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}