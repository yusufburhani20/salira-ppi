import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { 
    CalendarIcon, 
    UsersIcon, 
    ArrowDownTrayIcon,
    AdjustmentsHorizontalIcon,
    CheckCircleIcon, 
    XCircleIcon, 
    ExclamationCircleIcon, 
    InformationCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface StudentData {
    id: number;
    name: string;
    days: Record<number, string | null>;
    summary: {
        hadir: number;
        sakit: number;
        izin: number;
        alpha: number;
        terlambat: number;
    };
}

export default function StudentAttendanceReport({ classes, academicYears }: { classes: any[], academicYears: any[] }) {
    const today = new Date();
    const [filters, setFilters] = useState({
        academic_class_id: '',
        month: today.getMonth() + 1,
        year: today.getFullYear()
    });

    const [reportData, setReportData] = useState<StudentData[]>([]);
    const [daysInMonth, setDaysInMonth] = useState(0);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({ monthName: '', year: 0 });

    const months = [
        { id: 1, name: 'Januari' }, { id: 2, name: 'Februari' }, { id: 3, name: 'Maret' },
        { id: 4, name: 'April' }, { id: 5, name: 'Mei' }, { id: 6, name: 'Juni' },
        { id: 7, name: 'Juli' }, { id: 8, name: 'Agustus' }, { id: 9, name: 'September' },
        { id: 10, name: 'Oktober' }, { id: 11, name: 'November' }, { id: 12, name: 'Desember' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    const fetchReport = async () => {
        if (!filters.academic_class_id) return;
        setLoading(true);
        try {
            const res = await axios.get(route('admin.reports.student-attendance.data'), { params: filters });
            setReportData(res.data.report);
            setDaysInMonth(res.data.daysInMonth);
            setMeta({ monthName: res.data.monthName, year: res.data.year });
        } catch (err) {
            console.error("Failed to load report", err);
        } finally {
            setLoading(false);
        }
    };

    // Remove automatic fetch to allow manual "Lihat" preview
    // useEffect(() => {
    //     if (filters.academic_class_id) {
    //         fetchReport();
    //     }
    // }, [filters]);

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'hadir': return 'bg-emerald-500 text-white';
            case 'sakit': return 'bg-amber-400 text-white';
            case 'izin': return 'bg-blue-400 text-white';
            case 'alpha': return 'bg-rose-500 text-white';
            case 'terlambat': return 'bg-orange-400 text-white';
            default: return 'bg-slate-100 dark:bg-slate-800 text-transparent';
        }
    };

    const getStatusInitial = (status: string | null) => {
        switch (status) {
            case 'hadir': return 'H';
            case 'sakit': return 'S';
            case 'izin': return 'I';
            case 'alpha': return 'A';
            case 'terlambat': return 'T';
            default: return '-';
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Rekap Absensi Bulanan Siswa</h2>}
        >
            <Head title="Rekap Absensi Siswa" />

            <div className="py-12">
                <div className="max-w-[1600px] mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Filters Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            <div className="flex-1 space-y-1">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Pilih Kelas</label>
                                <div className="relative">
                                    <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select 
                                        className="w-full pl-10 rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                        value={filters.academic_class_id}
                                        onChange={e => setFilters({...filters, academic_class_id: e.target.value})}
                                    >
                                        <option value="">-- Pilih Kelas --</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.academic_year.name})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="w-full md:w-48 space-y-1">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Bulan</label>
                                <select 
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    value={filters.month}
                                    onChange={e => setFilters({...filters, month: parseInt(e.target.value)})}
                                >
                                    {months.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>

                            <div className="w-full md:w-32 space-y-1">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Tahun</label>
                                <select 
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    value={filters.year}
                                    onChange={e => setFilters({...filters, year: parseInt(e.target.value)})}
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <button 
                                onClick={fetchReport}
                                disabled={!filters.academic_class_id || loading}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <UsersIcon className="w-5 h-5" />
                                {loading ? 'Memuat...' : 'Lihat Report'}
                            </button>

                            <a 
                                href={route('admin.reports.student-attendance.export', filters)}
                                className={`px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors ${!reportData.length ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                Export Excel
                            </a>
                        </div>
                    </div>

                    {reportData.length > 0 && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { label: 'Hadir', count: reportData.reduce((a, b) => a + b.summary.hadir, 0), color: 'emerald', icon: CheckCircleIcon },
                                    { label: 'Sakit', count: reportData.reduce((a, b) => a + b.summary.sakit, 0), color: 'amber', icon: InformationCircleIcon },
                                    { label: 'Izin', count: reportData.reduce((a, b) => a + b.summary.izin, 0), color: 'blue', icon: InformationCircleIcon },
                                    { label: 'Alpha', count: reportData.reduce((a, b) => a + b.summary.alpha, 0), color: 'rose', icon: XCircleIcon },
                                    { label: 'Terlambat', count: reportData.reduce((a, b) => a + b.summary.terlambat, 0), color: 'orange', icon: ClockIcon },
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{stat.label}</p>
                                            <p className={`text-2xl font-black text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.count}</p>
                                        </div>
                                        <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                                            <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Main Report Table */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                                    <h4 className="font-bold text-gray-800 dark:text-white">Rekapitulasi: {meta.monthName} {meta.year}</h4>
                                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-wider">
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Hadir (H)</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-400 rounded-sm"></span> Sakit (S)</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded-sm"></span> Izin (I)</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Alpha (A)</span>
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-400 rounded-sm"></span> Terlambat (T)</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b dark:border-gray-700">
                                                <th className="px-6 py-4 sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 min-w-[200px]">Nama Siswa</th>
                                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                                                    <th key={d} className="px-1 py-4 text-center min-w-[30px]">{d}</th>
                                                ))}
                                                <th className="px-2 py-4 text-center bg-gray-100 dark:bg-slate-800 font-bold text-emerald-600">H</th>
                                                <th className="px-2 py-4 text-center bg-gray-100 dark:bg-slate-800 font-bold text-amber-500">S</th>
                                                <th className="px-2 py-4 text-center bg-gray-100 dark:bg-slate-800 font-bold text-blue-500">I</th>
                                                <th className="px-2 py-4 text-center bg-gray-100 dark:bg-slate-800 font-bold text-rose-500">A</th>
                                                <th className="px-2 py-4 text-center bg-gray-100 dark:bg-slate-800 font-bold text-orange-500">T</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={daysInMonth + 6} className="py-20 text-center">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                reportData.map((student) => (
                                                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                                        <td className="px-6 py-3 sticky left-0 z-10 bg-white dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-200 truncate shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                                            {student.name}
                                                        </td>
                                                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                                                            <td key={d} className="p-0.5">
                                                                <div className={`w-full aspect-square flex items-center justify-center rounded-md text-[10px] font-bold ${getStatusColor(student.days[d])}`}>
                                                                    {getStatusInitial(student.days[d])}
                                                                </div>
                                                            </td>
                                                        ))}
                                                        <td className="px-2 py-4 text-center font-bold text-emerald-600">{student.summary.hadir}</td>
                                                        <td className="px-2 py-4 text-center font-bold text-amber-500">{student.summary.sakit}</td>
                                                        <td className="px-2 py-4 text-center font-bold text-blue-500">{student.summary.izin}</td>
                                                        <td className="px-2 py-4 text-center font-bold text-rose-500">{student.summary.alpha}</td>
                                                        <td className="px-2 py-4 text-center font-bold text-orange-500">{student.summary.terlambat}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {!filters.academic_class_id && (
                        <div className="py-20 text-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <AdjustmentsHorizontalIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Silakan pilih kelas untuk melihat rekap</h3>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Pilih kelas, bulan, dan tahun pada filter di atas.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .text-emerald-600 { color: #059669; }
                .text-amber-500 { color: #f59e0b; }
                .text-blue-500 { color: #3b82f6; }
                .text-rose-500 { color: #ef4444; }
                .text-orange-500 { color: #f97316; }
                .bg-emerald-500 { background-color: #10b981; }
                .bg-amber-400 { background-color: #fbbf24; }
                .bg-blue-400 { background-color: #60a5fa; }
                .bg-rose-500 { background-color: #f43f5e; }
                .bg-orange-400 { background-color: #fb923c; }
            `}</style>
        </AuthenticatedLayout>
    );
}
