import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Film } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.login);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      const responseData = response.data || response;
      const { accessToken, ...userData } = responseData;
      
      setLogin(userData, accessToken);
      toast.success('Đăng nhập thành công!');
      
      // ✅ BƯỚC GÀI BẪY: Ép hệ thống báo cáo chính xác dữ liệu
      const currentRole = userData?.role || userData?.roleName || userData?.user?.role || "Không tìm thấy Role";
      
      

      // Chuyển hướng
      if (
        currentRole === 'ADMIN' || currentRole === 'ROLE_ADMIN' || 
        currentRole === 'STAFF' || currentRole === 'ROLE_STAFF'
      ) {
        navigate('/admin'); 
      } else {
        navigate('/'); 
      }
      
    } catch (error) {
        const errorMsg = error.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác!';
        toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <Film className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-white">Đăng nhập</h2>
          <p className="text-gray-400 mt-2">Chào mừng trở lại với Cinema!</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              {...register('email', { required: 'Vui lòng nhập email' })}
              type="email"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nhập email của bạn"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Mật khẩu</label>
            <input
              {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
              type="password"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}