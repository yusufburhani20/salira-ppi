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

export const checkIn = async (data: { latitude?: number; longitude?: number; notes?: string; photoUri?: string }): Promise<{ message: string; data: AttendanceData }> => {
    try {
        const formData = new FormData();
        if (data.latitude) formData.append('latitude', String(data.latitude));
        if (data.longitude) formData.append('longitude', String(data.longitude));
        if (data.notes) formData.append('notes', data.notes);
        
        if (data.photoUri) {
            const filename = data.photoUri.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;
            formData.append('photo', { uri: data.photoUri, name: filename, type } as any);
        }

        const response = await api.post('/attendance/check-in', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
