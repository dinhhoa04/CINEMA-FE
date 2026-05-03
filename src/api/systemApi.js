import axiosInstance from './axiosInstance';

export const systemApi = {
    getCities: () => axiosInstance.get('/system/cities'),
    getCinemaChains: () => axiosInstance.get('/system/cinema-chains'),
    getCinemasByChain: (chainId) => axiosInstance.get(`/system/cinemas?chainId=${chainId}`),
    getCinemaById: (id) => axiosInstance.get(`/system/cinemas/${id}`)
};