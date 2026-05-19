import axiosInstance from './axiosInstance';

export const dashboardApi = {
    getOverview: () => axiosInstance.get('/dashboard'),
};