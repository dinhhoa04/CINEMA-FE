import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Minus, Popcorn, Loader } from 'lucide-react';
import { foodApi } from '../../api/foodApi'; // Sửa lại đường dẫn import tương đối cho chuẩn

export default function FoodSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedSeats = [], seatTotal = 0, showtimeId, showtimeInfo } = location.state || {};

  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await foodApi.getAllActiveFoods();
        let foodList = response.data !== undefined ? response.data : response;
        if (foodList && !Array.isArray(foodList) && Array.isArray(foodList.data)) {
          foodList = foodList.data;
        }
        setFoods(Array.isArray(foodList) ? foodList : []);
      } catch (error) {
        console.error("Lỗi lấy danh sách đồ ăn:", error);
        setFoods([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const safeFoods = Array.isArray(foods) ? foods : [];
  const totalPages = Math.ceil(safeFoods.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFoods = safeFoods.slice(indexOfFirstItem, indexOfLastItem);

  const handleUpdateCart = (id, delta) => {
    setCart(prev => {
      const currentQty = prev[id] || 0;
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[id];
        return newCart;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const foodTotal = Object.keys(cart).reduce((sum, id) => {
    const food = safeFoods.find(f => f.id === parseInt(id));
    return sum + (food ? food.price * cart[id] : 0);
  }, 0);

  const finalTotal = seatTotal + foodTotal;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-primary gap-2">
        <Loader className="animate-spin" /> Đang tải danh sách đồ ăn...
      </div>
    );
  }

  return (
    <div className="bg-dark min-h-screen text-white pb-20 pt-8">
      <div className="container mx-auto px-4">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft size={20} className="mr-1" /> Quay lại chọn ghế
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-800 shadow-2xl flex flex-col h-full">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 uppercase tracking-wider">
              <Popcorn className="text-primary" /> CHỌN ĐỒ ĂN THỨC UỐNG
            </h2>

            {safeFoods.length === 0 ? (
              <div className="flex-grow flex items-center justify-center text-gray-500 font-bold">
                Hiện tại rạp chưa có sản phẩm F&B nào.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                  {currentFoods.map(food => {
                    const qty = cart[food.id] || 0;
                    return (
                      <div key={food.id} className="bg-[#222] border border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:border-gray-500 transition-all">
                        <img
                          src={food.imageUrl?.startsWith('http') ? food.imageUrl : `/image/combofood/${food.imageUrl}`}
                          alt={food.name}
                          onError={(e) => { e.target.src = 'https://placehold.co/150x150/333/FFF?text=No+Image' }}
                          className="w-20 h-20 rounded-lg object-cover bg-black"
                        />
                        <div className="flex-grow">
                          <h4 className="font-bold text-white text-sm mb-1">{food.name}</h4>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{food.description}</p>
                          <p className="font-black text-accent">{food.price.toLocaleString('vi-VN')} đ</p>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          {qty > 0 ? (
                            <div className="flex items-center bg-dark rounded-full border border-primary/50 overflow-hidden h-8">
                              <button
                                onClick={() => handleUpdateCart(food.id, -1)}
                                className="w-8 h-full flex items-center justify-center hover:bg-primary hover:text-white text-gray-400 transition-colors"
                              >
                                <Minus className="w-4 h-4 flex-shrink-0" />
                              </button>

                              <span className="w-6 text-center text-sm font-bold">{qty}</span>

                              <button
                                onClick={() => handleUpdateCart(food.id, 1)}
                                className="w-8 h-full flex items-center justify-center hover:bg-primary hover:text-white text-gray-400 transition-colors"
                              >
                                <Plus className="w-4 h-4 flex-shrink-0" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUpdateCart(food.id, 1)}
                              className="bg-primary/10 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-all"
                            >
                              THÊM
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-gray-800 flex justify-center items-center gap-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-dark border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
                    >
                      <ChevronLeft size="{20}" />
                    </button>
                    <span className="font-bold text-gray-400">
                      Trang <span className="text-white">{currentPage}</span> / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-dark border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
                    >
                      <ChevronRight size="{20}" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-gray-800 shadow-2xl sticky top-8">
              <h3 className="text-xl font-bold border-l-4 border-primary pl-3 uppercase tracking-wider mb-6">Thông tin đặt vé</h3>

              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-gray-800">
                <p className="flex justify-between"><span className="text-gray-500">Phim:</span> <span className="font-bold text-right text-white">{showtimeInfo?.movieTitle}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Rạp:</span> <span className="font-bold text-right text-white">{showtimeInfo?.cinemaName} - {showtimeInfo?.hallName}</span></p>
                <p className="flex justify-between"><span className="text-gray-500">Suất chiếu:</span> <span className="font-bold text-right text-white">{showtimeInfo?.showTime} - {showtimeInfo?.showDate}</span></p>

                <div className="flex justify-between items-start pt-2">
                  <span className="text-gray-500">Ghế chọn:</span>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[60%]">
                    {selectedSeats.map(s => (
                      <span key={s.id} className="bg-[#222] text-primary border border-primary/30 px-2 py-1 rounded text-xs font-black shadow-sm">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                {Object.keys(cart).length > 0 && (
                  <div className="flex justify-between items-start pt-2 border-t border-gray-800 mt-2">
                    <span className="text-gray-500">Combo:</span>
                    <div className="flex flex-col items-end gap-1 max-w-[60%]">
                      {Object.keys(cart).map(id => {
                        const food = safeFoods.find(f => f.id === parseInt(id));
                        if (!food) return null;
                        return (
                          <span key={id} className="text-right font-bold text-xs text-white">
                            {cart[id]}x {food.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-8 bg-[#222] p-4 rounded-xl border border-gray-800">
                <span className="text-gray-400 font-bold mb-1">Tổng tiền</span>
                <span className="text-3xl font-black text-accent">
                  {finalTotal.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout', {
                  state: { selectedSeats, seatTotal, cart, foods: safeFoods, finalTotal, showtimeId, showtimeInfo }
                })}
                className="w-full py-4 rounded-xl font-black transition-all duration-300 bg-primary text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:bg-red-700 hover:scale-[1.02]"
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