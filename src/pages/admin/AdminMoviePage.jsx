import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Film, CalendarDays, Filter, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { movieApi } from '../../api/movieApi';
import { showtimeApi } from '../../api/showtimeApi';
import { systemApi } from '../../api/systemApi';
import toast from 'react-hot-toast';

const AVAILABLE_GENRES = [
  "Hành động", "Tình cảm", "Hài hước", "Kinh dị", "Hoạt hình",
  "Khoa học viễn tưởng", "Phiêu lưu", "Tâm lý", "Tài liệu", "Võ thuật", "Gia đình", "Tội Phạm", "Chiến tranh"
];

// ── Helpers ──────────────────────────────────────────────────
const STATUS_CONFIG = {
  NOW_SHOWING: { label: 'Đang chiếu',   cls: 'bg-green-100 text-green-700'  },
  COMING_SOON: { label: 'Sắp chiếu',    cls: 'bg-yellow-100 text-yellow-700' },
  ENDED:       { label: 'Ngừng chiếu',  cls: 'bg-gray-200 text-gray-600'    },
  STOPPED:     { label: 'Ngừng chiếu',  cls: 'bg-gray-200 text-gray-600'    },
};

const EMPTY_MOVIE = {
  title: '', slug: '', duration: '', releaseDate: '', status: 'NOW_SHOWING',
  posterUrl: '', bannerUrl: '', trailerUrl: '', language: 'Tiếng Việt',
  rated: 'P', director: '', genre: '', castMembers: '', description: '',
  averageRating: 0, countryId: 1,
};

const EMPTY_SHOWTIME = {
  movieId: '', cinemaId: '', hallId: '', startTime: '', endTime: '',
  basePrice: 80000, language: 'Tiếng Việt', subtitle: 'Phụ đề Tiếng Việt', isActive: true,
};

const extract = (res) => Array.isArray(res) ? res : (res?.data?.data || res?.data || []);

// ── Slug auto-generate ────────────────────────────────────────
const toSlug = (str) =>
  str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');

export default function AdminMoviePage() {
  const [activeTab, setActiveTab] = useState('movies');

  // Data
  const [movies,    setMovies]    = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [cinemas,   setCinemas]   = useState([]);
  const [halls,     setHalls]     = useState([]);

  // Modal
  const [isMovieModalOpen,    setIsMovieModalOpen]    = useState(false);
  const [isShowtimeModalOpen, setIsShowtimeModalOpen] = useState(false);
  const [editingId,           setEditingId]           = useState(null);
  const [saving,              setSaving]              = useState(false);

  // Filters
  const [searchTerm,    setSearchTerm]    = useState('');
  const [filterMovie,   setFilterMovie]   = useState('');
  const [filterCinema,  setFilterCinema]  = useState('');
  const [filterDate,    setFilterDate]    = useState('');
  const [statusFilter,  setStatusFilter]  = useState('ALL');
  const [currentPage,   setCurrentPage]   = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Forms
  const [movieForm,    setMovieForm]    = useState(EMPTY_MOVIE);
  const [showtimeForm, setShowtimeForm] = useState(EMPTY_SHOWTIME);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const [movRes, stRes, cinRes, hallRes] = await Promise.all([
        movieApi.getAllMovies(),
        showtimeApi.getAllShowtimes(),
        systemApi.getAllCinemas(),
        systemApi.getAllHalls(),
      ]);
      setMovies(extract(movRes));
      setShowtimes(extract(stRes));
      setCinemas(extract(cinRes));
      setHalls(extract(hallRes));
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      toast.error('Không tải được dữ liệu!');
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setCurrentPage(1); },
    [searchTerm, filterMovie, filterCinema, filterDate, statusFilter, activeTab]);

  // ── Filter & Page ────────────────────────────────────────────
  const filteredData = (activeTab === 'movies' ? movies : showtimes).filter(item => {
    if (activeTab === 'movies') {
      const matchName   = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
      // Gộp ENDED + STOPPED cùng bucket "ENDED" để filter đúng
      const itemStatus  = item.status === 'STOPPED' ? 'ENDED' : item.status;
      const matchStatus = statusFilter === 'ALL' || itemStatus === statusFilter;
      return matchName && matchStatus;
    } else {
      const matchMovie  = !filterMovie  || item.movie?.id?.toString() === filterMovie;
      const matchCinema = !filterCinema || item.hall?.cinema?.id?.toString() === filterCinema;
      const matchDate   = !filterDate   || item.startTime?.startsWith(filterDate);
      return matchMovie && matchCinema && matchDate;
    }
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const pagedData  = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── Genre helpers ─────────────────────────────────────────────
  const getGenreArray = (form) =>
    form.genre ? form.genre.split(',').map(g => g.trim()).filter(Boolean) : [];

  const handleGenreToggle = (g) => {
    let arr = getGenreArray(movieForm);
    arr = arr.includes(g) ? arr.filter(x => x !== g) : [...arr, g];
    setMovieForm(f => ({ ...f, genre: arr.join(', ') }));
  };

  // ── Showtime change ──────────────────────────────────────────
  const handleShowtimeChange = (e) => {
    const { name, value } = e.target;
    let next = { ...showtimeForm, [name]: value };
    if (name === 'cinemaId') next.hallId = '';
    if (name === 'startTime' || name === 'movieId') {
      const sel = movies.find(m => m.id.toString() === next.movieId);
      if (sel && next.startTime) {
        const d = new Date(next.startTime);
        d.setMinutes(d.getMinutes() + (Number(sel.duration) || 120));
        next.endTime = new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      }
    }
    setShowtimeForm(next);
  };

  // ── SUBMIT MOVIE ─────────────────────────────────────────────
  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // ✅ FIX CHÍNH: Build payload sạch — chỉ gửi đúng những field BE cần
    // Không gửi object lồng nhau (genres array, country object...) — chỉ gửi primitive
    const payload = {
      title:         movieForm.title,
      slug:          movieForm.slug || toSlug(movieForm.title),
      duration:      Number(movieForm.duration),
      releaseDate:   movieForm.releaseDate,
      // ✅ Dùng ENDED thay STOPPED vì BE enum có ENDED
      // (nếu BE có STOPPED thì đổi lại thành STOPPED)
      status:        movieForm.status === 'STOPPED' ? 'ENDED' : movieForm.status,
      posterUrl:     movieForm.posterUrl,
      bannerUrl:     movieForm.bannerUrl,
      trailerUrl:    movieForm.trailerUrl,
      language:      movieForm.language,
      rated:         movieForm.rated,
      director:      movieForm.director,
      castMembers:   movieForm.castMembers,
      description:   movieForm.description,
      averageRating: Number(movieForm.averageRating) || 0,
      countryId:     movieForm.countryId || 1,
      // Genre: gửi dạng string hoặc array tùy BE bạn đang nhận
      genre:         movieForm.genre,
    };

    try {
      if (editingId) {
        await movieApi.updateMovie(editingId, payload);
        toast.success('Cập nhật phim thành công!');
      } else {
        await movieApi.createMovie(payload);
        toast.success('Thêm phim thành công!');
      }
      setIsMovieModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Lỗi save movie:', err);
      // In lỗi chi tiết từ BE để dễ debug
      const msg = err.response?.data?.message || err.message || 'Lỗi không xác định';
      toast.error(`Lỗi: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // ── SUBMIT SHOWTIME ───────────────────────────────────────────
  const handleShowtimeSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      movieId:   Number(showtimeForm.movieId),
      hallId:    Number(showtimeForm.hallId),
      startTime: showtimeForm.startTime,
      endTime:   showtimeForm.endTime,
      basePrice: Number(showtimeForm.basePrice),
      language:  showtimeForm.language,
      subtitle:  showtimeForm.subtitle,
      isActive:  showtimeForm.isActive,
    };
    try {
      if (editingId) await showtimeApi.updateShowtime(editingId, payload);
      else await showtimeApi.createShowtime(payload);
      toast.success('Lưu lịch chiếu thành công!');
      setIsShowtimeModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi không xác định';
      toast.error(`Lỗi: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // ── TOGGLE STATUS ─────────────────────────────────────────────
  const handleToggleStatus = async (movie) => {
    // Nếu đang chiếu → ENDED, còn lại → NOW_SHOWING
    const newStatus = (movie.status === 'NOW_SHOWING') ? 'ENDED' : 'NOW_SHOWING';
    try {
      await movieApi.updateMovie(movie.id, { ...movie, status: newStatus });
      toast.success(`Đã chuyển trạng thái thành ${newStatus === 'ENDED' ? 'Ngừng chiếu' : 'Đang chiếu'}!`);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Lỗi đổi trạng thái: ${msg}`);
    }
  };

  // ── DELETE SHOWTIME ───────────────────────────────────────────
  const handleDeleteShowtime = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch chiếu này?')) return;
    try {
      await showtimeApi.deleteShowtime(id);
      toast.success('Đã xóa lịch chiếu!');
      fetchData();
    } catch {
      toast.error('Lỗi xóa! Có thể dữ liệu đang bị ràng buộc.');
    }
  };

  // ── Open modals ───────────────────────────────────────────────
  const openAddMovie = () => {
    setEditingId(null);
    setMovieForm(EMPTY_MOVIE);
    setIsMovieModalOpen(true);
  };

  const openEditMovie = (item) => {
    setEditingId(item.id);
    const genreString = Array.isArray(item.genres)
      ? item.genres.map(g => g.name || g).join(', ')
      : (item.genre || '');
    setMovieForm({ ...EMPTY_MOVIE, ...item, genre: genreString });
    setIsMovieModalOpen(true);
  };

  const openAddShowtime = () => {
    setEditingId(null);
    setShowtimeForm(EMPTY_SHOWTIME);
    setIsShowtimeModalOpen(true);
  };

  const openEditShowtime = (item) => {
    setEditingId(item.id);
    setShowtimeForm({
      ...EMPTY_SHOWTIME, ...item,
      movieId:   item.movie?.id  || '',
      cinemaId:  item.hall?.cinema?.id || '',
      hallId:    item.hall?.id   || '',
      startTime: item.startTime?.slice(0, 16) || '',
      endTime:   item.endTime?.slice(0, 16)   || '',
    });
    setIsShowtimeModalOpen(true);
  };

  const filteredHallsForForm = halls.filter(
    h => h.cinema?.id?.toString() === showtimeForm.cinemaId
  );

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 pb-10">

      {/* ── HEADER TABS ── */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Phim & Lịch chiếu</h1>
          <button
            onClick={activeTab === 'movies' ? openAddMovie : openAddShowtime}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
          >
            <Plus size={20} />
            <span>Thêm {activeTab === 'movies' ? 'Phim' : 'Lịch'} Mới</span>
          </button>
        </div>
        <div className="flex gap-4 border-b">
          {[
            { key: 'movies',    icon: <Film size={18} />,        label: 'Danh sách Phim' },
            { key: 'showtimes', icon: <CalendarDays size={18} />, label: 'Lịch chiếu' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-2 font-medium transition-colors
                ${activeTab === tab.key ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        {activeTab === 'movies' ? (
          <>
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Tìm kiếm theo tên phim..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white outline-none focus:border-red-500 min-w-[200px]">
              <option value="ALL">Tất cả trạng thái</option>
              <option value="NOW_SHOWING">Đang chiếu</option>
              <option value="COMING_SOON">Sắp chiếu</option>
              <option value="ENDED">Ngừng chiếu</option>
            </select>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Filter size={18} /> Lọc:
            </div>
            <select value={filterMovie} onChange={e => setFilterMovie(e.target.value)}
              className="border p-2 rounded-lg bg-gray-50 outline-none">
              <option value="">Tất cả Phim</option>
              {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
            <select value={filterCinema} onChange={e => setFilterCinema(e.target.value)}
              className="border p-2 rounded-lg bg-gray-50 outline-none">
              <option value="">Tất cả Rạp</option>
              {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="border p-2 rounded-lg bg-gray-50 outline-none" title="Lọc theo ngày chiếu" />
            {(filterMovie || filterCinema || filterDate) && (
              <button onClick={() => { setFilterMovie(''); setFilterCinema(''); setFilterDate(''); }}
                className="text-sm text-red-500 hover:underline">
                Xoá bộ lọc
              </button>
            )}
          </>
        )}
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600 text-sm uppercase">
              <th className="p-4">{activeTab === 'movies' ? 'Poster' : 'Phim'}</th>
              <th className="p-4">{activeTab === 'movies' ? 'Tên Phim' : 'Thời gian'}</th>
              <th className="p-4">{activeTab === 'movies' ? 'Trạng thái' : 'Phòng / Rạp'}</th>
              <th className="p-4">{activeTab === 'movies' ? 'Ngày chiếu' : 'Loại / Phụ đề'}</th>
              <th className="p-4">{activeTab === 'movies' ? 'Rating / Thời lượng' : 'Giá gốc'}</th>
              <th className="p-4 text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagedData.length > 0 ? pagedData.map(item => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.ENDED;
              const isEnded = item.status === 'ENDED' || item.status === 'STOPPED';

              return (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isEnded && activeTab === 'movies' ? 'opacity-70' : ''}`}>

                  {/* Col 1 */}
                  <td className="p-4">
                    {activeTab === 'movies'
                      ? <img src={item.posterUrl || 'https://placehold.co/100x150?text=No+Poster'}
                          alt="poster" className="w-12 h-16 object-cover rounded shadow-sm"
                          onError={e => { e.target.src = 'https://placehold.co/100x150?text=No+Poster'; }} />
                      : <div className="font-bold text-gray-800 line-clamp-2 max-w-[200px]">
                          {item.movie?.title || <span className="text-red-400 italic">Phim đã xóa</span>}
                        </div>
                    }
                  </td>

                  {/* Col 2 */}
                  <td className="p-4 font-medium">
                    {activeTab === 'movies'
                      ? <div>
                          <p className="font-bold text-gray-800">{item.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.director}</p>
                        </div>
                      : <div>
                          <div className="text-blue-600 font-bold">
                            {new Date(item.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.startTime).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                    }
                  </td>

                  {/* Col 3 */}
                  <td className="p-4">
                    {activeTab === 'movies'
                      ? <span className={`px-2 py-1 rounded text-xs font-semibold ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      : <div className="text-sm">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                            {item.hall?.name}
                          </span>
                          <div className="text-gray-500 text-xs mt-1 truncate max-w-[150px]">
                            {item.hall?.cinema?.name}
                          </div>
                        </div>
                    }
                  </td>

                  {/* Col 4 */}
                  <td className="p-4 text-sm text-gray-600">
                    {activeTab === 'movies'
                      ? item.releaseDate
                      : <div className="flex flex-col gap-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 w-fit rounded">{item.language}</span>
                          <span className="text-xs italic text-gray-500">{item.subtitle}</span>
                        </div>
                    }
                  </td>

                  {/* Col 5 */}
                  <td className="p-4">
                    {activeTab === 'movies'
                      ? <div className="flex flex-col">
                          <span className="text-yellow-500 font-medium">⭐ {item.averageRating || '0.0'}/10</span>
                          <span className="text-gray-500 text-xs">{item.duration} phút</span>
                        </div>
                      : <span className="text-red-600 font-bold">
                          {Number(item.basePrice).toLocaleString('vi-VN')}đ
                        </span>
                    }
                  </td>

                  {/* Col 6: Actions */}
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => activeTab === 'movies' ? openEditMovie(item) : openEditShowtime(item)}
                        className="text-blue-500 bg-blue-50 p-2 rounded hover:bg-blue-100 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>

                      {/* Toggle status (phim) / Delete (showtime) */}
                      {activeTab === 'movies' ? (
                        <button
                          onClick={() => handleToggleStatus(item)}
                          title={isEnded ? 'Phát hành lại' : 'Ngừng chiếu'}
                          className={`p-2 rounded transition-colors border ${
                            isEnded
                              ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                              : item.status === 'NOW_SHOWING'
                                ? 'border-green-200 text-green-600 hover:bg-green-50'
                                : 'border-yellow-200 text-yellow-500 hover:bg-yellow-50'
                          }`}
                        >
                          {isEnded ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteShowtime(item.id)}
                          className="text-red-500 bg-red-50 p-2 rounded hover:bg-red-100 transition-colors"
                          title="Xóa lịch chiếu"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-400">
                  Không có dữ liệu phù hợp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg border font-medium text-sm
                ${currentPage === page ? 'bg-red-600 text-white border-red-600' : 'hover:bg-gray-50'}`}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL PHIM
      ══════════════════════════════════════════════════════ */}
      {isMovieModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? '✏️ Cập nhật Phim' : '➕ Thêm Phim Mới'}
              </h2>
              <button onClick={() => setIsMovieModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleMovieSubmit} className="p-6 grid grid-cols-3 gap-5">

              {/* Tên phim */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Tên phim <span className="text-red-500">*</span></label>
                <input required value={movieForm.title}
                  onChange={e => setMovieForm(f => ({
                    ...f, title: e.target.value,
                    slug: editingId ? f.slug : toSlug(e.target.value)
                  }))}
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-1">Slug URL <span className="text-red-500">*</span></label>
                <input required value={movieForm.slug}
                  onChange={e => setMovieForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full border p-2.5 rounded-lg outline-none text-sm font-mono" />
              </div>

              {/* Đạo diễn */}
              <div>
                <label className="block text-sm font-medium mb-1">Đạo diễn</label>
                <input value={movieForm.director}
                  onChange={e => setMovieForm(f => ({ ...f, director: e.target.value }))}
                  className="w-full border p-2.5 rounded-lg outline-none" />
              </div>

              {/* Thể loại */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Thể loại (chọn nhiều)</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_GENRES.map(g => {
                    const selected = getGenreArray(movieForm).includes(g);
                    return (
                      <label key={g}
                        className={`px-3 py-1.5 border rounded-full cursor-pointer text-sm transition-all select-none
                          ${selected
                            ? 'bg-red-600 text-white border-red-600 shadow'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                        <input type="checkbox" className="hidden" checked={selected}
                          onChange={() => handleGenreToggle(g)} />
                        {g}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Diễn viên */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Diễn viên</label>
                <input value={movieForm.castMembers}
                  onChange={e => setMovieForm(f => ({ ...f, castMembers: e.target.value }))}
                  placeholder="Ngăn cách bởi dấu phẩy"
                  className="w-full border p-2.5 rounded-lg outline-none" />
              </div>

              {/* Thời lượng */}
              <div>
                <label className="block text-sm font-medium mb-1">Thời lượng (phút) <span className="text-red-500">*</span></label>
                <input type="number" required min={1} value={movieForm.duration}
                  onChange={e => setMovieForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full border p-2.5 rounded-lg outline-none" />
              </div>

              {/* Ngày khởi chiếu */}
              <div>
                <label className="block text-sm font-medium mb-1">Ngày khởi chiếu <span className="text-red-500">*</span></label>
                <input type="date" required value={movieForm.releaseDate}
                  onChange={e => setMovieForm(f => ({ ...f, releaseDate: e.target.value }))}
                  className="w-full border p-2.5 rounded-lg outline-none" />
              </div>

              {/* Rated */}
              <div>
                <label className="block text-sm font-medium mb-1">Độ tuổi (Rated)</label>
                <select value={movieForm.rated}
                  onChange={e => setMovieForm(f => ({ ...f, rated: e.target.value }))}
                  className="w-full border p-2.5 rounded-lg outline-none bg-white">
                  <option value="P">P — Mọi lứa tuổi</option>
                  <option value="C13">C13 — Trên 13 tuổi</option>
                  <option value="C16">C16 — Trên 16 tuổi</option>
                  <option value="C18">C18 — Trên 18 tuổi</option>
                </select>
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select value={movieForm.status}
                  onChange={e => setMovieForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border p-2.5 rounded-lg outline-none bg-white">
                  <option value="NOW_SHOWING">Đang chiếu</option>
                  <option value="COMING_SOON">Sắp chiếu</option>
                  {/* ✅ FIX: Dùng ENDED — đúng với enum BE */}
                  <option value="ENDED">Ngừng chiếu / Ẩn</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-1">Rating mồi (/10)</label>
                <input type="number" step="0.1" min="0" max="10" value={movieForm.averageRating}
                  onChange={e => setMovieForm(f => ({ ...f, averageRating: e.target.value }))}
                  className="w-full border p-2.5 rounded-lg outline-none" />
              </div>

              {/* Ngôn ngữ */}
              <div>
                <label className="block text-sm font-medium mb-1">Ngôn ngữ</label>
                <input value={movieForm.language}
                  onChange={e => setMovieForm(f => ({ ...f, language: e.target.value }))}
                  className="w-full border p-2.5 rounded-lg outline-none" />
              </div>

              {/* Mô tả */}
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-1">Mô tả phim</label>
                <textarea rows={3} value={movieForm.description}
                  onChange={e => setMovieForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border p-2.5 rounded-lg outline-none resize-none" />
              </div>

              {/* Poster */}
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-1">Link Poster (ảnh dọc)</label>
                <input value={movieForm.posterUrl}
                  onChange={e => setMovieForm(f => ({ ...f, posterUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border p-2.5 rounded-lg outline-none" />
                {movieForm.posterUrl && (
                  <img src={movieForm.posterUrl} alt="preview"
                    className="mt-2 h-24 rounded shadow object-cover"
                    onError={e => { e.target.style.display = 'none'; }} />
                )}
              </div>

              {/* Banner */}
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-1">Link Banner (ảnh ngang)</label>
                <input value={movieForm.bannerUrl}
                  onChange={e => setMovieForm(f => ({ ...f, bannerUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border p-2.5 rounded-lg outline-none" />
              </div>

              {/* Trailer */}
              <div className="col-span-3">
                <label className="block text-sm font-medium mb-1">Link YouTube Trailer</label>
                <input value={movieForm.trailerUrl}
                  onChange={e => setMovieForm(f => ({ ...f, trailerUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full border p-2.5 rounded-lg outline-none" />
              </div>

              {/* Buttons */}
              <div className="col-span-3 flex justify-end gap-3 mt-4 border-t pt-4">
                <button type="button" onClick={() => setIsMovieModalOpen(false)}
                  className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">
                  Hủy
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium
                             disabled:opacity-60 flex items-center gap-2">
                  {saving && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  )}
                  {saving ? 'Đang lưu...' : 'Lưu Thông Tin Phim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL LỊCH CHIẾU
      ══════════════════════════════════════════════════════ */}
      {isShowtimeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingId ? '✏️ Sửa Lịch Chiếu' : '➕ Xếp Lịch Chiếu'}</h2>
              <button onClick={() => setIsShowtimeModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleShowtimeSubmit} className="p-6 space-y-4">

              {/* Phim */}
              <div>
                <label className="block text-sm font-medium mb-1">Chọn Phim <span className="text-red-500">*</span></label>
                <select required name="movieId" value={showtimeForm.movieId}
                  onChange={handleShowtimeChange}
                  className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">-- Chọn Phim --</option>
                  {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>

              {/* Rạp + Phòng */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Chọn Rạp <span className="text-red-500">*</span></label>
                  <select required name="cinemaId" value={showtimeForm.cinemaId}
                    onChange={handleShowtimeChange}
                    className="w-full border p-2.5 rounded-lg bg-white outline-none">
                    <option value="">-- Chọn Rạp --</option>
                    {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chọn Phòng <span className="text-red-500">*</span></label>
                  <select required name="hallId" value={showtimeForm.hallId}
                    onChange={handleShowtimeChange}
                    disabled={!showtimeForm.cinemaId}
                    className="w-full border p-2.5 rounded-lg bg-white outline-none disabled:opacity-50 disabled:bg-gray-100">
                    <option value="">-- Chọn Phòng --</option>
                    {filteredHallsForForm.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Thời gian */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bắt đầu <span className="text-red-500">*</span></label>
                  <input type="datetime-local" required name="startTime"
                    value={showtimeForm.startTime} onChange={handleShowtimeChange}
                    className="w-full border p-2.5 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kết thúc (tự tính)</label>
                  <input type="datetime-local" name="endTime" value={showtimeForm.endTime}
                    readOnly className="w-full border p-2.5 rounded-lg bg-gray-50 text-gray-500 outline-none" />
                </div>
              </div>

              {/* Âm thanh + Phụ đề */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Âm thanh</label>
                  <input name="language" value={showtimeForm.language}
                    onChange={handleShowtimeChange} placeholder="Tiếng Anh / Tiếng Việt"
                    className="w-full border p-2.5 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phụ đề / Định dạng</label>
                  <input name="subtitle" value={showtimeForm.subtitle}
                    onChange={handleShowtimeChange} placeholder="Phụ đề Tiếng Việt"
                    className="w-full border p-2.5 rounded-lg outline-none" />
                </div>
              </div>

              {/* Giá */}
              <div>
                <label className="block text-sm font-medium mb-1">Giá vé gốc (VNĐ) <span className="text-red-500">*</span></label>
                <input type="number" required name="basePrice" min={1000}
                  value={showtimeForm.basePrice} onChange={handleShowtimeChange}
                  className="w-full border p-2.5 rounded-lg outline-none" />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsShowtimeModalOpen(false)}
                  className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">
                  Hủy
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium
                             disabled:opacity-60 flex items-center gap-2">
                  {saving && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  )}
                  {saving ? 'Đang lưu...' : 'Lưu Lịch Chiếu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}