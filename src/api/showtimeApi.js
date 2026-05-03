import axiosInstance from './axiosInstance';

export const showtimeApi = {
    // 1. API CŨ CỦA ANH (Giữ nguyên không đụng tới)
    getShowtimes: (movieId, date, city, chain) => 
        axiosInstance.get(`/showtimes/search?movieId=${movieId}&date=${date}&city=${city}&chain=${chain}`),

    getBookingData: (showtimeId) => axiosInstance.get(`/showtimes/${showtimeId}/booking-data`),
    getShowtimesByCinema: (cinemaId, date) => axiosInstance.get(`/showtimes/by-cinema?cinemaId=${cinemaId}&date=${date}`)
};