import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { 
    DocumentChartBarIcon, 
    AcademicCapIcon, 
    BookOpenIcon, 
    UserGroupIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface AcademicClass {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
}

export default function ReportIndex({ auth, classes, subjects }: PageProps<{ classes: AcademicClass[], subjects: Subject[] }>) {
    const [activeTab, setActiveTab] = useState<'attendance' | 'attendance_subject' | 'assessment' | 'agenda' | 'consultation'>('attendance');
    const [results, setResults] = useState<any>({
        attendance: null,
        attendance_subject: null,
        assessment: null,
        agenda: null,
        consultation: null
    });
    const [loading, setLoading] = useState(false);

    const { data, setData, errors } = useForm({
        academic_class_id: '',
        subject_id: '',
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // 1st of current month
        end_date: new Date().toISOString().split('T')[0], // Today
        student_id: '',
    });

    const fetchReport = async () => {
        if (!data.academic_class_id && activeTab !== 'consultation') return;
        
        setLoading(true);
        try {
            let url = '';
            switch(activeTab) {
                case 'attendance': url = route('admin.reports.attendance.data'); break;
                case 'attendance_subject': url = route('admin.reports.attendance-subject.data'); break;
                case 'assessment': url = route('admin.reports.assessments.data'); break;
                case 'agenda': url = route('admin.reports.agendas.data'); break;
                case 'consultation': url = route('admin.reports.consultations.data'); break;
            }

            const response = await axios.get(url, { params: data });
            setResults((prev: any) => ({
                ...prev,
                [activeTab]: response.data
            }));
        } catch (error) {
            console.error("Failed to fetch report data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (month: string) => {
        const year = new Date(data.start_date).getFullYear();
        if (month) {
            const start = new Date(year, parseInt(month) - 1, 1);
            const end = new Date(year, parseInt(month), 0);
            setData(d => ({
                ...d,
                start_date: start.toISOString().split('T')[0],
                end_date: end.toISOString().split('T')[0]
            }));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Rekapitulasi Akademik</h2>}>
            <Head title="Rekapitulasi" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                        {[
                            { id: 'attendance', label: 'Rekap Absensi (Umum)', icon: UserGroupIcon },
                            { id: 'attendance_subject', label: 'Rekap Absensi (Mapel)', icon: AcademicCapIcon },
                            { id: 'assessment', label: 'Rekap Penilaian', icon: AcademicCapIcon },
                            { id: 'agenda', label: 'Jurnal Mengajar', icon: BookOpenIcon },
                            { id: 'consultation', label: 'Bimbingan Siswa', icon: DocumentChartBarIcon },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                                    activeTab === tab.id 
                                    ? 'bg-primary text-white scale-105 ring-4 ring-primary/20' 
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Filters Section - 2 Rows */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
                        <div className="space-y-8">
                            
                            {/* Row 1: Academic Selection */}
                            <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    <AcademicCapIcon className="w-3 h-3" />
                                    Filter Akademik
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(activeTab !== 'consultation') && (
                                        <div className="relative">
                                            <select 
                                                value={data.academic_class_id}
                                                onChange={e => setData('academic_class_id', e.target.value)}
                                                className="w-full h-12 pl-4 pr-10 rounded-xl border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                            >
                                                <option value="">-- Pilih Kelas --</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {(activeTab === 'assessment' || activeTab === 'attendance_subject') && (
                                        <div className="relative">
                                            <select 
                                                value={data.subject_id}
                                                onChange={e => setData('subject_id', e.target.value)}
                                                className="w-full h-12 pl-4 pr-10 rounded-xl border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                            >
                                                <option value="">-- Pilih Mapel --</option>
                                                {subjects.filter((s: any) => data.class_id ? s.academic_classes?.some((ac: any) => ac.id.toString() === data.class_id.toString()) : false).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {activeTab === 'consultation' && (
                                         <div className="relative">
                                            <select 
                                                value={data.academic_class_id}
                                                onChange={e => setData('academic_class_id', e.target.value)}
                                                className="w-full h-12 pl-4 pr-10 rounded-xl border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                                            >
                                                <option value="">-- Semua Kelas --</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Time Selection & Actions */}
                            <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-700/50">
                                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    <CalendarIcon className="w-3 h-3" />
                                    Periode Waktu & Aksi
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                                    <div>
                                        <select 
                                            onChange={e => handleMonthChange(e.target.value)}
                                            className="w-full h-12 rounded-xl border-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-primary focus:border-primary transition-all"
                                        >
                                            <option value="">-- Berdasarkan Bulan --</option>
                                            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                                                <option key={i} value={i + 1}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="lg:col-span-2 flex items-center gap-2 h-12 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <input 
                                            type="date" 
                                            value={data.start_date}
                                            onChange={e => setData('start_date', e.target.value)}
                                            className="flex-1 h-full bg-transparent border-none text-[11px] focus:ring-0 dark:text-white"
                                        />
                                        <span className="text-gray-300 text-[10px] font-bold">SAMPAI</span>
                                        <input 
                                            type="date" 
                                            value={data.end_date}
                                            onChange={e => setData('end_date', e.target.value)}
                                            className="flex-1 h-full bg-transparent border-none text-[11px] focus:ring-0 dark:text-white"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={fetchReport}
                                            disabled={loading || (!data.academic_class_id && activeTab !== 'consultation')}
                                            className="flex-1 h-12 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                                        >
                                            {loading ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div> : <FunnelIcon className="w-4 h-4" />}
                                            <span>Filter</span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const params = new URLSearchParams(data as any).toString();
                                                let exportUrl = '';
                                                switch(activeTab) {
                                                    case 'attendance': exportUrl = route('admin.reports.attendance.export'); break;
                                                    case 'attendance_subject': exportUrl = route('admin.reports.attendance-subject.export'); break;
                                                    case 'assessment': exportUrl = route('admin.reports.assessments.export'); break;
                                                    case 'agenda': exportUrl = route('admin.reports.agendas.export'); break;
                                                    case 'consultation': exportUrl = route('admin.reports.consultations.export'); break;
                                                }
                                                window.location.href = `${exportUrl}?${params}`;
                                            }}
                                            disabled={!data.academic_class_id && activeTab !== 'consultation'}
                                            className="h-12 w-12 flex items-center justify-center bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                            title="Export Excel"
                                        >
                                            <ArrowDownTrayIcon className="w-5 h-5 text-emerald-400" />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const params = new URLSearchParams(data as any).toString();
                                                let pdfUrl = '';
                                                switch(activeTab) {
                                                    case 'attendance': pdfUrl = route('admin.reports.attendance.pdf'); break;
                                                    case 'attendance_subject': pdfUrl = route('admin.reports.attendance-subject.pdf'); break;
                                                    case 'assessment': pdfUrl = route('admin.reports.assessments.pdf'); break;
                                                    case 'agenda': pdfUrl = route('admin.reports.agendas.pdf'); break;
                                                    case 'consultation': pdfUrl = route('admin.reports.consultations.pdf'); break;
                                                }
                                                window.open(`${pdfUrl}?${params}`, '_blank');
                                            }}
                                            disabled={!data.academic_class_id && activeTab !== 'consultation'}
                                            className="h-12 w-12 flex items-center justify-center bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                            title="Download PDF"
                                        >
                                            <DocumentChartBarIcon className="w-5 h-5 text-rose-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Display */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {!results[activeTab] ? (
                            <div className="py-24 text-center">
                                <DocumentChartBarIcon className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                                <p className="text-gray-400 font-medium">Silakan pilih filter dan klik "Filter" untuk melihat data.</p>
                            </div>
                        ) : (
                            <div className="p-0">
                                {activeTab === 'attendance' && <AttendanceTable data={results.attendance} />}
                                {activeTab === 'attendance_subject' && <AttendanceTable data={results.attendance_subject} />}
                                {activeTab === 'assessment' && <AssessmentTable data={results.assessment} />}
                                {activeTab === 'agenda' && <AgendaTable data={results.agenda} />}
                                {activeTab === 'consultation' && <ConsultationTable data={results.consultation} />}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// --- Sub-components for Tables ---

function AttendanceTable({ data }: { data: any }) {
    if (!data?.dates || !data?.report) return null;
    
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        <th className="px-6 py-4 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 w-48 shadow-[2px_0px_5px_rgba(0,0,0,0.05)]">Nama Siswa</th>
                        {data.dates.map((date: string) => (
                            <th key={date} className="px-2 py-4 text-center border-l dark:border-gray-700 w-10">
                                {new Date(date).toLocaleDateString('id-ID', {day: '2-digit'})}
                            </th>
                        ))}
                        <th className="px-4 py-4 text-center border-l dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600">H</th>
                        <th className="px-4 py-4 text-center border-l dark:border-gray-700 bg-amber-50/50 dark:bg-amber-900/20 text-amber-600">S</th>
                        <th className="px-4 py-4 text-center border-l dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600">I</th>
                        <th className="px-4 py-4 text-center border-l dark:border-gray-700 bg-rose-50/50 dark:bg-rose-900/20 text-rose-600">A</th>
                        <th className="px-4 py-4 text-center border-l dark:border-gray-700 bg-orange-50/50 dark:bg-orange-900/20 text-orange-600">T</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data.report.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors text-[11px]">
                            <td className="px-6 py-3 font-bold text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0px_5px_rgba(0,0,0,0.05)] border-b dark:border-gray-700 uppercase">
                                {row.name}
                            </td>
                            {data.dates.map((date: string) => {
                                const status = row.daily?.[date] || '-';
                                return (
                                    <td key={date} className={`px-2 py-3 text-center border-l dark:border-gray-700 font-black ${
                                        status === 'hadir' ? 'text-emerald-500' :
                                        status === 'sakit' ? 'text-amber-500' :
                                        status === 'izin' ? 'text-blue-500' :
                                        status === 'alpha' ? 'text-rose-500 font-bold' :
                                        status === 'terlambat' ? 'text-orange-500' : 'text-gray-200'
                                    }`}>
                                        {status === 'hadir' ? 'H' : 
                                         status === 'sakit' ? 'S' : 
                                         status === 'izin' ? 'I' : 
                                         status === 'alpha' ? 'A' : 
                                         status === 'terlambat' ? 'T' : '•'}
                                    </td>
                                );
                            })}
                            <td className="px-4 py-3 text-center border-l dark:border-gray-700 bg-emerald-50/30 dark:bg-emerald-900/10 font-bold text-emerald-700">{row.summary?.hadir}</td>
                            <td className="px-4 py-3 text-center border-l dark:border-gray-700 bg-amber-50/30 dark:bg-amber-900/10 font-bold text-amber-700">{row.summary?.sakit}</td>
                            <td className="px-4 py-3 text-center border-l dark:border-gray-700 bg-blue-50/30 dark:bg-blue-900/10 font-bold text-blue-700">{row.summary?.izin}</td>
                            <td className="px-4 py-3 text-center border-l dark:border-gray-700 bg-rose-50/30 dark:bg-rose-900/10 font-bold text-rose-700">{row.summary?.alpha}</td>
                            <td className="px-4 py-3 text-center border-l dark:border-gray-700 bg-orange-50/30 dark:bg-orange-900/10 font-bold text-orange-700">{row.summary?.terlambat}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AssessmentTable({ data }: { data: any }) {
    if (!data?.assessments) return null;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-4 sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 w-64 shadow-[2px_0px_5px_rgba(0,0,0,0.05)] border-b dark:border-gray-700">Nama Siswa</th>
                        {data.assessments.map((a: any) => (
                            <th key={a.id} className="px-6 py-4 text-center border-l dark:border-gray-700 border-b">
                                <div className="text-[10px] mb-1">{FORMAT_DATE_ID(a.date)}</div>
                                <div className="truncate w-24 mx-auto text-xs" title={a.title}>{a.title}</div>
                            </th>
                        ))}
                        <th className="px-6 py-4 text-center border-l dark:border-gray-700 border-b bg-indigo-50/30 dark:bg-indigo-900/10 text-indigo-600">Rata-rata</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data.assessments.length > 0 && 
                        DB_COLLECT_STUDENTS(data.assessments).map((studentName: string) => {
                            let total = 0;
                            let count = 0;
                            
                            return (
                                <tr key={studentName} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0px_5px_rgba(0,0,0,0.05)] border-b dark:border-gray-700 uppercase text-xs">{studentName}</td>
                                    {data.assessments.map((a: any) => {
                                        const score = a.scores?.find((s: any) => s.student?.name === studentName);
                                        const val = score?.score;
                                        if (val !== undefined && val !== null) {
                                            total += parseFloat(val);
                                            count++;
                                        }
                                        return (
                                            <td key={a.id} className={`px-6 py-4 text-center border-l dark:border-gray-700 font-mono text-sm ${score ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-300'}`}>
                                                {score?.score ?? '-'}
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-4 text-center border-l dark:border-gray-700 bg-indigo-50/30 dark:bg-indigo-900/10 font-black text-indigo-700 dark:text-indigo-400">
                                        {count > 0 ? (total / count).toFixed(2) : '-'}
                                    </td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}

function AgendaTable({ data }: { data: any[] }) {
    if (!Array.isArray(data)) return null;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-4">Hari/Tgl</th>
                        <th className="px-6 py-4">Jam</th>
                        <th className="px-6 py-4">Guru</th>
                        <th className="px-6 py-4">Mapel</th>
                        <th className="px-6 py-4">Materi / Aktivitas</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-bold text-gray-900 dark:text-white">{FORMAT_DAY_ID(item.date)}</div>
                                <div className="text-[10px] text-gray-400 font-mono">{FORMAT_DATE_STR(item.date)}</div>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-indigo-600">{item.lesson_period}</td>
                            <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 text-sm uppercase">{item.teacher?.name}</td>
                            <td className="px-6 py-4 text-xs font-bold text-primary">{item.subject?.name || item.subject_name || item.subject}</td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 text-xs">{item.topic}</div>
                                <div className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{item.activities}</div>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-400 italic">Tidak ada data untuk rentang ini.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function ConsultationTable({ data }: { data: any[] }) {
    if (!Array.isArray(data)) return null;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-4">Tgl</th>
                        <th className="px-6 py-4">Siswa</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4">Kasus / Bimbingan</th>
                        <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {data.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-[10px] text-gray-500 font-mono">{FORMAT_DATE_STR(item.consultation_date)}</td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-900 dark:text-white text-xs uppercase">{item.student?.name}</div>
                                <div className="text-[9px] text-primary font-bold uppercase">{item.academic_class?.name || item.academic_class_name}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                                    {item.category}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-xs">{item.subject}</div>
                                <div className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed font-medium italic">"{item.problem_description}"</div>
                            </td>
                            <td className="px-6 py-4 text-center text-[10px]">
                                <span className={`px-2 py-1 rounded font-bold uppercase ${
                                    item.follow_up_status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                                    item.follow_up_status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 
                                    'bg-rose-100 text-rose-800'
                                }`}>
                                    {item.follow_up_status}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-400 italic">Tidak ada bimbingan siswa dalam rentang ini.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

// Helpers for formatted dates (Fixes UTC offset issue)
const FORMAT_DATE_ID = (dateStr: string) => {
    if (!dateStr) return '-';
    // Split date string to avoid timezone parsing issues (2026-04-12 -> [2026, 03, 12] for Date constructor)
    const [y, m, d] = dateStr.split('T')[0].split('-');
    return new Date(parseInt(y), parseInt(m)-1, parseInt(d)).toLocaleDateString('id-ID', {day: '2-digit', month: 'short'});
};

const FORMAT_DAY_ID = (dateStr: string) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('T')[0].split('-');
    return new Date(parseInt(y), parseInt(m)-1, parseInt(d)).toLocaleDateString('id-ID', {weekday: 'long'});
};

const FORMAT_DATE_STR = (dateStr: string) => {
    if (!dateStr) return '-';
    return dateStr.split('T')[0];
};

// Helper to collect all unique students from assessments
function DB_COLLECT_STUDENTS(assessments: any[]) {
    const studentsSet = new Set<string>();
    assessments.forEach(a => {
        a.scores?.forEach((s: any) => {
            if (s.student?.name) studentsSet.add(s.student.name);
        });
    });
    return Array.from(studentsSet).sort();
}

