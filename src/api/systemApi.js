import axiosInstance from './axiosInstance';

export const systemApi = {
    getCities: () => axiosInstance.get('/system/cities'),
    getCinemaChains: () => axiosInstance.get('/system/cinema-chains'),
};