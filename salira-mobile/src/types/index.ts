export interface User {
    id: number;
    name: string;
    email: string;
    nip?: string;
    phone?: string | null;
    status: string;
    roles: string[];
    contexts?: {
        wali_kelas?: string;
        kepala_program?: string;
    };
}

export interface AuthResponse {
    message: string;
    access_token: string;
    token_type: string;
    user: User;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
}

export interface Leave {
    id: number;
    type: 'izin' | 'sakit' | 'dinas_luar' | 'cuti';
    start_date: string;
    end_date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export interface Agenda {
    id: number;
    date: string;
    topic: string;
    notes?: string | null;
    lesson_hour_start: number;
    lesson_hour_end: number;
    class_name?: string;
    subject_name?: string;
    academic_class_id: number;
    subject_id: number;
}

export interface AgendaStudent {
    id: number;
    name: string;
    nisn: string;
    status: 'hadir' | 'sakit' | 'izin' | 'alpha';
}

export interface Assessment {
    id: number;
    date: string;
    title: string;
    type: string;
    kkm?: number | null;
    class_name?: string;
    subject_name?: string;
    academic_class_id: number;
    subject_id: number;
    scores_count: number;
    average_score?: number | null;
}

export interface Consultation {
    id: number;
    consultation_date: string;
    category: string;
    description: string;
    follow_up?: string | null;
    follow_up_status?: string | null;
    student_name?: string;
    student_id: number;
    class_name?: string;
    academic_class_id: number;
}

export interface AppNotification {
    id: string;
    type: string;
    title: string;
    body: string;
    url?: string | null;
    read_at?: string | null;
    created_at: string;
}

export interface AcademicClass {
    id: number;
    name: string;
}

export interface Subject {
    id: number;
    name: string;
}

export interface Student {
    id: number;
    name: string;
    nisn: string;
}
