import axiosInstance from './axiosInstance';

export const movieApi = {
    getNowShowing: () => axiosInstance.get('/movies/now-showing'),
    getMovieBySlug: (slug) => axiosInstance.get(`/movies/${slug}`),
};