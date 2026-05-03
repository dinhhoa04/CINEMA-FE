import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieApi } from '../../api/movieApi';
import MovieCard from '../../components/movie/MovieCard';
import MovieModal from '../../components/movie/MovieModal';

export default function MoviesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'now-showing'; // Lấy tab từ URL

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        let response;
        if (currentTab === 'now-showing') {
          response = await movieApi.getNowShowing();
        } else {
          response = await movieApi.getComingSoon();
        }
        setMovies(response.data?.data || response.data || []);
      } catch (error) {
        console.error("Lỗi lấy danh sách phim:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, [currentTab]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab }); // Đổi URL khi click Tab
  };

  return (
    <div className="bg-dark min-h-screen text-white pb-20 pt-10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Banner Tiêu đề */}
        <div className="text-center mb-12 relative">
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent -z-10"></div>
          <h1 className="text-4xl font-black uppercase tracking-widest inline-block bg-dark px-6 text-white">
            Danh Sách <span className="text-primary">Phim</span>
          </h1>
        </div>

        {/* Nút Tab */}
        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => handleTabChange('now-showing')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${currentTab === 'now-showing' ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-gray-700'}`}
          >
            PHIM ĐANG CHIẾU
          </button>
          <button 
            onClick={() => handleTabChange('coming-soon')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${currentTab === 'coming-soon' ? 'bg-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]' : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-gray-700'}`}
          >
            PHIM SẮP CHIẾU
          </button>
        </div>

        {/* Lưới Phim */}
        {isLoading ? (
          <div className="text-center py-20 text-primary font-bold animate-pulse">Đang tải danh sách phim...</div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Hiện chưa có phim nào trong danh mục này.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                isComingSoon={currentTab === 'coming-soon'} 
                onOpenModal={setSelectedMovie} 
              />
            ))}
          </div>
        )}

      </div>

      {/* Modal xem Trailer */}
      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}
    </div>
  );
}