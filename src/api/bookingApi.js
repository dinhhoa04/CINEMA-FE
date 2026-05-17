import axiosInstance from './axiosInstance';

export const bookingApi = {
    createBooking: (data) => axiosInstance.post('/bookings', data),
    getHistory: () => axiosInstance.get('/bookings/history'),
    getAllBookingsAdmin: () => axiosInstance.get('/bookings/admin'),
    checkInTicket: (bookingCode) => axiosInstance.put(`/bookings/${bookingCode}/checkin`),
};