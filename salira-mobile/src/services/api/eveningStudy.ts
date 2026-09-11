import api from '../api';

export const eveningStudyService = {
    getAll: async (params?: { academic_class_id?: number; start_date?: string; end_date?: string }) => {
        const res = await api.get('/evening-studies', { params });
        return res.data;
    },

    getFormData: async () => {
        const res = await api.get('/evening-studies/form-data');
        return res.data;
    },

    getStudents: async (classId: number) => {
        const res = await api.get(`/evening-studies/students/${classId}`);
        return res.data.data;
    },

    getDetail: async (id: number) => {
        const res = await api.get(`/evening-studies/${id}`);
        return res.data.data;
    },

    create: async (data: {
        date: string;
        academic_class_id: number;
        activity_name: string;
        notes?: string;
        attendance: { student_id: number; status: string; notes?: string }[];
    }) => {
        const res = await api.post('/evening-studies', data);
        return res.data;
    },

    update: async (id: number, data: {
        date: string;
        activity_name: string;
        notes?: string;
        attendance: { student_id: number; status: string; notes?: string }[];
    }) => {
        const res = await api.put(`/evening-studies/${id}`, data);
        return res.data;
    },

    delete: async (id: number) => {
        const res = await api.delete(`/evening-studies/${id}`);
        return res.data;
    },
};
