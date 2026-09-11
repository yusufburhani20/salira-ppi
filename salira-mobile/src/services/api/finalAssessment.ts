import api from '../api';

export const finalAssessmentService = {
    getAll: async (params?: { academic_class_id?: number; subject_id?: number; semester_id?: number }) => {
        const res = await api.get('/final-assessments', { params });
        return res.data;
    },

    getFormData: async () => {
        const res = await api.get('/final-assessments/form-data');
        return res.data;
    },

    getStudents: async (classId: number) => {
        const res = await api.get(`/final-assessments/students/${classId}`);
        return res.data.data;
    },

    create: async (data: {
        academic_class_id: number;
        subject_id: number;
        date: string;
        type: 'ASAS' | 'ASAT';
        title: string;
        kkm?: number;
        scores: { student_id: number; score: number; notes?: string }[];
    }) => {
        const res = await api.post('/final-assessments', data);
        return res.data;
    },

    update: async (id: number, data: {
        date: string;
        type: 'ASAS' | 'ASAT';
        title: string;
        kkm?: number;
        scores: { student_id: number; score: number; notes?: string }[];
    }) => {
        const res = await api.put(`/final-assessments/${id}`, data);
        return res.data;
    },

    delete: async (id: number) => {
        const res = await api.delete(`/final-assessments/${id}`);
        return res.data;
    },
};
