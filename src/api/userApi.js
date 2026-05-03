import axiosInstance from './axiosInstance';

export const userApi = {
    getBookingHistory: () => axiosInstance.get('/bookings/history'),
    changePassword: (data) => axiosInstance.put('/users/change-password', data),
    
    // BỔ SUNG DÒNG NÀY:
    updateProfile: (data) => axiosInstance.put('/users/profile', data)
};