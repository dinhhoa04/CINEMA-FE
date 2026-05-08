import axiosInstance from './axiosInstance';

export const systemApi = {
    // Dropdown Data
    getCities: () => axiosInstance.get('/system/cities'),
    getCinemaChains: () => axiosInstance.get('/system/cinema-chains'),
    getHallTypes: () => axiosInstance.get('/system/hall-types'),
    
    // Cinemas
    getCinemasByChain: (chainId) => axiosInstance.get(`/system/cinemas?chainId=${chainId}`),
    getCinemaById: (id) => axiosInstance.get(`/system/cinemas/${id}`),
    getAllCinemas: () => axiosInstance.get('/system/cinemas/all'),
    createCinema: (data) => axiosInstance.post('/system/cinemas', data),
    updateCinema: (id, data) => axiosInstance.put(`/system/cinemas/${id}`, data),
    deleteCinema: (id) => axiosInstance.delete(`/system/cinemas/${id}`),

    // Halls
    getAllHalls: () => axiosInstance.get('/system/halls'),
    createHall: (data) => axiosInstance.post('/system/halls', data),
    updateHall: (id, data) => axiosInstance.put(`/system/halls/${id}`, data),
    deleteHall: (id) => axiosInstance.delete(`/system/halls/${id}`)
};