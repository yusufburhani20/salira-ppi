import api from '../api';

export const assessmentService = {
    getAll: async (filters?: { academic_class_id?: number; subject_id?: number }) => {
        const res = await api.get('/assessments', { params: filters });
        return res.data;
    },
    getFormData: async () => {
        const res = await api.get('/assessments/form-data');
        return res.data;
    },
    getStudents: async (classId: number) => {
        const res = await api.get(`/assessments/students/${classId}`);
        return res.data.data;
    },
    create: async (payload: {
        academic_class_id: number;
        subject_id: number;
        date: string;
        type: string;
        title: string;
        kkm?: number;
        scores: { student_id: number; score: number; notes?: string }[];
    }) => {
        const res = await api.post('/assessments', payload);
        return res.data;
    },
    delete: async (id: number) => {
        const res = await api.delete(`/assessments/${id}`);
        return res.data;
    },
};
