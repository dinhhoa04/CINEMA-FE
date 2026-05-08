import axiosInstance from './axiosInstance';

export const foodApi = {
    // API Public
    getAllActiveFoods: () => axiosInstance.get('/foods/active'),
    
    // API Admin
    getAllFoods: () => axiosInstance.get('/foods'),
    getCategories: () => axiosInstance.get('/foods/categories'),
    createFood: (data) => axiosInstance.post('/foods', data),
    updateFood: (id, data) => axiosInstance.put(`/foods/${id}`, data),
    deleteFood: (id) => axiosInstance.delete(`/foods/${id}`),
};