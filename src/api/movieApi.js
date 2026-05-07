import axiosInstance from './axiosInstance';

export const movieApi = {
    getNowShowing: () => axiosInstance.get('/movies/now-showing'),
    getComingSoon: () => axiosInstance.get('/movies/coming-soon'),
    getMovieBySlug: (slug) => axiosInstance.get(`/movies/${slug}`),
    
};