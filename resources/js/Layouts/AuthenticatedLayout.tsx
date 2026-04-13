import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { props } = usePage();
    const flash = props.flash as any;
    const user = props.auth.user as any; 
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Toast state management
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
    const isAdmin = userRoles.includes('Admin') || isSuperAdmin;
    const isPimpinan = userRoles.includes('Pimpinan');
    const isTeacher = userRoles.includes('Guru') || userRoles.includes('Guru/Dosen');
    // Guru & Staff technically don't have Admin/Pimpinan privileges.

    // Grouped nav structure — each group has a label, show condition, and items
    const navGroups = [
        {
            group: 'Umum',
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
                    label: 'Presensi Pegawai',
                    href: route('attendances.scanner'),
                    active: route().current('attendances.scanner'),
                    show: true,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
                },
            ],
        },
        {
            group: 'Aktivitas Akademik',
            show: true,
            items: [
                {
                    label: 'Jurnal Mengajar',
                    href: route('teacher.agendas.index'),
                    active: route().current('teacher.agendas.*'),
                    show: true,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253" /></svg>),
                },
                {
                    label: 'Penilaian Harian',
                    href: route('teacher.assessments.index'),
                    active: route().current('teacher.assessments.*'),
                    show: isTeacher,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>),
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
                    active: route().current('admin.reports.*'),
                    show: isAdmin || isPimpinan || isTeacher,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
                },
            ],
        },
        {
            group: 'Perizinan',
            show: true,
            items: [
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
                    label: 'Rekap Absensi Staff',
                    href: route('admin.attendances.index'),
                    active: route().current('admin.attendances.*'),
                    show: isAdmin || isPimpinan,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
                },
            ],
        },
        {
            group: 'Data Akademik',
            show: isAdmin,
            items: [
                {
                    label: 'Data Siswa',
                    href: route('admin.students.index'),
                    active: route().current('admin.students.*'),
                    show: isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>),
                },
                {
                    label: 'Data Kelas',
                    href: route('admin.classes.index'),
                    active: route().current('admin.classes.*'),
                    show: isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>),
                },
                {
                    label: 'Mata Pelajaran',
                    href: route('admin.subjects.index'),
                    active: route().current('admin.subjects.*'),
                    show: isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
                },
            ],
        },
        {
            group: 'Inventaris',
            show: isAdmin,
            items: [
                {
                    label: 'Kelola Barang',
                    href: route('admin.inventory.index'),
                    active: route().current('admin.inventory.*'),
                    show: isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>),
                },
                {
                    label: 'Scanner Barcode',
                    href: route('admin.inventory.scanner'),
                    active: route().current('admin.inventory.scanner'),
                    show: isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>),
                },
                {
                    label: 'Log Transaksi',
                    href: route('admin.inventory.logs'),
                    active: route().current('admin.inventory.logs'),
                    show: isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>),
                },
            ],
        },
        {
            group: 'Administrasi',
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
                    label: 'Pengaturan',
                    href: route('admin.settings.index'),
                    active: route().current('admin.settings.*'),
                    show: isAdmin,
                    icon: (<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
                },
            ],
        },
    ]
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

            {/* ===== OVERLAY (mobile only) ===== */}
            <div
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300"
                style={{
                    opacity: sidebarOpen ? 1 : 0,
                    pointerEvents: sidebarOpen ? 'auto' : 'none',
                    visibility: sidebarOpen ? 'visible' : 'hidden',
                }}
            />

            {/* ===== SIDEBAR ===== */}
            {/* Uses inline style for transform — avoids Tailwind purge issues with dynamic classes */}
            <aside
                className="fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0"
                style={{
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                }}
                // On desktop, always show via CSS override below
            >
                {/* Logo + Close */}
                <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-700/60 flex-shrink-0">
                    <Link href={route('dashboard')} className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                        <ApplicationLogo className="h-7 w-auto fill-current text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                            SALIRA
                        </span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Grouped Nav Links */}
                <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
                    {navGroups.map((group) => {
                        // Filter visible items in this group
                        const visibleItems = group.items.filter(i => i.show);
                        if (!group.show || visibleItems.length === 0) return null;
                        return (
                            <div key={group.group} className="mb-1">
                                <p className="px-4 pt-4 pb-1.5 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em]">
                                    {group.group}
                                </p>
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
                                            <span className={`flex-shrink-0 ${
                                                item.active
                                                    ? 'text-indigo-500 dark:text-indigo-400'
                                                    : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                                {item.icon}
                                            </span>
                                            <span className="truncate">{item.label}</span>
                                            {item.active && (
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-slate-100 dark:border-slate-700/60 p-4 flex-shrink-0">
                    <div className="flex items-center gap-3 px-2 py-1.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{userRoles.join(', ') || 'Staff'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ===== DESKTOP: make sidebar always visible ===== */}
            <style>{`
                @media (min-width: 1024px) {
                    aside { transform: translateX(0) !important; }
                }
            `}</style>

            {/* ===== MAIN CONTENT ===== */}
            {/* On desktop offset content by sidebar width (lg:pl-64) */}
            <div className="flex flex-col min-h-screen lg:pl-64">

                {/* TOP HEADER */}
                <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700/60">
                    {/* Hamburger — mobile only */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                        aria-label="Open menu"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Mobile: show logo */}
                    <div className="lg:hidden flex items-center gap-2">
                        <ApplicationLogo className="h-7 w-auto fill-current text-indigo-600 dark:text-indigo-400" />
                        <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">SALIRA</span>
                    </div>

                    {/* Desktop: page title */}
                    {header && (
                        <div className="hidden lg:block flex-1 text-slate-700 dark:text-slate-200">
                            {header}
                        </div>
                    )}

                    <div className="flex-1 lg:flex-none" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="hidden sm:block text-left leading-tight">
                                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</div>
                                        <div className="text-xs text-slate-400 capitalize">{userRoles.join(', ') || 'Staff'}</div>
                                    </div>
                                    <svg className="hidden sm:block w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile Settings</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Mobile: page title below header */}
                {header && (
                    <div className="lg:hidden px-4 pt-4 pb-1">
                        <div className="text-base font-semibold text-slate-800 dark:text-slate-200">
                            {header}
                        </div>
                    </div>
                )}

                {/* PAGE CONTENT */}
                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>

                {/* TOAST SYSTEM */}
                {toast && (
                    <div className="fixed bottom-6 right-6 z-[100] animate-bounce-in group">
                        <div className={`relative px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border-2 transition-all ${
                            toast.type === 'success' 
                                ? 'bg-emerald-600 text-white border-emerald-400' 
                                : 'bg-rose-600 text-white border-rose-400'
                        }`}>
                            {toast.type === 'success' ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            )}
                            <span className="font-bold">{toast.message}</span>
                            
                            <button 
                                onClick={() => setToast(null)}
                                className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes bounce-in {
                        0% { transform: scale(0.3); opacity: 0; }
                        50% { transform: scale(1.05); }
                        70% { transform: scale(0.9); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .animate-bounce-in {
                        animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    }
                `}</style>
            </div>
        </div>
    );
}
