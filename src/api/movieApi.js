import axiosInstance from './axiosInstance';

export const movieApi = {
    getNowShowing: () => axiosInstance.get('/movies/now-showing'),
    getComingSoon: () => axiosInstance.get('/movies/coming-soon'),
    getMovieBySlug: (slug) => axiosInstance.get(`/movies/${slug}`),
    
    // Admin
    getAllMovies: () => axiosInstance.get('/movies/all'),
    createMovie: (data) => axiosInstance.post('/movies', data),
    updateMovie: (id, data) => axiosInstance.put(`/movies/${id}`, data),
    deleteMovie: (id) => axiosInstance.delete(`/movies/${id}`),
};