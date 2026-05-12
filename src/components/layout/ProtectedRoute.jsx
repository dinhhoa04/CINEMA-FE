import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ children, requireAdmin }) {
  // Lấy thông tin user và token hiện tại trong máy
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // 1. Nếu không có token (Chưa đăng nhập / Đã đăng xuất) -> Túm cổ ném về /login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu trang này yêu cầu quyền Admin, nhưng user lại là Khách hàng -> Đá văng về Trang chủ
  if (requireAdmin && user.role !== 'ADMIN' && user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  // 3. Nếu xét duyệt OK hết -> Mở cửa cho vào
  return children;
}