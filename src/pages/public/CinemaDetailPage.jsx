import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showtimeApi } from '../../api/showtimeApi';
import { systemApi } from '../../api/systemApi'; 
import { Star, MapPin, ChevronRight, MonitorPlay } from 'lucide-react'; 

export default function CinemaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cinema, setCinema] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Lấy thông tin chi tiết của Rạp
  useEffect(() => {
    const fetchCinemaInfo = async () => {
      try {
        const res = await systemApi.getCinemaById(id);
        setCinema(res.data?.data || res.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin rạp:", error);
      }
    };
    fetchCinemaInfo();
  }, [id]);

  // 2. Lấy danh sách Phim & Giờ chiếu tại Rạp này theo ngày
  useEffect(() => {
    if (id && selectedDate) {
      const fetchShowtimes = async () => {
        setIsLoading(true);
        try {
          const response = await showtimeApi.getShowtimesByCinema(id, selectedDate);
          setShowtimes(response.data?.data || response.data || []);
        } catch (error) {
          console.error("Lỗi lấy lịch chiếu rạp:", error);
          setShowtimes([]); 
        } finally {
          setIsLoading(false);
        }
      };
      fetchShowtimes();
    }
  }, [id, selectedDate]);

  // 3. Tạo thanh chọn 7 ngày (Dùng lại code cũ)
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

  if (!cinema) return <div className="min-h-screen bg-dark flex items-center justify-center text-primary font-bold">Đang tải thông tin rạp...</div>;

  return (
    <div className="bg-dark min-h-screen text-white pb-20">
      
      {/* Banner Rạp */}
      <div className="bg-[#1A1A1A] border-b border-gray-800 pt-10 pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-[#222] border border-gray-700 flex items-center justify-center text-3xl text-primary font-black shadow-inner hidden md:flex">
                    {cinema.name.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{cinema.name}</h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <MapPin size={18} className="text-primary"/> {cinema.address}
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl pt-8">
        
        {/* THANH CHỌN NGÀY */}
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

        {/* DANH SÁCH PHIM TẠI RẠP */}
        <div className="space-y-10">
          {isLoading ? (
            <div className="text-center py-10 text-primary font-bold animate-pulse">Đang tìm lịch chiếu...</div>
          ) : showtimes.length > 0 ? (
            
            showtimes.map(movieData => (
              <div key={movieData.movieId} className="bg-card rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                  
                  {/* Poster Phim */}
                  <div className="w-full md:w-1/4 lg:w-1/5 cursor-pointer" onClick={() => navigate(`/movies/${movieData.movieId}`)}>
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-700 hover:ring-primary transition-all">
                      <img src={movieData.posterUrl} alt={movieData.movieTitle} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  </div>

                  {/* Thông tin Phim & Giờ chiếu */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-6 cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/movies/${movieData.movieId}`)}>
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight">{movieData.movieTitle}</h2>
                      <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] font-black">{movieData.rated || 'T18'}</span>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-gray-500 text-xs font-bold mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                          <MonitorPlay size={14} /> Danh sách suất chiếu
                      </h5>
                      <div className="flex flex-wrap gap-4">
                        {movieData.times.map(st => (
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
            <div className="bg-dark/50 border border-gray-800 rounded-2xl p-10 text-center">
              <h4 className="text-xl font-bold text-gray-400 mb-2">Chưa có lịch chiếu</h4>
              <p className="text-gray-500">Rạp {cinema.name} chưa có suất chiếu nào được lên lịch vào ngày {selectedDate}.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}