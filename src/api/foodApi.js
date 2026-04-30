import axiosInstance from './axiosInstance';

export const foodApi = {
    // API lấy danh sách tất cả món ăn đang bán (is_active = 1)
    getAllActiveFoods: () => axiosInstance.get('/foods/active'),
};