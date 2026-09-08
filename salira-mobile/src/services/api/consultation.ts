import api from '../api';

export const consultationService = {
    getAll: async (filters?: { academic_class_id?: number; category?: string }) => {
        const res = await api.get('/consultations', { params: filters });
        return res.data;
    },
    getFormData: async () => {
        const res = await api.get('/consultations/form-data');
        return res.data;
    },
    getStudents: async (classId: number) => {
        const res = await api.get(`/consultations/students/${classId}`);
        return res.data.data;
    },
    create: async (payload: {
        student_id: number;
        academic_class_id: number;
        consultation_date: string;
        category: string;
        description: string;
        follow_up?: string;
        follow_up_status?: string;
    }) => {
        const res = await api.post('/consultations', payload);
        return res.data;
    },
    update: async (id: number, payload: { description?: string; follow_up?: string; follow_up_status?: string }) => {
        const res = await api.put(`/consultations/${id}`, payload);
        return res.data;
    },
    delete: async (id: number) => {
        const res = await api.delete(`/consultations/${id}`);
        return res.data;
    },
};
