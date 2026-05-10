import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Film, CalendarDays, Filter } from 'lucide-react';
import { movieApi } from '../../api/movieApi';
import { showtimeApi } from '../../api/showtimeApi';
import { systemApi } from '../../api/systemApi';

export default function AdminMoviePage() {
  const [activeTab, setActiveTab] = useState('movies');
  // Thêm mảng này vào dưới phần import
const AVAILABLE_GENRES = [
  "Hành động", "Tình cảm", "Hài hước", "Kinh dị", "Hoạt hình", 
  "Khoa học viễn tưởng", "Phiêu lưu", "Tâm lý", "Tài liệu", "Võ thuật", "Gia đình"
];

  // --- DATA STATES ---
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [halls, setHalls] = useState([]);

  // --- MODAL STATES ---
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [isShowtimeModalOpen, setIsShowtimeModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState(''); // Cho tab Phim
  const [filterMovie, setFilterMovie] = useState(''); // Cho tab Lịch chiếu
  const [filterCinema, setFilterCinema] = useState(''); // Cho tab Lịch chiếu
  const [filterDate, setFilterDate] = useState(''); // Cho tab Lịch chiếu

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- FORMS ---
  const [movieForm, setMovieForm] = useState({
    title: '', slug: '', duration: '', releaseDate: '', status: 'NOW_SHOWING',
    posterUrl: '', bannerUrl: '', trailerUrl: '', language: 'Tiếng Việt',
    rated: 'P', director: '',genre: '', castMembers: '', description: '', averageRating: 0, countryId: 1
  });

  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '', cinemaId: '', hallId: '', startTime: '', endTime: '',
    basePrice: 80000, language: 'Tiếng Việt', subtitle: 'Phụ đề Tiếng Việt', isActive: true
  });

  const fetchData = async () => {
    try {
      const [movRes, stRes, cinRes, hallRes] = await Promise.all([
        movieApi.getAllMovies(), showtimeApi.getAllShowtimes(),
        systemApi.getAllCinemas(), systemApi.getAllHalls()
      ]);
      const extract = (res) => Array.isArray(res) ? res : (res?.data?.data || res?.data || []);
      setMovies(extract(movRes));
      setShowtimes(extract(stRes));
      setCinemas(extract(cinRes));
      setHalls(extract(hallRes));
    } catch (err) { console.error("Lỗi tải dữ liệu:", err); }
  };

  useEffect(() => { fetchData(); }, []);

  // Reset trang khi đổi filter
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterMovie, filterCinema, filterDate, activeTab]);

  // --- LOGIC TÌM KIẾM & LỌC THÔNG MINH ---
  const filteredData = (activeTab === 'movies' ? movies : showtimes).filter(item => {
    if (activeTab === 'movies') {
      return item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      // Bộ lọc liên hoàn cho Lịch chiếu
      const matchMovie = filterMovie === '' || item.movie?.id.toString() === filterMovie;
      const matchCinema = filterCinema === '' || item.hall?.cinema?.id.toString() === filterCinema;
      const matchDate = filterDate === '' || item.startTime?.startsWith(filterDate);
      return matchMovie && matchCinema && matchDate;
    }
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Tự động tính thời gian kết thúc
  const handleShowtimeChange = (e) => {
    const { name, value } = e.target;
    let newForm = { ...showtimeForm, [name]: value };

    if (name === 'cinemaId') newForm.hallId = '';
    if (name === 'startTime' || name === 'movieId') {
      const selectedMovie = movies.find(m => m.id.toString() === newForm.movieId);
      if (selectedMovie && newForm.startTime) {
        const startDate = new Date(newForm.startTime);
        startDate.setMinutes(startDate.getMinutes() + (selectedMovie.duration || 120));
        const tzOffset = startDate.getTimezoneOffset() * 60000;
        newForm.endTime = (new Date(startDate - tzOffset)).toISOString().slice(0, 16);
      }
    }
    setShowtimeForm(newForm);
  };

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await movieApi.updateMovie(editingId, movieForm);
      else await movieApi.createMovie(movieForm);
      setIsMovieModalOpen(false); fetchData();
    } catch (err) { alert("Lỗi lưu Phim!"); }
  };

  const handleShowtimeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await showtimeApi.updateShowtime(editingId, showtimeForm);
      else await showtimeApi.createShowtime(showtimeForm);
      setIsShowtimeModalOpen(false); fetchData();
    } catch (err) { alert("Lỗi lưu Lịch chiếu!"); }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm("Bạn có chắc muốn xóa dữ liệu này?")) {
      try {
        if (type === 'movie') await movieApi.deleteMovie(id);
        else await showtimeApi.deleteShowtime(id);
        fetchData();
      } catch (err) { alert("Lỗi xóa! Có thể dữ liệu đang bị ràng buộc."); }
    }
  };

  const handleGenreToggle = (genreName) => {
    // Tách chuỗi hiện tại thành mảng các từ
    let currentGenres = movieForm.genre ? movieForm.genre.split(',').map(g => g.trim()).filter(g => g) : [];
    
    if (currentGenres.includes(genreName)) {
      // Nếu đã có -> Click vào nghĩa là bỏ chọn -> Xóa khỏi mảng
      currentGenres = currentGenres.filter(g => g !== genreName);
    } else {
      // Nếu chưa có -> Click vào nghĩa là chọn -> Thêm vào mảng
      currentGenres.push(genreName);
    }
    
    // Ghép lại thành chuỗi phẩy và lưu vào Form
    setMovieForm({ ...movieForm, genre: currentGenres.join(', ') });
  };

  const filteredHallsForForm = halls.filter(h => h.cinema?.id.toString() === showtimeForm.cinemaId);

  return (
    <div className="space-y-6 relative pb-10">
      {/* HEADER TABS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Phim & Lịch chiếu</h1>
          <button onClick={() => { 
            setEditingId(null); 
            if (activeTab === 'movies') {
              // Xóa trắng form khi thêm Phim mới
              setMovieForm({
                title: '', slug: '', duration: '', releaseDate: '', status: 'NOW_SHOWING',
                posterUrl: '', bannerUrl: '', trailerUrl: '', language: 'Tiếng Việt',
                rated: 'P', director: '', genre: '', castMembers: '', description: '', averageRating: 0, countryId: 1
              });
              setIsMovieModalOpen(true);
            } else {
              // Xóa trắng form khi thêm Lịch chiếu mới
              setShowtimeForm({
                movieId: '', cinemaId: '', hallId: '', startTime: '', endTime: '',
                basePrice: 80000, language: 'Tiếng Việt', subtitle: 'Phụ đề Tiếng Việt', isActive: true
              });
              setIsShowtimeModalOpen(true);
            }
          }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
          >
            <Plus size={20} /><span>Thêm {activeTab === 'movies' ? 'Phim' : 'Lịch'} Mới</span>
          </button>
        </div>
        <div className="flex gap-4 border-b">
          <button onClick={() => setActiveTab('movies')} className={`flex items-center gap-2 pb-3 px-2 font-medium transition-colors ${activeTab === 'movies' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-800'}`}><Film size={18} /> Danh sách Phim</button>
          <button onClick={() => setActiveTab('showtimes')} className={`flex items-center gap-2 pb-3 px-2 font-medium transition-colors ${activeTab === 'showtimes' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-800'}`}><CalendarDays size={18} /> Lịch chiếu (Showtimes)</button>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG / BỘ LỌC */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        {activeTab === 'movies' ? (
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder={`Tìm kiếm theo tên phim...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-gray-600 font-medium"><Filter size={18} /> Lọc Lịch chiếu:</div>
            <select value={filterMovie} onChange={(e) => setFilterMovie(e.target.value)} className="border p-2 rounded-lg bg-gray-50 outline-none">
              <option value="">Tất cả Phim</option>
              {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
            <select value={filterCinema} onChange={(e) => setFilterCinema(e.target.value)} className="border p-2 rounded-lg bg-gray-50 outline-none">
              <option value="">Tất cả Cụm Rạp</option>
              {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border p-2 rounded-lg bg-gray-50 outline-none" title="Lọc theo ngày chiếu" />
          </>
        )}
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm uppercase">
              <th className="p-4">{activeTab === 'movies' ? 'Poster' : 'Phim'}</th>
              <th className="p-4">{activeTab === 'movies' ? 'Tên Phim' : 'Thời gian chiếu'}</th>
              <th className="p-4">{activeTab === 'movies' ? 'Trạng thái' : 'Phòng / Rạp'}</th>
              <th className="p-4">{activeTab === 'movies' ? 'Ngày khởi chiếu' : 'Loại / Phụ đề'}</th>
              <th className="p-4">{activeTab === 'movies' ? 'Điểm / Thời lượng' : 'Giá gốc'}</th>
              <th className="p-4 text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagedData.length > 0 ? pagedData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">

                {/* CỘT 1 */}
                <td className="p-4">
                  {activeTab === 'movies'
                    ? <img src={item.posterUrl || 'https://placehold.co/100x150?text=No+Poster'} alt="poster" className="w-12 h-16 object-cover rounded shadow-sm" />
                    : <div className="font-bold text-gray-800 line-clamp-2 max-w-[200px]">{item.movie?.title || 'Phim đã xóa'}</div>}
                </td>

                {/* CỘT 2 */}
                <td className="p-4 font-medium">
                  {activeTab === 'movies'
                    ? item.title
                    : <div>
                      <div className="text-blue-600 font-bold">{new Date(item.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-xs text-gray-500">{new Date(item.startTime).toLocaleDateString('vi-VN')}</div>
                    </div>}
                </td>

                {/* CỘT 3 */}
                <td className="p-4">
                  {activeTab === 'movies'
                    ? <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'NOW_SHOWING' ? 'bg-green-100 text-green-700' : item.status === 'COMING_SOON' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                      {item.status === 'NOW_SHOWING' ? 'Đang chiếu' : item.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Ngừng chiếu'}
                    </span>
                    : <div className="text-sm">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{item.hall?.name}</span>
                      <div className="text-gray-500 text-xs mt-1 truncate max-w-[150px]">{item.hall?.cinema?.name}</div>
                    </div>}
                </td>

                {/* CỘT 4 */}
                <td className="p-4 text-sm">
                  {activeTab === 'movies'
                    ? <span className="text-gray-600">{item.releaseDate}</span>
                    : <div className="flex flex-col gap-1">
                      <span className="text-gray-800 text-xs bg-gray-100 px-2 py-1 w-fit rounded">{item.language}</span>
                      <span className="text-gray-600 text-xs italic">{item.subtitle}</span>
                    </div>}
                </td>

                {/* CỘT 5 */}
                <td className="p-4 font-medium">
                  {activeTab === 'movies'
                    ? <div className="flex flex-col"><span className="text-yellow-500">⭐ {item.averageRating || '0.0'}/10</span><span className="text-gray-500 text-xs">{item.duration} phút</span></div>
                    : <span className="text-red-600 font-bold">{Number(item.basePrice).toLocaleString()}đ</span>}
                </td>

                {/* CỘT 6: HÀNH ĐỘNG */}
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => {
                    setEditingId(item.id);
                    if (activeTab === 'movies') { 
                      // BIẾN PHÉP: Lấy mảng item.genres dịch ra thành chuỗi "Hành động, Hài"
                      const genreString = item.genres && Array.isArray(item.genres) 
                                          ? item.genres.map(g => g.name).join(', ') 
                                          : (item.genre || '');
                      
                      setMovieForm({ ...item, genre: genreString }); 
                      setIsMovieModalOpen(true); 
                    }
                    else { 
                      setShowtimeForm({ 
                        ...item, 
                        movieId: item.movie?.id, 
                        cinemaId: item.hall?.cinema?.id, 
                        hallId: item.hall?.id, 
                        startTime: item.startTime?.slice(0, 16), 
                        endTime: item.endTime?.slice(0, 16) 
                      }); 
                      setIsShowtimeModalOpen(true); 
                    }
                  }} className="text-blue-500 bg-blue-50 p-2 rounded hover:text-blue-700">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.id, activeTab === 'movies' ? 'movie' : 'showtime')} className="text-red-500 bg-red-50 p-2 rounded hover:text-red-700"><Trash2 size={18} /></button>
                </td>
              </tr>
            )) : <tr><td colSpan="6" className="p-8 text-center text-gray-500">Không có dữ liệu phù hợp bộ lọc.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg border font-medium ${currentPage === page ? 'bg-red-600 text-white' : 'hover:bg-gray-50'}`}>{page}</button>
          ))}
        </div>
      )}

      {/* MODAL PHIM (MỞ RỘNG) */}
      {isMovieModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between">
              <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Cập nhật Phim' : 'Thêm Phim Mới'}</h2>
              <button onClick={() => setIsMovieModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form onSubmit={handleMovieSubmit} className="p-6 grid grid-cols-3 gap-5">

              <div className="col-span-2"><label className="block text-sm font-medium mb-1">Tên phim *</label><input required value={movieForm.title} onChange={e => setMovieForm({ ...movieForm, title: e.target.value })} className="w-full border p-2 rounded focus:ring-1 focus:ring-red-500 outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Slug URL *</label><input required value={movieForm.slug} onChange={e => setMovieForm({ ...movieForm, slug: e.target.value })} className="w-full border p-2 rounded outline-none" /></div>

              <div><label className="block text-sm font-medium mb-1">Đạo diễn</label><input value={movieForm.director} onChange={e => setMovieForm({ ...movieForm, director: e.target.value })} className="w-full border p-2 rounded outline-none" /></div>
              <div className="col-span-2">
  <label className="block text-sm font-medium mb-2">Thể loại (Có thể chọn nhiều)</label>
  <div className="flex flex-wrap gap-2">
    {AVAILABLE_GENRES.map(g => {
      // Kiểm tra xem thể loại này đã được chọn chưa
      const currentGenres = movieForm.genre ? movieForm.genre.split(',').map(name => name.trim()) : [];
      const isSelected = currentGenres.includes(g);
      
      return (
        <label 
          key={g} 
          className={`px-3 py-1.5 border rounded-full cursor-pointer text-sm transition-all duration-200 select-none
            ${isSelected 
              ? 'bg-red-600 text-white border-red-600 shadow-md' 
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
            }`}
        >
          <input 
            type="checkbox" 
            className="hidden" 
            checked={isSelected} 
            onChange={() => handleGenreToggle(g)} 
          />
          {g}
        </label>
      );
    })}
  </div>
</div>
              <div className="col-span-2"><label className="block text-sm font-medium mb-1">Diễn viên</label><input value={movieForm.castMembers} onChange={e => setMovieForm({ ...movieForm, castMembers: e.target.value })} className="w-full border p-2 rounded outline-none" /></div>

              <div><label className="block text-sm font-medium mb-1">Thời lượng (Phút) *</label><input type="number" required value={movieForm.duration} onChange={e => setMovieForm({ ...movieForm, duration: e.target.value })} className="w-full border p-2 rounded outline-none" /></div>
              <div><label className="block text-sm font-medium mb-1">Ngày khởi chiếu *</label><input type="date" required value={movieForm.releaseDate} onChange={e => setMovieForm({ ...movieForm, releaseDate: e.target.value })} className="w-full border p-2 rounded outline-none" /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Độ tuổi (Rated)</label>
                <select value={movieForm.rated} onChange={e => setMovieForm({ ...movieForm, rated: e.target.value })} className="w-full border p-2 rounded outline-none bg-white">
                  <option value="P">P (Mọi lứa tuổi)</option><option value="C13">C13 (Trên 13 tuổi)</option><option value="C16">C16 (Trên 16 tuổi)</option><option value="C18">C18 (Trên 18 tuổi)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select value={movieForm.status} onChange={e => setMovieForm({ ...movieForm, status: e.target.value })} className="w-full border p-2 rounded outline-none bg-white">
                  <option value="NOW_SHOWING">Đang chiếu</option><option value="COMING_SOON">Sắp chiếu</option><option value="STOPPED">Ngừng chiếu / Ẩn</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Điểm Rating mồi ( /10)</label><input type="number" step="0.1" max="10" value={movieForm.averageRating} onChange={e => setMovieForm({ ...movieForm, averageRating: e.target.value })} className="w-full border p-2 rounded outline-none" title="Nhập số từ 0 đến 10" /></div>
              <div><label className="block text-sm font-medium mb-1">Ngôn ngữ</label><input value={movieForm.language} onChange={e => setMovieForm({ ...movieForm, language: e.target.value })} className="w-full border p-2 rounded outline-none" /></div>

              <div className="col-span-3"><label className="block text-sm font-medium mb-1">Mô tả phim (Description)</label><textarea rows="3" value={movieForm.description} onChange={e => setMovieForm({ ...movieForm, description: e.target.value })} className="w-full border p-2 rounded outline-none" /></div>

              <div className="col-span-3"><label className="block text-sm font-medium mb-1">Link Poster (Ảnh dọc)</label><input value={movieForm.posterUrl} onChange={e => setMovieForm({ ...movieForm, posterUrl: e.target.value })} className="w-full border p-2 rounded outline-none" /></div>
              <div className="col-span-3"><label className="block text-sm font-medium mb-1">Link Banner (Ảnh ngang Cover)</label><input value={movieForm.bannerUrl} onChange={e => setMovieForm({ ...movieForm, bannerUrl: e.target.value })} className="w-full border p-2 rounded outline-none" /></div>
              <div className="col-span-3"><label className="block text-sm font-medium mb-1">Link Youtube Trailer</label><input value={movieForm.trailerUrl} onChange={e => setMovieForm({ ...movieForm, trailerUrl: e.target.value })} className="w-full border p-2 rounded outline-none" /></div>

              <div className="col-span-3 flex justify-end gap-3 mt-4 border-t pt-4"><button type="button" onClick={() => setIsMovieModalOpen(false)} className="px-6 py-2 border rounded hover:bg-gray-50">Hủy</button><button type="submit" className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">Lưu Thông Tin Phim</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LỊCH CHIẾU (ĐÃ THÊM SUBTITLE) */}
      {isShowtimeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between"><h2 className="text-xl font-bold">Xếp Lịch Chiếu</h2><button onClick={() => setIsShowtimeModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button></div>
            <form onSubmit={handleShowtimeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chọn Phim *</label>
                <select required name="movieId" value={showtimeForm.movieId} onChange={handleShowtimeChange} className="w-full border p-2 rounded bg-white">
                  <option value="">-- Chọn Phim --</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Chọn Rạp *</label>
                  <select required name="cinemaId" value={showtimeForm.cinemaId} onChange={handleShowtimeChange} className="w-full border p-2 rounded bg-white">
                    <option value="">-- Chọn Rạp --</option>
                    {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chọn Phòng *</label>
                  <select required name="hallId" value={showtimeForm.hallId} onChange={handleShowtimeChange} disabled={!showtimeForm.cinemaId} className="w-full border p-2 rounded bg-gray-50 disabled:opacity-50">
                    <option value="">-- Chọn Phòng --</option>
                    {filteredHallsForForm.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Bắt đầu *</label><input type="datetime-local" required name="startTime" value={showtimeForm.startTime} onChange={handleShowtimeChange} className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Kết thúc dự kiến</label><input type="datetime-local" name="endTime" value={showtimeForm.endTime} readOnly className="w-full border p-2 rounded bg-gray-100 outline-none text-gray-500" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Âm thanh</label><input name="language" value={showtimeForm.language} onChange={handleShowtimeChange} placeholder="VD: Tiếng Anh" className="w-full border p-2 rounded" /></div>
                <div><label className="block text-sm font-medium mb-1">Loại Suất / Phụ đề</label><input name="subtitle" value={showtimeForm.subtitle} onChange={handleShowtimeChange} placeholder="VD: Phụ đề Tiếng Việt" className="w-full border p-2 rounded" /></div>
              </div>

              <div><label className="block text-sm font-medium mb-1">Giá vé gốc (VNĐ) *</label><input type="number" required name="basePrice" value={showtimeForm.basePrice} onChange={handleShowtimeChange} className="w-full border p-2 rounded" /></div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t"><button type="button" onClick={() => setIsShowtimeModalOpen(false)} className="px-6 py-2 border rounded hover:bg-gray-50">Hủy</button><button type="submit" className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">Lưu Lịch Chiếu</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}