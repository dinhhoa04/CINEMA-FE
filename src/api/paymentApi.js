// src/api/paymentApi.js
import axiosInstance from './axiosInstance';

export const paymentApi = {
    // Tạo link MoMo
    createMomoPayment: (bookingCode) =>
        axiosInstance.post(`/payments/momo/create?bookingCode=${bookingCode}`),

    // Kiểm tra trạng thái sau khi redirect về
    checkStatus: (bookingCode) =>
        axiosInstance.get(`/payments/status/${bookingCode}`),
};