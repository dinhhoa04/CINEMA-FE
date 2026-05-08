import axiosInstance from './axiosInstance';

export const seatApi = {
    getSeatTypes: () => axiosInstance.get('/seats/types'),
    getSeatsByHall: (hallId) => axiosInstance.get(`/seats/hall/${hallId}`),
    saveSeatMap: (hallId, data) => axiosInstance.post(`/seats/hall/${hallId}/bulk`, data)
};