import axiosInstance from './axiosInstance';

export const userApi = {
    // --- CÁC HÀM CỦA USER ---
    getBookingHistory: () => axiosInstance.get('/bookings/history'),
    changePassword: (data) => axiosInstance.put('/users/change-password', data),
    updateProfile: (data) => axiosInstance.put('/users/profile', data),

    // --- CÁC HÀM CỦA ADMIN (Đã chốt chuẩn, không cần đổi nữa) ---
    getAllUsers: () => axiosInstance.get('/users'),
    
    // ĐÂY CHÍNH LÀ DÒNG BẠN ĐANG THIẾU GÂY RA LỖI:
    getRoles: () => axiosInstance.get('/users/roles'), 
    
    createUser: (data) => axiosInstance.post('/users', data),
    updateRole: (userId, roleId) => axiosInstance.patch(`/users/${userId}/role`, { roleId }),
    toggleLockUser: (id) => axiosInstance.delete(`/users/${id}`),
    resetPassword: (id, newPassword) => axiosInstance.put(`/users/${id}/reset-password`, { newPassword }),
    // Lấy danh sách vé của 1 người dùng cụ thể
    getUserBookings: (userId) => axiosInstance.get(`/users/${userId}/bookings`),
};