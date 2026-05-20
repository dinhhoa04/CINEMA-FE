import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ children, requireAdmin }) {
  // Lấy thông tin user và token hiện tại trong máy
  const user = useAuthStore((state) => state.user);
  // [ĐÃ FIX] Sửa từ state.token thành state.accessToken cho khớp với authStore.js
  const token = useAuthStore((state) => state.accessToken); 

  // 1. Nếu không có token (Chưa đăng nhập / Đã đăng xuất) -> Túm cổ ném về /login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu trang này yêu cầu quyền Admin, nhưng user lại là Khách hàng -> Đá văng về Trang chủ
  // [ĐÃ FIX] Cho phép cả ADMIN và STAFF được truy cập vào trang Quản trị
  if (requireAdmin && !['ADMIN', 'ROLE_ADMIN', 'STAFF', 'ROLE_STAFF'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Nếu xét duyệt OK hết -> Mở cửa cho vào
  return children;
}