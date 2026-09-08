import api from '../api';
import { AttendanceData, AttendanceResponse } from '../../types/attendance';

export const getTodayStatus = async (): Promise<AttendanceData | null> => {
    try {
        const response = await api.get<{ data: AttendanceData | null }>('/attendance/today');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching today status', error);
        throw error;
    }
};

export const getAttendanceHistory = async (page: number = 1): Promise<AttendanceResponse> => {
    try {
        const response = await api.get<AttendanceResponse>(`/attendance?page=${page}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching attendance history', error);
        throw error;
    }
};

export const checkIn = async (data: { latitude?: number; longitude?: number; notes?: string }): Promise<{ message: string; data: AttendanceData }> => {
    try {
        const response = await api.post('/attendance/check-in', data);
        return response.data;
    } catch (error) {
        console.error('Error checking in', error);
        throw error;
    }
};
