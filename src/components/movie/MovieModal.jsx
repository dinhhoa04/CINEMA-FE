import { useEffect } from 'react';

export default function MovieModal({ movie, onClose }) {
  // Chặn cuộn chuột ở màn hình nền khi đang mở popup
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!movie) return null;

  // Hàm tự động trích xuất mã ID video từ link YouTube lưu trong Database
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Backend đang trả về camelCase nên ta hỗ trợ cả 2 trường hợp
  const trailerUrl = movie.trailerUrl || movie.trailer_url;
  const youtubeId = getYoutubeId(trailerUrl);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Lớp nền đen mờ đè lên toàn web, click ra ngoài nền sẽ đóng Popup */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      ></div>

      {/* Khung nội dung chính (Mô phỏng chuẩn Netflix) */}
      <div className="relative bg-[#181818] w-full max-w-4xl rounded-xl shadow-2xl z-10 flex flex-col max-h-[90vh] animate-zoom-in overflow-hidden border border-gray-800">

        {/* Nút X đóng góc trên bên phải */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-black/60 hover:bg-primary text-white rounded-full transition-colors border border-gray-600"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* NỬA TRÊN: Khung Video YouTube */}
        <div className="relative w-full aspect-video bg-black">
          {youtubeId ? (
            <iframe
              className="w-full h-full pointer-events-auto"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-text-muted">
              <i className="fas fa-video-slash text-4xl mb-2"></i>
              <p>Trailer đang cập nhật</p>
            </div>
          )}
          {/* Lớp Gradient làm mờ đáy video nối với khung mô tả bên dưới */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#181818] to-transparent pointer-events-none"></div>
        </div>

        {/* NỬA DƯỚI: Chi tiết phim */}
        <div className="p-8 overflow-y-auto">
          <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-md">{movie.title}</h2>

          {/* Thẻ meta: Năm, Độ tuổi, Thời lượng, HD */}
          <div className="flex items-center space-x-3 text-sm font-semibold mb-6 text-text-muted">
            <span className="text-green-500">Mới</span>
            <span>{movie.releaseDate ? movie.releaseDate.substring(0, 4) : '2026'}</span>
            {/* Nhãn độ tuổi */}
            <span className="border border-gray-500 text-gray-300 px-1.5 py-0.5 rounded text-xs">
              {movie.rated || 'T18'}
            </span>
            <span>{movie.duration} phút</span>
            <span className="border border-gray-600 px-1.5 py-0.5 rounded text-[10px]">HD</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cột Trái (Chiếm 2/3): Tóm tắt phim */}
            <div className="md:col-span-2">
              <p className="text-white text-base leading-relaxed">
                {movie.description}
              </p>
            </div>

            {/* Cột Phải (Chiếm 1/3): Đạo diễn, Diễn viên, Thể loại */}
            <div className="text-sm space-y-3">
              <p>
                <span className="text-gray-500">Đạo diễn: </span>
                <span className="text-white hover:underline cursor-pointer">{movie.director || 'Đang cập nhật'}</span>
              </p>
              <p>
                <span className="font-bold text-white">Thể loại: </span>
                {movie.genre || 'Chưa cập nhật'}
              </p>
              <p>
                <span className="text-gray-500">Ngôn ngữ: </span>
                <span className="text-white">{movie.language || 'Tiếng Việt'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}