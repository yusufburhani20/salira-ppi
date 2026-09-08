import api from '../api';
import { Agenda, AgendaStudent, AcademicClass, Subject } from '../../types';

export const agendaService = {
    getAll: async (filters?: { academic_class_id?: number; start_date?: string; end_date?: string }) => {
        const res = await api.get('/agendas', { params: filters });
        return res.data;
    },
    getOne: async (id: number) => {
        const res = await api.get(`/agendas/${id}`);
        return res.data.data as Agenda;
    },
    getStudents: async (id: number): Promise<AgendaStudent[]> => {
        const res = await api.get(`/agendas/${id}/students`);
        return res.data.data;
    },
    getFormData: async (): Promise<{ classes: AcademicClass[]; subjects: Subject[] }> => {
        const res = await api.get('/agendas/form-data');
        return res.data;
    },
    create: async (payload: {
        academic_class_id: number;
        subject_id: number;
        date: string;
        lesson_hour_start: number;
        lesson_hour_end: number;
        topic: string;
        notes?: string;
        attendances?: { student_id: number; status: string }[];
    }) => {
        const res = await api.post('/agendas', payload);
        return res.data;
    },
    delete: async (id: number) => {
        const res = await api.delete(`/agendas/${id}`);
        return res.data;
    },
};
