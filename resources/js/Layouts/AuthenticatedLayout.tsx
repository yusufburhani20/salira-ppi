import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';
import SystemClock from '@/Components/SystemClock';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { props } = usePage();
    const flash = props.flash as any;
    const user = props.auth.user as any; 
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Sidebar collapse state (Desktop)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false;
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);
    
    // Toast state management
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const notifications = props.notifications as any;

    useEffect(() => {
        if (flash.success) {
            setToast({ message: flash.success, type: 'success' });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
        if (flash.error) {
            setToast({ message: flash.error, type: 'error' });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash.success, flash.error]);

    // Helpers to check current user roles
    const userRoles = user.roles || [];
    const isSuperAdmin = userRoles.includes('Super Admin');
    const isAdmin = isSuperAdmin;
    const isPimpinan = userRoles.includes('Kepala Sekolah') || userRoles.includes('Pimpinan');
    const isGuru = userRoles.includes('Guru') || userRoles.includes('Guru/Dosen');
    const isWaliKelas = userRoles.includes('Wali Kelas');
    const isStaff = userRoles.includes('Staff/TU');
    const isBendahara = userRoles.includes('Bendahara');
    const isTeacher = isGuru || isWaliKelas || isAdmin;
    const isWaliOrAdmin = isWaliKelas || isAdmin;
    const hasDataAccess = isAdmin || isStaff;

    // Grouped nav structure
    const navGroups = [
        {
            group: 'Beranda',
            show: true,
            items: [
                {
                    label: 'Dashboard',
                    href: route('dashboard'),
                    active: route().current('dashboard'),
                    show: true,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>),
                },
                {
                    label: 'Pengumuman',
                    href: route('admin.announcements.index'),
                    active: route().current('admin.announcements.*'),
                    show: isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>),
                },
            ],
        },
        {
            group: 'KBM & Akademik',
            show: true,
            items: [
                {
                    label: 'Jurnal Mengajar',
                    href: route('teacher.agendas.index'),
                    active: route().current('teacher.agendas.*'),
                    show: !isBendahara && !isPimpinan,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" /></svg>),
                },
                {
                    label: 'Asesmen Harian',
                    href: route('teacher.assessments.index'),
                    active: route().current('teacher.assessments.*'),
                    show: isTeacher,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>),
                },
                {
                    label: 'Asesmen Akhir (ASAS/ASAT)',
                    href: route('teacher.final-assessments.index'),
                    active: route().current('teacher.final-assessments.*'),
                    show: isGuru || isWaliKelas || isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>),
                },
                {
                    label: 'Bimbingan Siswa',
                    href: route('teacher.consultations.index'),
                    active: route().current('teacher.consultations.*'),
                    show: isTeacher,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>),
                },
                {
                    label: 'Rekapitulasi',
                    href: route('admin.reports.index'),
                    active: route().current('admin.reports.index') || route().current('admin.reports.attendance.*') || route().current('admin.reports.assessments.*'),
                    show: isAdmin || isPimpinan,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
                },
                {
                    label: 'Laporan Wali Kelas',
                    href: route('teacher.my-students.index'),
                    active: route().current('teacher.my-students.*'),
                    show: isWaliOrAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
                },
                {
                    label: 'Resume Akademik',
                    href: route('admin.reports.student-resume'),
                    active: route().current('admin.reports.student-resume'),
                    show: isAdmin || isPimpinan,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L19 14" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" /></svg>),
                },
            ],
        },
        {
            group: 'Kepegawaian',
            show: true,
            items: [
                {
                    label: 'Presensi Pegawai',
                    href: route('attendances.scanner'),
                    active: route().current('attendances.scanner'),
                    show: true,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
                },
                {
                    label: 'Pengajuan Izin',
                    href: route('user.permissions.index'),
                    active: route().current('user.permissions.*'),
                    show: true,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
                },
                {
                    label: 'Approval Perizinan',
                    href: route('admin.approvals.index'),
                    active: route().current('admin.approvals.*'),
                    show: isAdmin || isPimpinan,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>),
                },
                {
                    label: 'Rekap Absensi Pegawai',
                    href: route('admin.attendances.index'),
                    active: route().current('admin.attendances.*'),
                    show: isAdmin || isPimpinan,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
                },
            ],
        },
        {
            group: 'Keuangan & Administrasi',
            show: isAdmin || isBendahara,
            items: [
                {
                    label: 'Analitik Keuangan',
                    href: route('admin.finance.index'),
                    active: route().current('admin.finance.index'),
                    show: isAdmin || isPimpinan || isBendahara,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20v-4" /></svg>),
                },
                {
                    label: 'Manajemen Tagihan (SPP)',
                    href: route('admin.bills.index'),
                    active: route().current('admin.bills.*'),
                    show: isAdmin || isPimpinan || isBendahara,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>),
                },
                {
                    label: 'Catat Pengeluaran',
                    href: route('admin.finance.expenses.index'),
                    active: route().current('admin.finance.expenses.*'),
                    show: isAdmin || isBendahara,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>),
                },
                {
                    label: 'Kategori Keuangan',
                    href: route('admin.finance.categories.index'),
                    active: route().current('admin.finance.categories.*'),
                    show: isAdmin || isBendahara,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" /></svg>),
                },
            ],
        },
        {
            group: 'Data Master',
            show: hasDataAccess,
            items: [
                {
                    label: 'Tahun Ajaran',
                    href: route('admin.academic-years.index'),
                    active: route().current('admin.academic-years.*'),
                    show: hasDataAccess,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
                },
                {
                    label: 'Data Siswa',
                    href: route('admin.students.index'),
                    active: route().current('admin.students.*'),
                    show: hasDataAccess,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
                },
                {
                    label: 'Data Kelas',
                    href: route('admin.classes.index'),
                    active: route().current('admin.classes.*'),
                    show: hasDataAccess,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>),
                },
                {
                    label: 'Mata Pelajaran',
                    href: route('admin.subjects.index'),
                    active: route().current('admin.subjects.*'),
                    show: hasDataAccess,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
                },
            ],
        },
        {
            group: 'Sarpras & Inventaris',
            show: hasDataAccess,
            items: [
                {
                    label: 'Kelola Barang',
                    href: route('admin.inventory.index'),
                    active: route().current('admin.inventory.*'),
                    show: hasDataAccess,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>),
                },
                {
                    label: 'Scanner Barcode',
                    href: route('admin.inventory.scanner'),
                    active: route().current('admin.inventory.scanner'),
                    show: hasDataAccess,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>),
                },
                {
                    label: 'Log Transaksi',
                    href: route('admin.inventory.logs'),
                    active: route().current('admin.inventory.logs'),
                    show: hasDataAccess,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>),
                },
            ],
        },
        {
            group: 'Sistem & Pengaturan',
            show: isAdmin || isSuperAdmin,
            items: [
                {
                    label: 'Data Pengguna',
                    href: route('admin.users.index'),
                    active: route().current('admin.users.*'),
                    show: isSuperAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
                },
                {
                    label: 'Lokasi Geofence',
                    href: route('admin.geofences.index'),
                    active: route().current('admin.geofences.*'),
                    show: isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>),
                },
                {
                    label: 'Notifikasi & Gateway',
                    href: route('admin.settings.notifications.index'),
                    active: route().current('admin.settings.notifications.*'),
                    show: isSuperAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>),
                },
                {
                    label: 'Pengaturan Umum',
                    href: route('admin.settings.index'),
                    active: route().current('admin.settings.*'),
                    show: isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* OVERLAY (mobile only) */}
            <div
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300"
                style={{
                    opacity: sidebarOpen ? 1 : 0,
                    pointerEvents: sidebarOpen ? 'auto' : 'none',
                    visibility: sidebarOpen ? 'visible' : 'hidden',
                }}
            />

            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60 transition-all duration-300 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} flex flex-col shadow-2xl lg:shadow-none`}>
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700/60 flex-shrink-0 overflow-hidden">
                    <Link href={route('dashboard')} className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                        <img src="/images/Salira.png" alt="SALIRA Logo" className="h-8 w-8 flex-shrink-0" />
                        {!sidebarCollapsed && (
                            <span className="text-xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                SALIRA
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
                    {navGroups.map((group) => {
                        const visibleItems = group.items.filter(i => i.show);
                        if (!group.show || visibleItems.length === 0) return null;
                        return (
                            <div key={group.group} className="mb-1">
                                {!sidebarCollapsed ? (
                                    <p className="px-4 pt-4 pb-1.5 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em] truncate">
                                        {group.group}
                                    </p>
                                ) : (
                                    <div className="h-4" />
                                )}
                                <div className="px-2 space-y-0.5">
                                    {visibleItems.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                                item.active
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                            }`}
                                        >
                                            <span className={`flex-shrink-0 ${item.active ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {item.icon}
                                            </span>
                                            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                                            {!sidebarCollapsed && item.active && (
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer User Profile */}
                <div className="border-t border-slate-100 dark:border-slate-700/60 p-4 flex-shrink-0">
                    <div className="flex items-center gap-3 px-2 py-1.5">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="User Avatar" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-200 dark:border-slate-600" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
                                {user.name.charAt(0)}
                            </div>
                        )}
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{userRoles.join(', ') || 'Staff'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Force transform 0 on Desktop */}
            <style>{`
                @media (min-width: 1024px) {
                    aside { transform: translateX(0) !important; }
                }
            `}</style>

            {/* MAIN CONTENT */}
            <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                {/* TOP HEADER */}
                <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700/60">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>

                    {/* Sidebar Toggle — desktop only */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-all hover:scale-110 active:scale-95"
                        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {sidebarCollapsed ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                        )}
                    </button>

                    <div className="lg:hidden flex items-center gap-2">
                        <img src="/images/Salira.png" alt="SALIRA Logo" className="h-7 w-auto" />
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">SALIRA</span>
                    </div>

                    {header && (
                        <div className="hidden lg:block flex-1 text-slate-700 dark:text-slate-200 font-semibold">
                            {header}
                        </div>
                    )}

                    <div className="flex-1 lg:flex-none" />

                    <div className="flex items-center gap-2">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    {notifications?.unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                        </span>
                                    )}
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="right" width="80" contentClasses="py-1 bg-white dark:bg-slate-800 shadow-xl rounded-xl">
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-sm font-bold">Notifikasi</h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">{notifications?.unreadCount || 0} Baru</span>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications?.recent && notifications.recent.length > 0 ? (
                                        notifications.recent.map((notif: any) => (
                                            <Link key={notif.id} href={route('notifications.redirect', notif.id)} className="block p-4 border-b hover:bg-slate-50 transition-colors">
                                                <p className="text-sm">{notif.data?.message}</p>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-slate-400">Tidak ada notifikasi</div>
                                    )}
                                </div>
                            </Dropdown.Content>
                        </Dropdown>

                        <ThemeToggle />

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="User Avatar" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="hidden sm:block text-left leading-tight">
                                        <div className="text-sm font-semibold">{user.name}</div>
                                        <div className="text-xs text-slate-400 capitalize">{userRoles[0] || 'Staff'}</div>
                                    </div>
                                    <svg className="hidden sm:block w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
                    {children}
                </main>

                {toast && (
                    <div className="fixed bottom-6 right-6 z-[100] animate-bounce-in">
                        <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 border-2 ${
                            toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-rose-600 text-white border-rose-400'
                        }`}>
                            <span className="font-bold">{toast.message}</span>
                            <button onClick={() => setToast(null)} className="ml-4 p-1 hover:bg-white/20 rounded-full">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in { animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            `}</style>
        </div>
    );
}
