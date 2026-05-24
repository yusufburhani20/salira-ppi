import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { formatLocalDate, todayLocal, firstDayOfMonth, lastDayOfMonth } from '@/utils/date';
import { 
    UserIcon, 
    AcademicCapIcon, 
    CalendarIcon,
    ArrowDownTrayIcon,
    DocumentChartBarIcon,
    IdentificationIcon,
    ChatBubbleBottomCenterTextIcon,
    PresentationChartLineIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import StatCard from '@/Components/StatCard';

interface Student {
    id: number;
    name: string;
    nis: string;
    nisn: string;
}

interface AcademicClass {
    id: number;
    name: string;
    students: Student[];
}

export default function StudentResume({ auth, classes, semesters = [], activeSemesterId }: PageProps<{ classes: AcademicClass[], semesters: any[], activeSemesterId: any }>) {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [resumeData, setResumeData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data, setData, errors } = useForm({
        student_id: '',
        semester_id: activeSemesterId ? activeSemesterId.toString() : '',
        start_date: activeSemesterId ? '' : firstDayOfMonth(new Date().getFullYear(), 0), // 1 Januari
        end_date: activeSemesterId ? '' : todayLocal(),
    });

    useEffect(() => {
        if (selectedClassId) {
            const cls = classes.find(c => c.id.toString() === selectedClassId);
            setAvailableStudents(cls?.students || []);
        } else {
            setAvailableStudents([]);
        }
        setData('student_id', '');
        setResumeData(null);
    }, [selectedClassId]);

    const fetchResume = async () => {
        if (!data.student_id) return;
        
        setLoading(true);
        setResumeData(null);
        setError(null);
        try {
            const response = await axios.get(route('admin.reports.student-resume.data'), { params: data });
            setResumeData(response.data);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.';
            setError(msg);
            console.error('Resume fetch error:', err?.response?.data ?? err);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (month: string) => {
        const year = new Date().getFullYear();
        if (month) {
            const m = parseInt(month) - 1;
            setData(d => ({
                ...d,
                semester_id: '',
                start_date: firstDayOfMonth(year, m),
                end_date: lastDayOfMonth(year, m),
            }));
        }
    };

    const handlePrintPdf = () => {
        const params = new URLSearchParams(data as any).toString();
        window.open(`${route('admin.reports.student-resume.pdf')}?${params}`, '_blank');
    };

    return (
        <AuthenticatedLayout 
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="font-black text-xl text-gray-800 dark:text-gray-200 leading-tight tracking-tight">
                            Resume Perkembangan Siswa
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Laporan terpadu untuk orang tua & wali siswa</p>
                    </div>
                    {resumeData && (
                        <button 
                            onClick={handlePrintPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                        >
                            <DocumentChartBarIcon className="w-4 h-4" />
                            Cetak PDF
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Resume Siswa" />

            <div className="space-y-6">
                
                {/* ── SELECTION SECTION ── */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Pilih Semester</label>
                            <select 
                                value={data.semester_id}
                                onChange={e => setData(d => ({
                                    ...d,
                                    semester_id: e.target.value,
                                    start_date: '',
                                    end_date: '',
                                }))}
                                className="w-full h-11 rounded-xl border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-primary focus:border-primary text-sm font-bold"
                            >
                                <option value="">-- Custom Tanggal --</option>
                                {semesters.map((sem: any) => (
                                    <option key={sem.id} value={sem.id}>{sem.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Pilih Kelas</label>
                            <select 
                                value={selectedClassId}
                                onChange={e => setSelectedClassId(e.target.value)}
                                className="w-full h-11 rounded-xl border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-primary focus:border-primary text-sm font-bold"
                            >
                                <option value="">-- Pilih Kelas --</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Pilih Siswa</label>
                            <select 
                                value={data.student_id}
                                onChange={e => setData('student_id', e.target.value)}
                                disabled={!selectedClassId}
                                className="w-full h-11 rounded-xl border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-primary focus:border-primary text-sm font-bold disabled:opacity-50"
                            >
                                <option value="">-- Pilih Siswa --</option>
                                {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Pilih Bulan</label>
                            <select 
                                onChange={e => handleMonthChange(e.target.value)}
                                className="w-full h-11 rounded-xl border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-primary focus:border-primary text-sm font-bold"
                            >
                                <option value="">-- Custom --</option>
                                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Rentang Waktu</label>
                            <div className="flex items-center gap-2 h-11 bg-gray-50 dark:bg-gray-900/50 px-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                <input 
                                    type="date" 
                                    value={data.start_date}
                                    onChange={e => setData(d => ({ ...d, start_date: e.target.value, semester_id: '' }))}
                                    className="flex-1 h-full bg-transparent border-none text-[10px] focus:ring-0 dark:text-white p-0"
                                />
                                <span className="text-gray-300 font-bold">-</span>
                                <input 
                                    type="date" 
                                    value={data.end_date}
                                    onChange={e => setData(d => ({ ...d, end_date: e.target.value, semester_id: '' }))}
                                    className="flex-1 h-full bg-transparent border-none text-[10px] focus:ring-0 dark:text-white p-0"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={fetchResume}
                            disabled={loading || !data.student_id}
                            className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> : <MagnifyingGlassIcon className="w-4 h-4" />}
                            <span>Lihat Resume</span>
                        </button>
                    </div>
                </div>

                {/* ── RESUME CONTENT ── */}
                {resumeData ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                        
                        {/* 1. Header & Quick Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Profile Card */}
                            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 border-4 border-white dark:border-gray-700 shadow-xl">
                                    <UserIcon className="w-12 h-12" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{resumeData.student.name}</h3>
                                <div className="flex gap-2 mb-4">
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] font-black text-gray-500 uppercase tracking-widest">NIS: {resumeData.student.nis}</span>
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[9px] font-black text-gray-500 uppercase tracking-widest">NISN: {resumeData.student.nisn}</span>
                                </div>
                                <div className="w-full pt-4 border-t border-gray-50 dark:border-gray-700/50 grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                        <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase">Aktif</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kelas</p>
                                        <span className="text-sm font-black text-gray-800 dark:text-gray-200">{resumeData.student.academic_classes[0]?.name || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Stats */}
                            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <StatCard 
                                    title="Hadir" 
                                    value={resumeData.attendance.hadir} 
                                    icon={<UserIcon className="w-4 h-4" />}
                                    colorClass="bg-emerald-50 text-emerald-600 border-emerald-100"
                                />
                                <StatCard 
                                    title="Sakit" 
                                    value={resumeData.attendance.sakit} 
                                    icon={<CalendarIcon className="w-4 h-4" />}
                                    colorClass="bg-amber-50 text-amber-600 border-amber-100"
                                />
                                <StatCard 
                                    title="Izin" 
                                    value={resumeData.attendance.izin} 
                                    icon={<CalendarIcon className="w-4 h-4" />}
                                    colorClass="bg-blue-50 text-blue-600 border-blue-100"
                                />
                                <StatCard 
                                    title="Alpha" 
                                    value={resumeData.attendance.alpha} 
                                    icon={<CalendarIcon className="w-4 h-4" />}
                                    colorClass="bg-rose-50 text-rose-600 border-rose-100"
                                />
                                <div className="col-span-full bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
                                            <PresentationChartLineIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Persentase Kehadiran</p>
                                            <p className="text-lg font-black text-gray-800 dark:text-gray-100">
                                                {resumeData.attendance.total > 0 
                                                    ? Math.round((resumeData.attendance.hadir / resumeData.attendance.total) * 100) 
                                                    : 0}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-48 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${resumeData.attendance.total > 0 ? (resumeData.attendance.hadir / resumeData.attendance.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Academic & Consultations Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Academic Performance */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-3">
                                    <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                                    <h4 className="font-black text-sm uppercase tracking-tight text-gray-800 dark:text-gray-200">Performa Akademik</h4>
                                </div>
                                <div className="p-0 flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50/50 dark:bg-gray-900/20 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <tr>
                                                <th className="px-6 py-3">Mata Pelajaran</th>
                                                <th className="px-6 py-3 text-center">Rata-rata</th>
                                                <th className="px-6 py-3 text-center">Tugas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                            {resumeData.academics.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{item.subject}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-sm font-black ${item.average >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {item.average}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-xs font-bold text-gray-400">{item.count}</td>
                                                </tr>
                                            ))}
                                            {resumeData.academics.length === 0 && (
                                                <tr><td colSpan={3} className="py-12 text-center text-gray-400 italic text-xs">Belum ada data penilaian</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Recent Consultations */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 flex items-center gap-3">
                                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-indigo-600" />
                                    <h4 className="font-black text-sm uppercase tracking-tight text-gray-800 dark:text-gray-200">Riwayat Bimbingan</h4>
                                </div>
                                <div className="p-6 space-y-4 flex-1">
                                    {resumeData.consultations.length > 0 ? resumeData.consultations.map((item: any, i: number) => (
                                        <div key={i} className="relative pl-6 pb-4 border-l-2 border-gray-100 dark:border-gray-700 last:pb-0">
                                            <div className="absolute -left-1.5 top-0 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm" />
                                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="text-xs font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">{item.subject}</h5>
                                                    <span className="text-[10px] font-mono text-gray-400">{item.consultation_date}</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed italic mb-2">"{item.problem_description}"</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-black">
                                                        {item.homeroom_teacher?.name?.charAt(0) ?? '?'}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400">{item.homeroom_teacher?.name ?? '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-12 text-center">
                                            <ChatBubbleBottomCenterTextIcon className="w-12 h-12 mx-auto text-gray-200 mb-2" />
                                            <p className="text-gray-400 italic text-xs">Tidak ada riwayat bimbingan</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>
                ) : (
                    <div className="py-24 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-gray-200 mb-4">
                            <IdentificationIcon className="w-10 h-10" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-400">Menunggu Pemilihan Siswa</h4>
                        <p className="text-sm text-gray-300 max-w-xs">Pilih kelas dan nama siswa di atas untuk melihat resume perkembangan.</p>
                    </div>
                )}

                {error && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-rose-700 dark:text-rose-300">Gagal Memuat Data</p>
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
