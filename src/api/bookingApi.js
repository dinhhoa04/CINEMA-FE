import axiosInstance from './axiosInstance';

export const bookingApi = {
    createBooking: (data) => axiosInstance.post('/bookings', data),
};