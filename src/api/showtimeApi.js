import axiosInstance from './axiosInstance';

export const showtimeApi = {
    getShowtimes: (movieId, date, city, chain) => axiosInstance.get(`/showtimes/search?movieId=${movieId}&date=${date}&city=${city}&chain=${chain}`),
    getBookingData: (showtimeId) => axiosInstance.get(`/showtimes/${showtimeId}/booking-data`),
    getShowtimesByCinema: (cinemaId, date) => axiosInstance.get(`/showtimes/by-cinema?cinemaId=${cinemaId}&date=${date}`),

    // Admin
    getAllShowtimes: () => axiosInstance.get('/showtimes/all'),
    createShowtime: (data) => axiosInstance.post('/showtimes', data),
    updateShowtime: (id, data) => axiosInstance.put(`/showtimes/${id}`, data),
    deleteShowtime: (id) => axiosInstance.delete(`/showtimes/${id}`)
};