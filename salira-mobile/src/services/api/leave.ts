import api from '../api';
import { Leave, PaginationMeta } from '../../types';

export const leaveService = {
    getAll: async (status?: string): Promise<{ data: Leave[]; meta: PaginationMeta }> => {
        const res = await api.get('/leaves', { params: status ? { status } : {} });
        return res.data;
    },
    create: async (payload: { type: string; start_date: string; end_date: string; reason: string }) => {
        const res = await api.post('/leaves', payload);
        return res.data;
    },
    delete: async (id: number) => {
        const res = await api.delete(`/leaves/${id}`);
        return res.data;
    },
};
