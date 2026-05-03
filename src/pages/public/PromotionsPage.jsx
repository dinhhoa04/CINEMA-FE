import { CalendarDays, Gift, Tag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Tạm thời dùng Mock Data giống hệt ảnh mẫu CGV của bạn để dựng khung giao diện
// Sau này chúng ta sẽ gọi API lấy từ bảng `promotions` trong DB
const mockPromotions = [
  {
    id: 1,
    title: "QUÀ SINH NHẬT THÁNG 5 MIỄN PHÍ",
    date: "01/05/2026 - 31/05/2026",
    imageUrl: "https://homepage.momocdn.net/blogscontents/momo-upload-api-230407141525-638164641257404456.jpg", // Ảnh minh họa
    type: "GIFT", // GIFT hoặc DISCOUNT
  },
  {
    id: 2,
    title: "ĐẠI TIỆC MÙA LỄ - GIẢM NGAY 100.000Đ",
    date: "26/04/2026 - 03/05/2026",
    imageUrl: "https://homepage.momocdn.net/blogscontents/momo-upload-api-220914101435-637987376757657989.jpg",
    type: "DISCOUNT",
  },
  {
    id: 3,
    title: "CINEBOOK MEMBER DAY - X2 ĐIỂM THƯỞNG",
    date: "Thứ 2 cuối cùng mỗi tháng",
    imageUrl: "https://homepage.momocdn.net/blogscontents/momo-upload-api-210609153034-637588686349942721.jpeg",
    type: "GIFT",
  },
  {
    id: 4,
    title: "VÉ XEM PHIM CHỈ TỪ 75.000Đ QUA VNPAY",
    date: "24/04/2026 - 30/06/2026",
    imageUrl: "https://homepage.momocdn.net/blogscontents/momo-upload-api-230822161208-638283079282361136.jpeg",
    type: "DISCOUNT",
  }
];

export default function PromotionsPage() {
  return (
    <div className="bg-dark min-h-screen text-white pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Tiêu đề trang phong cách Banner */}
        <div className="text-center mb-12 relative">
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent -z-10"></div>
          <h1 className="text-4xl font-black uppercase tracking-widest inline-block bg-dark px-6 text-white">
            Tin Mới & <span className="text-primary">Ưu Đãi</span>
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Tổng hợp các chương trình khuyến mãi, ưu đãi độc quyền và tin tức điện ảnh mới nhất chỉ có tại hệ thống CineBook.
          </p>
        </div>

        {/* Nút Lọc (Filter) Đơn giản */}
        <div className="flex justify-center gap-4 mb-10">
          <button className="px-6 py-2 rounded-full font-bold bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]">Tất cả</button>
          <button className="px-6 py-2 rounded-full font-bold bg-[#1A1A1A] text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500 transition-all">Ưu đãi vé</button>
          <button className="px-6 py-2 rounded-full font-bold bg-[#1A1A1A] text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500 transition-all">Quà tặng</button>
        </div>

        {/* Lưới hiển thị Card Khuyến mãi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockPromotions.map((promo) => (
            <Link 
              key={promo.id} 
              to={`/promotions/${promo.id}`} // Link trỏ vào trang chi tiết
              className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-800 hover:border-primary/50 transition-all group flex flex-col h-full hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform hover:-translate-y-1"
            >
              {/* Vùng Ảnh có hiệu ứng zoom */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={promo.imageUrl} 
                  alt={promo.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300/333/FFF?text=CineBook' }}
                />
                <div className="absolute top-3 left-3">
                  {promo.type === 'DISCOUNT' ? (
                    <span className="bg-primary text-white text-[10px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1"><Tag size={12}/> GIẢM GIÁ</span>
                  ) : (
                    <span className="bg-accent text-dark text-[10px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1"><Gift size={12}/> QUÀ TẶNG</span>
                  )}
                </div>
              </div>

              {/* Vùng Nội dung */}
              <div className="p-4 flex flex-col flex-grow justify-between bg-gradient-to-b from-[#1A1A1A] to-[#111]">
                <div>
                  <h3 className="font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{promo.title}</h3>
                </div>
                
                <div className="border-t border-gray-800 pt-3 mt-2 flex justify-between items-center">
                  <div className="flex items-center text-xs text-gray-500 font-medium">
                    <CalendarDays size={14} className="mr-1.5 text-gray-400" />
                    {promo.date}
                  </div>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}