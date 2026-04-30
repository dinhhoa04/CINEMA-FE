import { useState, useEffect } from 'react';
import { movieApi } from '../../api/movieApi';
import MovieCard from '../../components/movie/MovieCard';
import HeroBanner from '../../components/home/HeroBanner';
import MovieModal from '../../components/movie/MovieModal'; // Import Modal mới

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null); // Biến lưu phim đang được click

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await movieApi.getNowShowing();
        setMovies(response.data); 
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };
    fetchMovies();
  }, []);

  return (
    <main className="bg-dark text-text-light min-h-screen">
      
      <HeroBanner featuredMovies={movies} onOpenModal={setSelectedMovie} />

      {/* Phim đang chiếu */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Phim đang chiếu</h2>
          <a href="#" className="text-primary hover:underline">Xem tất cả</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            // Truyền hàm setSelectedMovie vào Card
            <MovieCard key={movie.id} movie={movie} onOpenModal={setSelectedMovie} />
          ))}
        </div>
      </section>

      {/* Phim sắp chiếu */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Phim sắp chiếu</h2>
            <a href="#" className="text-primary hover:underline">Xem tất cả</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {movies.slice(0, 4).map((movie) => (
              <MovieCard 
                key={`coming-${movie.id}`} 
                movie={movie} 
                isComingSoon={true} 
                onOpenModal={setSelectedMovie} 
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* CỤM MODAL: Chỉ hiển thị khi selectedMovie có dữ liệu */}
      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}

    </main>
  );
}