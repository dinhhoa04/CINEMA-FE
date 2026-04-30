import axiosInstance from './axiosInstance';

export const showtimeApi = {
    // Đã nâng cấp API: Gửi đủ 4 tham số xuống Spring Boot
    getShowtimes: (movieId, date, city, chain) => 
        axiosInstance.get(`/showtimes/search?movieId=${movieId}&date=${date}&city=${city}&chain=${chain}`),
};