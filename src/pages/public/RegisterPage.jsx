import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Film } from 'lucide-react';
import { authApi } from '../../api/authApi';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  // Hàm kiểm tra mật khẩu khớp
  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Gọi API Register (không cần gửi confirmPassword lên Server)
      const { confirmPassword, ...registerData } = data;
      await authApi.register(registerData);
      
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      // Backend của mình trả về mảng lỗi Validation rất hay, bắt ở đây
      const errData = error.response?.data;
      if (errData?.data && typeof errData.data === 'object') {
          // Lỗi do nhập thiếu field (Validation)
          const firstError = Object.values(errData.data)[0];
          toast.error(firstError);
      } else {
          // Lỗi như Email trùng
          toast.error(errData?.message || 'Đăng ký thất bại!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700 mt-10 mb-10">
        <div className="text-center mb-8">
          <Film className="w-12 h-12 text-blue-500 mx-auto mb-3" />
          <h2 className="text-3xl font-bold text-white">Tạo tài khoản</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Họ và tên</label>
            <input
              {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
              type="text"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              {...register('email', { 
                  required: 'Vui lòng nhập email',
                  pattern: { value: /^\S+@\S+$/i, message: 'Email không hợp lệ' }
              })}
              type="email"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Số điện thoại</label>
            <input
              {...register('phone', { required: 'Vui lòng nhập SĐT' })}
              type="text"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Mật khẩu</label>
            <input
              {...register('password', { 
                  required: 'Vui lòng nhập mật khẩu',
                  minLength: { value: 6, message: 'Mật khẩu ít nhất 6 ký tự' }
              })}
              type="password"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Xác nhận mật khẩu</label>
            <input
              {...register('confirmPassword', { 
                  validate: value => value === password || 'Mật khẩu không khớp'
              })}
              type="password"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-4 rounded-lg transition-colors flex justify-center items-center"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}