import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieApi } from '../../api/movieApi';
import { showtimeApi } from '../../api/showtimeApi';
import { systemApi } from '../../api/systemApi'; 
import { Clock, Star, MapPin, ChevronRight, ChevronDown, Info, Bell, Send } from 'lucide-react'; // Thêm Bell, Send
import { useAuthStore } from '../../store/authStore'; // Lấy thông tin user
import toast from 'react-hot-toast'; // Thư viện thông báo

export default function MovieDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Lấy user từ Zustand

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  
  // DỮ LIỆU TỪ DATABASE
  const [dbChains, setDbChains] = useState([]);
  const [dbCities, setDbCities] = useState([]);

  // Các biến State để lưu bộ lọc
  const [selectedCinemaChain, setSelectedCinemaChain] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCity, setSelectedCity] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // State bật/tắt menu xổ xuống (Dropdown)
  const [showChainDropdown, setShowChainDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // State cho form nhận thông báo
  const [notifyEmail, setNotifyEmail] = useState('');

  // Tự động điền email nếu user đã đăng nhập
  useEffect(() => {
    if (user?.email) {
      setNotifyEmail(user.email);
    }
  }, [user]);

  // 1. Lấy thông tin phim và danh sách Rạp/Thành phố từ Backend
  useEffect(() => {
    const initData = async () => {
      try {
        const [movieRes, citiesRes, chainsRes] = await Promise.all([
          movieApi.getMovieBySlug(slug),
          systemApi.getCities(),
          systemApi.getCinemaChains()
        ]);
        
        const actualMovie = movieRes.data.data ? movieRes.data.data : movieRes.data;
        setMovie(actualMovie);

        const actualCities = citiesRes.data.data ? citiesRes.data.data : citiesRes.data;
        const actualChains = chainsRes.data.data ? chainsRes.data.data : chainsRes.data;
        
        setDbCities(actualCities);
        setDbChains(actualChains);

        if(actualChains.length > 0) setSelectedCinemaChain(actualChains[0].name);
        if(actualCities.length > 0) setSelectedCity(actualCities[0].name);

      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      }
    };
    initData();
  }, [slug]);

  // 2. Lấy lịch chiếu mỗi khi đổi bộ lọc
  useEffect(() => {
    if (movie?.id && selectedCinemaChain && selectedCity) {
      const fetchShowtimes = async () => {
        setIsLoading(true);
        try {
          const response = await showtimeApi.getShowtimes(movie.id, selectedDate, selectedCity, selectedCinemaChain);
          const actualShowtimes = response.data.data ? response.data.data : response.data;
          setShowtimes(actualShowtimes);
        } catch (error) {
          console.error("Lỗi lấy lịch chiếu:", error);
          setShowtimes([]); 
        } finally {
          setIsLoading(false);
        }
      };
      fetchShowtimes();
    }
  }, [movie, selectedDate, selectedCity, selectedCinemaChain]);

  // 3. Tạo danh sách 7 ngày
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        full: d.toISOString().split('T')[0],
        dayName: i === 0 ? "HÔM NAY" : d.toLocaleDateString('vi-VN', { weekday: 'short' }).toUpperCase(),
        dateNum: d.getDate(),
        month: d.getMonth() + 1
      });
    }
    return days;
  };

  const isChainInOthers = dbChains.slice(5).some(c => c.name === selectedCinemaChain);
  const isCityInOthers = dbCities.slice(5).some(c => c.name === selectedCity);

  // Xử lý nút Đăng ký nhận thông báo
  const handleSubscribeNotify = () => {
    if (!notifyEmail) {
      toast.error("Vui lòng nhập địa chỉ email của bạn!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notifyEmail)) {
      toast.error("Định dạng email không hợp lệ!");
      return;
    }
    // Chỗ này sau này có thể gọi API: await movieApi.subscribeNotification(movie.id, notifyEmail);
    toast.success("Đăng ký thành công! Chúng tôi sẽ email cho bạn ngay khi mở bán vé.");
  };

  if (!movie) return <div className="min-h-screen bg-dark flex items-center justify-center text-primary font-bold">Đang tải phim...</div>;

  return (
    <div className="bg-dark min-h-screen text-white pb-20">
      
      {/* PHẦN 1: CHỌN CỤM RẠP */}
      <div className="container mx-auto px-4 pt-8">
        <h3 className="text-gray-400 text-xs font-bold mb-4 uppercase tracking-widest">Chọn cụm rạp</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10 relative">
          {dbChains.slice(0, 5).map(chain => (
            <button
              key={chain.id}
              onClick={() => { setSelectedCinemaChain(chain.name); setShowChainDropdown(false); }}
              className={`py-3 px-2 rounded-lg font-black text-lg transition-all border-2 ${
                selectedCinemaChain === chain.name && !isChainInOthers
                ? 'bg-card border-primary text-primary shadow-lg shadow-primary/20' 
                : 'bg-card border-transparent text-gray-500 hover:border-gray-700'
              }`}
            >
              {chain.name}
            </button>
          ))}
          
          {dbChains.length > 5 && (
            <div className="relative h-full">
              <button 
                onClick={() => setShowChainDropdown(!showChainDropdown)}
                className={`w-full h-full bg-card border-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  isChainInOthers ? 'border-primary text-primary shadow-lg shadow-primary/20' : 'border-transparent text-gray-500 hover:border-gray-700'
                }`}
              >
                {isChainInOthers ? selectedCinemaChain : 'Rạp khác'} <ChevronDown size={18} className={showChainDropdown ? 'rotate-180 transition-transform' : 'transition-transform'}/>
              </button>
              
              {showChainDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                  {dbChains.slice(5).map(chain => (
                    <button
                      key={chain.id}
                      onClick={() => { setSelectedCinemaChain(chain.name); setShowChainDropdown(false); }}
                      className="block w-full text-left px-4 py-3 hover:bg-primary/20 hover:text-primary transition-colors font-bold text-gray-300 border-b border-gray-800 last:border-0"
                    >
                      {chain.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PHẦN 2: CHỌN NGÀY */}
        <h3 className="text-gray-400 text-xs font-bold mb-4 uppercase tracking-widest">Chọn ngày xem</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 mb-10 scrollbar-hide">
          {getNext7Days().map((day) => (
            <button
              key={day.full}
              onClick={() => setSelectedDate(day.full)}
              className={`flex flex-col items-center min-w-[90px] py-4 rounded-xl transition-all border-2 ${
                selectedDate === day.full 
                ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
                : 'bg-card border-transparent text-gray-400 hover:border-gray-700'
              }`}
            >
              <span className={`text-[10px] font-bold mb-1 ${selectedDate === day.full ? 'text-white' : 'text-primary'}`}>{day.dayName}</span>
              <span className="text-2xl font-black">{day.dateNum}</span>
              <span className="text-[10px] font-bold opacity-60">Tháng {day.month}</span>
            </button>
          ))}
        </div>

        {/* PHẦN 3: CHỌN THÀNH PHỐ */}
        <h3 className="text-gray-400 text-xs font-bold mb-4 uppercase tracking-widest">Chọn thành phố</h3>
        <div className="flex flex-wrap gap-3 mb-12 relative">
          {dbCities.slice(0, 5).map(city => (
            <button
              key={city.id}
              onClick={() => { setSelectedCity(city.name); setShowCityDropdown(false); }}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCity === city.name && !isCityInOthers
                ? 'bg-accent text-dark shadow-md border border-accent' 
                : 'bg-card text-gray-400 hover:bg-gray-800 border border-transparent'
              }`}
            >
              {city.name}
            </button>
          ))}
          
          {dbCities.length > 5 && (
            <div className="relative">
              <button 
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className={`px-6 py-2 h-full rounded-full text-sm font-bold flex items-center gap-2 transition-all border ${
                  isCityInOthers ? 'bg-accent text-dark shadow-md border-accent' : 'bg-card text-gray-400 hover:bg-gray-800 border-transparent'
                }`}
              >
                {isCityInOthers ? selectedCity : 'Thành phố khác'} <ChevronDown size={16} className={showCityDropdown ? 'rotate-180 transition-transform' : 'transition-transform'}/>
              </button>

              {showCityDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                  {dbCities.slice(5).map(city => (
                    <button
                      key={city.id}
                      onClick={() => { setSelectedCity(city.name); setShowCityDropdown(false); }}
                      className="block w-full text-left px-4 py-3 hover:bg-accent hover:text-dark transition-colors font-bold text-gray-300 border-b border-gray-800 last:border-0"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PHẦN 4: DANH SÁCH SUẤT CHIẾU */}
        <div className="space-y-10">
          
          {isLoading ? (
            <div className="text-center py-10 text-primary font-bold animate-pulse">Đang tìm lịch chiếu...</div>
          ) : showtimes.length > 0 ? (
            
            showtimes.map(cinema => (
              <div key={cinema.cinemaId} className="bg-card rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                <div className="bg-[#222] p-5 flex justify-between items-center border-b border-gray-700">
                  <div>
                    <h4 className="text-xl font-black text-white">{cinema.cinemaName}</h4>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {cinema.address}
                    </p>
                  </div>
                  <button className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 border border-gray-700 px-3 py-1.5 rounded-lg transition-all">
                    Xem bản đồ <ChevronRight size={14} />
                  </button>
                </div>

                <div className="p-6 md:p-10 flex flex-col md:flex-row gap-10">
                  <div className="w-full md:w-1/4 lg:w-1/5">
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-700">
                      <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-primary text-[10px] font-black px-2 py-1 rounded">2D</div>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-3xl font-black tracking-tight">{movie.title}</h2>
                      <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] font-black">{movie.rated || 'T18'}</span>
                      <span className="flex items-center text-accent text-sm font-bold ml-2">
                        <Star size={16} fill="currentColor" className="mr-1" /> {movie.averageRating || '8.9'}
                      </span>
                    </div>

                    <div className="mb-10">
                      <h5 className="text-gray-500 text-xs font-bold mb-4 uppercase tracking-[0.2em]">Danh sách suất chiếu</h5>
                      <div className="flex flex-wrap gap-4">
                        {cinema.times.map(st => (
                          <button 
                            key={st.showtimeId}
                            onClick={() => navigate(`/booking/${st.showtimeId}`)}
                            className="w-24 py-2.5 rounded-lg bg-dark border border-gray-700 font-bold text-gray-300 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex flex-col items-center"
                          >
                            <span>{st.startTime}</span>
                            <span className="text-[9px] font-normal text-gray-500 mt-0.5">{st.format}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            
            /* GIAO DIỆN KHI CHƯA CÓ LỊCH CHIẾU (PHIM SẮP CHIẾU) */
            <div className="bg-card rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
              <div className="bg-[#222] p-5 flex justify-between items-center border-b border-gray-700">
                <div>
                  <h4 className="text-xl font-black text-white">{selectedCinemaChain} - {selectedCity}</h4>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin size={14} /> Hệ thống đang cập nhật lịch chiếu cho rạp này
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-10 flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-1/4 lg:w-1/5">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-700 opacity-80">
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-3xl font-black tracking-tight">{movie.title}</h2>
                    <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] font-black">{movie.rated || 'T18'}</span>
                  </div>

                  {/* KHU VỰC ĐĂNG KÝ NHẬN THÔNG BÁO */}
                  <div className="mt-8 bg-dark/50 border border-gray-700 rounded-xl p-8 text-center max-w-2xl mx-auto">
                    <Bell className="w-12 h-12 text-accent mx-auto mb-4 animate-bounce" />
                    <h4 className="text-xl font-bold text-white mb-2">Nhận thông báo mở bán vé</h4>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                      Lịch chiếu cho ngày <strong className="text-white">{selectedDate}</strong> chưa được công bố. Để lại Email để chúng tôi báo cho bạn ngay khi vé được mở bán nhé!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="email" 
                        placeholder="Nhập địa chỉ email của bạn..." 
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        className="flex-grow bg-[#222] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                      />
                      <button 
                        onClick={handleSubscribeNotify}
                        className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Send size={18} /> Đăng ký
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
          )}

        </div>
      </div>
    </div>
  );
}