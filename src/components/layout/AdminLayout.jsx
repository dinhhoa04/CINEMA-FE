import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, Film, MonitorPlay, Popcorn, Tag, Ticket, Users, LogOut, Menu
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout(); // 1. Xóa sạch dữ liệu trong Zustand/LocalStorage
    navigate('/login'); // 2. Đẩy về trang đăng nhập
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';
  const perms = user?.permissions || ''; // Lấy chuỗi "MOVIES,FOOD" từ Zustand

  const menuItems = [
    { name: "Tổng quan", path: "/admin", icon: <LayoutDashboard size={20} />, req: 'ALL' },
    { name: "Quản lý Rạp & Phòng", path: "/admin/cinemas", icon: <MonitorPlay size={20} />, req: 'CINEMAS' },
    { name: "Quản lý Phim & Lịch", path: "/admin/movies", icon: <Film size={20} />, req: 'MOVIES' },
    { name: "Quản lý Đồ ăn (F&B)", path: "/admin/food", icon: <Popcorn size={20} />, req: 'FOOD' },
    { name: "Quản lý Đơn vé", path: "/admin/bookings", icon: <Ticket size={20} />, req: 'BOOKINGS' },
    // Các menu nhạy cảm dưới đây chỉ Admin mới thấy
    { name: "Quản lý Khuyến mãi", path: "/admin/promotions", icon: <Tag size={20} />, req: 'ADMIN_ONLY' },
    { name: "Quản lý Người dùng", path: "/admin/users", icon: <Users size={20} />, req: 'ADMIN_ONLY' },
  ];

  // Lọc Menu: Nếu là Admin -> Hiện hết. Nếu là Staff -> Lọc theo mảng "req"
  const visibleMenus = menuItems.filter(item => {
    if (isAdmin) return true; 
    if (item.req === 'ALL') return true; 
    if (item.req === 'ADMIN_ONLY') return false;
    return perms.includes(item.req);
  });
  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white shadow-xl transition-all duration-300 flex flex-col`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <span className="text-3xl font-extrabold text-red-600 tracking-tight">
            {isSidebarOpen ? "CineAdmin" : "CA"}
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {visibleMenus.map((item, index) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors text-lg ${
                      isActive ? "bg-red-50 text-red-600 font-bold" : "text-gray-600 hover:bg-gray-100 hover:text-red-500"
                    }`}
                  >
                    <span className={`${isActive ? "text-red-600" : "text-gray-500"}`}>{item.icon}</span>
                    {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Đã trang trí lại nút Đăng xuất cho đẹp và chuẩn UI */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg transition-colors text-lg text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <span className="text-gray-500 hover:text-red-600"><LogOut size={20} /></span>
            {isSidebarOpen && <span className="ml-3 font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-sm text-right hidden sm:block">
              <p className="text-xl font-bold text-gray-900">Quản trị viên</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">AD</div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;