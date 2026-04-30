import { Link } from 'react-router-dom';

export default function MovieCard({ movie, isComingSoon = false, onOpenModal }) {
  const posterUrl = movie.poster_url || movie.posterUrl;

  return (
    <div className="group relative overflow-hidden rounded-md bg-card hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-800 hover:border-gray-600">
      <div className="relative overflow-hidden aspect-[2/3]">
        <img 
          src={posterUrl} 
          alt={movie.title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
          }}
        />
        
        {/* CGV Style Overlay: Hiện 2 nút bấm khi hover */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-3 p-4">
          
          {/* Nút 1: Gọi Modal xem Trailer (Viền trắng, trong suốt) */}
          <button 
            onClick={() => onOpenModal(movie)}
            className="w-4/5 py-2.5 rounded-full text-sm font-semibold transition-all transform translate-y-4 group-hover:translate-y-0 border-2 border-white text-white hover:bg-white hover:text-black flex items-center justify-center"
          >
            <i className="fas fa-info-circle mr-2"></i> 
            {isComingSoon ? 'Xem trailer' : 'Xem chi tiết'}
          </button>

          {/* Nút 2: Mua vé nhảy sang trang khác */}
          <Link
            to={`/movies/${movie.slug || movie.id}`}
            className={`w-4/5 py-2.5 rounded-full text-sm font-bold transition-all transform translate-y-4 group-hover:translate-y-0 flex items-center justify-center delay-75
              ${isComingSoon ? 'bg-accent text-dark hover:bg-yellow-500' : 'bg-primary text-white hover:bg-red-700'}
            `}
          >
            <i className="fas fa-ticket-alt mr-2"></i> 
            {isComingSoon ? 'Đặt vé sớm' : 'Mua vé'}
          </Link>
        </div>
      </div>

      <div className="p-3 flex-grow flex flex-col justify-between">
        <h3 className="font-bold text-white mb-1 truncate" title={movie.title}>{movie.title}</h3>
        {!isComingSoon ? (
          <div className="flex justify-between items-center text-text-muted text-xs">
            <span>{movie.duration} phút</span>
            <span className="text-accent font-bold"><i className="fas fa-star mr-1"></i>8.5</span>
          </div>
        ) : (
          <p className="text-text-muted text-xs">Khởi chiếu: {movie.releaseDate || 'Sắp tới'}</p>
        )}
      </div>
    </div>
  );
}