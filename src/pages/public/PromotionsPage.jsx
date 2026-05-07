import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; // Hoặc react-router-dom tùy bạn dùng
import { Calendar, Ticket } from 'lucide-react';
import { promotionApi } from '../../api/promotionApi'; // Nhớ check đường dẫn

export default function PromotionsPage() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, TICKET, GIFT

  useEffect(() => {
    // Gọi API lấy data từ Database
    const fetchPromotions = async () => {
      try {
        const response = await promotionApi.getActivePromotions();
        setPromotions(response.data || response); // Tùy cấu trúc trả về của axios
      } catch (error) {
        console.error("Lỗi lấy danh sách khuyến mãi", error);
      }
    };
    fetchPromotions();
  }, []);

  // Chức năng lọc: Tạm thời tôi dùng discountType (FIXED = Quà tặng/Giảm thẳng, PERCENT = Ưu đãi vé).
  // Sau này Database bạn có cột Category thì thay vào nhé.
  const filteredPromotions = promotions.filter(promo => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TICKET') return promo.discountType === 'PERCENT';
    if (activeFilter === 'GIFT') return promo.discountType === 'FIXED';
    return true;
  });

  console.log("Danh sách Khuyến Mãi từ Backend:", promotions);
  return (
    <div className="bg-[#111] min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-4">
            Tin Mới & <span className="text-primary">Ưu Đãi</span>
          </h1>
          <p className="text-gray-400">Tổng hợp các chương trình khuyến mãi, ưu đãi độc quyền chỉ có tại CineBook.</p>
        </div>

        {/* Nút Lọc */}
        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => setActiveFilter('ALL')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeFilter === 'ALL' ? 'bg-primary text-white' : 'bg-[#222] text-gray-400 hover:bg-[#333]'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setActiveFilter('TICKET')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeFilter === 'TICKET' ? 'bg-primary text-white' : 'bg-[#222] text-gray-400 hover:bg-[#333]'}`}
          >
            Ưu đãi vé
          </button>
          <button 
            onClick={() => setActiveFilter('GIFT')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeFilter === 'GIFT' ? 'bg-primary text-white' : 'bg-[#222] text-gray-400 hover:bg-[#333]'}`}
          >
            Quà tặng
          </button>
        </div>

        {/* Danh sách thẻ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromotions.map((promo) => (
            <div 
              key={promo.id} 
              onClick={() => navigate(`/promotions/${promo.id}`, { state: { promo } })} // Truyền data sang trang chi tiết
              className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-gray-800 hover:border-primary/50 cursor-pointer group transition-all"
            >
              <div className="relative h-48 overflow-hidden bg-gray-800">
    {/* HIỂN THỊ ẢNH Ở ĐÂY: Dùng đường dẫn public kèm chống lỗi vỡ ảnh */}
    <img 
    src={promo.imageUrl?.startsWith('http') ? promo.imageUrl : `/image/promotions/${promo.imageUrl}`} 
    alt={promo.name} 
    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
    // Bổ sung thêm tính năng chống lỗi: Nếu link hỏng, tự động ẩn đi hoặc đổi ảnh mặc định
    onError={(e) => { e.target.style.display = 'none'; }} 
/>
    <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded">
        {promo.discountType === 'FIXED' ? 'GIẢM GIÁ' : 'ƯU ĐÃI VÉ'}
    </div>
</div>
              
              <div className="p-5">
                <h3 className="text-white font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {promo.name}
                </h3>
                <div className="flex items-center text-gray-500 text-sm gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}