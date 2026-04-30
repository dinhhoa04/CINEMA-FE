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
      {/* Đổi py-3 thành py-5 để tăng độ dày cho Navbar */}
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          {/* Tăng kích thước logo từ text-2xl lên text-3xl */}
          <Link to="/" className="text-4xl font-bold text-primary">
            Cine<span className="text-accent">Book</span>
          </Link>
          
          {/* Thêm text-lg để tăng kích thước chữ cho các mục menu */}
          <ul className="hidden md:flex space-x-6 text-lg">
            <li><Link to="/" className="hover:text-primary transition-all">Trang chủ</Link></li>
            <li><Link to="/movies" className="hover:text-primary transition-all">Phim</Link></li>
            <li><Link to="/cinemas" className="hover:text-primary transition-all">Rạp</Link></li>
            <li><Link to="/promotions" className="hover:text-primary transition-all">Khuyến mãi</Link></li>
          </ul>
        </div>

        <div className="flex items-center space-x-5">
          {/* Tăng kích thước vùng bấm của icon tìm kiếm */}
          <button className="p-3 rounded-full hover:bg-card transition-all text-lg">
            <i className="fas fa-search"></i>
          </button>
          
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Tăng kích thước chữ chào mừng lên text-base hoặc text-lg */}
              <span className="text-lg">Chào, <span className="text-accent font-medium">{user?.fullName}</span></span>
              
              {/* Làm nút Đăng xuất to hơn */}
              <button onClick={handleLogout} className="px-6 py-2.5 text-lg font-medium bg-card hover:bg-primary rounded-full transition-all">
                Đăng xuất
              </button>
            </div>
          ) : (
            /* Làm nút Đăng nhập to hơn */
            <Link to="/login" className="px-6 py-2.5 text-lg font-medium bg-primary rounded-full hover:bg-opacity-90 transition-all">
              Đăng nhập
            </Link>
          )}

          {/* Tăng kích thước icon menu trên mobile */}
          <button className="md:hidden p-3">
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </div>
      </nav>
    </header>
  );
}