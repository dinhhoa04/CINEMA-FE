import { useState, useEffect } from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { systemApi } from '../../api/systemApi';
import { useNavigate } from 'react-router-dom';

export default function CinemaPage() {
    const navigate = useNavigate();
  const [chains, setChains] = useState([]);
  const [activeChain, setActiveChain] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh sách Hệ thống rạp (Bên trái)
  useEffect(() => {
    const fetchChains = async () => {
      try {
        const res = await systemApi.getCinemaChains();
        const chainData = res.data?.data || res.data || [];
        setChains(chainData);
        if (chainData.length > 0) {
          setActiveChain(chainData[0]); // Mặc định chọn rạp đầu tiên
        }
      } catch (error) {
        console.error("Lỗi lấy cụm rạp:", error);
      }
    };
    fetchChains();
  }, []);

  // Lấy danh sách Rạp chi tiết khi đổi Hệ thống (Bên phải)
  useEffect(() => {
    if (activeChain) {
      const fetchCinemas = async () => {
        setIsLoading(true);
        try {
          const res = await systemApi.getCinemasByChain(activeChain.id);
          setCinemas(res.data?.data || res.data || []);
        } catch (error) {
          console.error("Lỗi lấy danh sách rạp chi tiết:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCinemas();
    }
  }, [activeChain]);

  return (
    <div className="bg-dark min-h-screen text-white pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent -z-10"></div>
          <h1 className="text-4xl font-black uppercase tracking-widest inline-block bg-dark px-6 text-white">
            Hệ Thống <span className="text-primary">Rạp Chiếu</span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR TRÁI: Dành sách Hệ thống Rạp */}
          <div className="w-full md:w-1/4">
            <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 overflow-hidden shadow-xl sticky top-24">
              <div className="p-4 bg-[#222] border-b border-gray-800">
                <h3 className="font-bold text-lg text-gray-300 uppercase tracking-wider text-center">Chọn Hệ Thống</h3>
              </div>
              <div className="flex flex-col">
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => setActiveChain(chain)}
                    className={`p-4 font-black transition-all text-left border-b border-gray-800/50 last:border-0 hover:bg-gray-800/50 flex justify-between items-center ${
                      activeChain?.id === chain.id 
                      ? 'bg-primary/10 text-primary border-l-4 border-l-primary' 
                      : 'text-gray-400 border-l-4 border-l-transparent'
                    }`}
                  >
                    {chain.name}
                    {activeChain?.id === chain.id && <ChevronRight size={18} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* NỘI DUNG PHẢI: Danh sách Rạp */}
          <div className="w-full md:w-3/4">
            {isLoading ? (
              <div className="text-center py-20 text-primary font-bold animate-pulse">Đang tải danh sách rạp...</div>
            ) : cinemas.length === 0 ? (
              <div className="bg-[#1A1A1A] p-10 rounded-2xl border border-gray-800 text-center text-gray-500">
                Chưa có thông tin rạp cho hệ thống này.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cinemas.map((cinema) => (
                  <div key={cinema.id} className="bg-[#1A1A1A] p-6 rounded-2xl border border-gray-800 hover:border-primary/50 transition-all hover:shadow-[0_10px_20px_rgba(229,9,20,0.1)] group cursor-pointer flex flex-col h-full">
                    
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-800">
                      <div className="w-12 h-12 rounded-full bg-[#222] border border-gray-700 flex items-center justify-center text-primary font-black shadow-inner">
                        {cinema.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{cinema.name}</h4>
                        <p className="text-xs text-accent font-medium mt-1">CineBook Partner</p>
                      </div>
                    </div>

                    <div className="flex-grow space-y-3 mb-6">
                      <p className="text-gray-400 text-sm flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                        <span className="line-clamp-2">{cinema.address}</span>
                      </p>
                    </div>

                    {/* Nút Xem Lịch Chiếu - Sẽ gọi sang trang chi tiết sau này */}
                    <button 
    onClick={() => navigate(`/cinemas/${cinema.id}`)}
    className="w-full py-3 rounded-lg bg-[#222] border border-gray-700 text-gray-300 font-bold group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all flex items-center justify-center gap-2"
  >
    XEM LỊCH CHIẾU <ChevronRight size={16} />
  </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}