import { useState, useEffect } from 'react';
import { movieApi } from '../../api/movieApi';
import MovieCard from '../../components/movie/MovieCard';
import HeroBanner from '../../components/home/HeroBanner';
import MovieModal from '../../components/movie/MovieModal';

export default function HomePage() {
  // Tách biệt 2 hộp chứa dữ liệu
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Gọi song song cả 2 API để lấy 2 danh sách riêng biệt
        const [nowShowingRes, comingSoonRes] = await Promise.all([
          movieApi.getNowShowing(),
          movieApi.getComingSoon()
        ]);

        // Trích xuất dữ liệu an toàn
        const extractData = (res) => Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
        
        setNowShowingMovies(extractData(nowShowingRes));
        setComingSoonMovies(extractData(comingSoonRes));
        
      } catch (error) {
        console.error("Lỗi lấy danh sách phim:", error);
      }
    };
    fetchMovies();
  }, []);

  return (
    <main className="bg-dark text-text-light min-h-screen">
      
      {/* Banner lấy tạm phim đang chiếu để làm nền */}
      <HeroBanner featuredMovies={nowShowingMovies} onOpenModal={setSelectedMovie} />

      {/* Mục 1: PHIM ĐANG CHIẾU */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Phim đang chiếu</h2>
          <a href="/movies?tab=now-showing" className="text-primary hover:underline">Xem tất cả</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {nowShowingMovies.length > 0 ? (
            nowShowingMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onOpenModal={setSelectedMovie} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full">Chưa có phim đang chiếu.</p>
          )}
        </div>
      </section>

      {/* Mục 2: PHIM SẮP CHIẾU */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Phim sắp chiếu</h2>
            <a href="/movies?tab=coming-soon" className="text-primary hover:underline">Xem tất cả</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {comingSoonMovies.length > 0 ? (
              comingSoonMovies.map((movie) => (
                <MovieCard 
                  key={`coming-${movie.id}`} 
                  movie={movie} 
                  isComingSoon={true} 
                  onOpenModal={setSelectedMovie} 
                />
              ))
            ) : (
              <p className="text-gray-500 col-span-full">Chưa có phim sắp chiếu.</p>
            )}
          </div>
        </div>
      </section>
      
      {/* CỤM MODAL */}
      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}

    </main>
  );
}