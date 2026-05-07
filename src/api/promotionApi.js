import axiosInstance from './axiosInstance';

export const promotionApi = {
    // API Public
    applyCode: (data) => axiosInstance.post('/promotions/apply', data),
    getActivePromotions: () => axiosInstance.get('/promotions/active'),
    
    // API Admin
    getAllPromotions: () => axiosInstance.get('/promotions'),
    createPromotion: (data) => axiosInstance.post('/promotions', data),
    updatePromotion: (id, data) => axiosInstance.put(`/promotions/${id}`, data),
    deletePromotion: (id) => axiosInstance.delete(`/promotions/${id}`),
};