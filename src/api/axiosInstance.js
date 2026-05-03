import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Trạm kiểm soát ĐẦU RA (Gắn token vào mỗi request gửi lên Backend)
axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Trạm kiểm soát ĐẦU VÀO (Xử lý lỗi Token khi Backend trả về)
axiosInstance.interceptors.response.use(
    (response) => response.data, // Chỉ lấy phần data nếu gọi API thành công
    (error) => {
        // Mở rộng lưới bắt lỗi: Bắt cả 401 (Chưa xác thực) và 403 (Hết hạn token/Cấm)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.warn("Phiên đăng nhập hết hạn. Đang dọn dẹp và đá văng ra ngoài...");
            
            // Xóa sạch dữ liệu user cũ đang bị kẹt trong bộ nhớ
            useAuthStore.getState().logout();
            
            // Điều hướng thẳng về trang đăng nhập
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;