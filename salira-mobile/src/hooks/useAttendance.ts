import { useState, useCallback } from 'react';
import { AttendanceData } from '../types/attendance';
import { getTodayStatus, getAttendanceHistory } from '../services/api/attendance';

export const useAttendance = () => {
    const [todayStatus, setTodayStatus] = useState<AttendanceData | null>(null);
    const [history, setHistory] = useState<AttendanceData[]>([]);
    
    // States
    const [isLoadingToday, setIsLoadingToday] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const fetchTodayStatus = async () => {
        setIsLoadingToday(true);
        try {
            const data = await getTodayStatus();
            setTodayStatus(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memuat status hari ini');
        } finally {
            setIsLoadingToday(false);
        }
    };

    const fetchHistory = async (page: number = 1, isRefresh: boolean = false) => {
        if (isRefresh) {
            setIsRefreshing(true);
        } else if (page === 1) {
            setIsLoadingHistory(true);
        } else {
            setIsFetchingMore(true);
        }

        try {
            const response = await getAttendanceHistory(page);
            
            if (page === 1 || isRefresh) {
                setHistory(response.data);
            } else {
                setHistory(prev => [...prev, ...response.data]);
            }
            
            setCurrentPage(response.meta.current_page);
            setLastPage(response.meta.last_page);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memuat riwayat presensi');
        } finally {
            setIsLoadingHistory(false);
            setIsRefreshing(false);
            setIsFetchingMore(false);
        }
    };

    const refreshData = useCallback(() => {
        fetchTodayStatus();
        fetchHistory(1, true);
    }, []);

    const loadMore = () => {
        if (currentPage < lastPage && !isFetchingMore && !isLoadingHistory) {
            fetchHistory(currentPage + 1);
        }
    };

    const submitCheckIn = async (locationData?: { latitude?: number; longitude?: number; notes?: string; photoUri?: string }) => {
        try {
            const { checkIn } = await import('../services/api/attendance');
            await checkIn(locationData || {});
            fetchTodayStatus();
            fetchHistory(1, true);
        } catch (err: any) {
            throw err;
        }
    };

    return {
        todayStatus,
        history,
        isLoading: isLoadingToday || isLoadingHistory,
        isRefreshing,
        isFetchingMore,
        error,
        refreshData,
        loadMore,
        submitCheckIn,
        fetchInitialData: refreshData
    };
};
