export interface AttendanceData {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    notes: string | null;
    verification_status?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    photo_url?: string | null;
    created_at?: string;
}

export interface AttendanceResponse {
    data: AttendanceData[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
