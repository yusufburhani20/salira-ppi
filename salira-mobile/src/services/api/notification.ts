import api from '../api';

export const notificationService = {
    getAll: async (page = 1) => {
        const res = await api.get('/notifications', { params: { page } });
        return res.data;
    },
    markAsRead: async (id: string) => {
        const res = await api.post(`/notifications/${id}/read`);
        return res.data;
    },
    markAllAsRead: async () => {
        const res = await api.post('/notifications/read-all');
        return res.data;
    },
};
