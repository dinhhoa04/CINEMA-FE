import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-dark border-b border-card">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link to="/" className="text-4xl font-bold text-primary">
            Cine<span className="text-accent">Book</span>
          </Link>
          
          {/* Menu chính */}
          <ul className="hidden md:flex space-x-6 text-lg items-center">
            <li><Link to="/" className="hover:text-primary transition-all font-medium">Trang chủ</Link></li>
            
            {/* Mục Phim có Dropdown */}
            <li className="relative group py-4">
              <Link to="/movies" className="hover:text-primary transition-all font-medium flex items-center gap-1">
                Phim <i className="fas fa-chevron-down text-xs"></i>
              </Link>
              {/* Menu xổ xuống (ẩn đi, chỉ hiện khi hover) */}
              <div className="absolute top-full left-0 mt-0 w-48 bg-[#1A1A1A] border border-gray-800 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                <div className="py-2">
                  <Link to="/movies?tab=now-showing" className="block px-4 py-2 hover:bg-primary/20 hover:text-primary transition-colors text-sm font-bold text-gray-300">Phim Đang Chiếu</Link>
                  <Link to="/movies?tab=coming-soon" className="block px-4 py-2 hover:bg-primary/20 hover:text-primary transition-colors text-sm font-bold text-gray-300">Phim Sắp Chiếu</Link>
                </div>
              </div>
            </li>

            <li><Link to="/cinemas" className="hover:text-primary transition-all font-medium">Rạp</Link></li>
            
            {/* Đổi tên thành Tin Mới & Ưu Đãi, đổi màu nhấn */}
            <li><Link to="/promotions" className="hover:text-primary transition-all font-medium text-accent">Tin Mới & Ưu Đãi</Link></li>
          </ul>
        </div>

        <div className="flex items-center space-x-5">
          {/* Icon tìm kiếm */}
          <button className="p-3 rounded-full hover:bg-card transition-all text-lg">
            <i className="fas fa-search"></i>
          </button>
          
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              
              {/* KIỂM TRA ROLE: Nếu là Admin hoặc Staff thì hiện nút "Trang Quản trị", ngược lại hiện "Profile" */}
              {user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' || user?.role === 'STAFF' || user?.role === 'ROLE_STAFF' ? (
                <Link to="/admin" className="px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-full transition-all flex items-center gap-2">
                  <i className="fas fa-shield-alt"></i> Vào trang Quản trị
                </Link>
              ) : (
                <Link to="/profile" className="text-lg hover:text-primary transition-colors cursor-pointer flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span>Chào, <span className="text-accent font-medium">{user?.fullName}</span></span>
                </Link>
              )}
              
              {/* Nút Đăng xuất */}
              <button onClick={handleLogout} className="px-6 py-2.5 text-lg font-medium bg-card hover:bg-primary rounded-full transition-all">
                Đăng xuất
              </button>
            </div>
          ) : (
            /* Nút Đăng nhập */
            <Link to="/login" className="px-6 py-2.5 text-lg font-medium bg-primary rounded-full hover:bg-opacity-90 transition-all">
              Đăng nhập
            </Link>
          )}

          {/* Icon menu trên mobile */}
          <button className="md:hidden p-3">
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </div>
      </nav>
    </header>
  );
}