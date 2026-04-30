import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 1. THÊM onOpenModal vào đây
export default function HeroBanner({ featuredMovies, onOpenModal }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!featuredMovies || featuredMovies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredMovies]);

  if (!featuredMovies || featuredMovies.length === 0) return null;

  const movie = featuredMovies[currentSlide];

  return (
    <section className="relative h-[75vh] min-h-[600px] overflow-hidden">
      
      <div 
        className="h-full w-full absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url('${movie.bannerUrl || movie.posterUrl}')` }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent flex items-end pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-2 text-text-light">{movie.title}</h1>
            <p className="text-text-muted mb-4 line-clamp-2">{movie.description}</p>
            
            <div className="flex space-x-4">
              {/* 2. THÊM onClick={() => onOpenModal(movie)} vào nút này */}
              <button 
                onClick={() => onOpenModal(movie)}
                className="px-6 py-2 bg-primary rounded-full hover:bg-opacity-90 transition-all flex items-center text-text-light"
              >
                <i className="fas fa-play mr-2"></i> Xem trailer
              </button>
              
              <Link 
                to={`/movies/${movie.slug || movie.id}`}
                className="px-6 py-2 bg-accent text-dark rounded-full hover:bg-opacity-90 transition-all"
              >
                Đặt vé ngay
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {featuredMovies.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-primary' : 'bg-gray-600'}`}
          ></button>
        ))}
      </div>
    </section>
  );
}