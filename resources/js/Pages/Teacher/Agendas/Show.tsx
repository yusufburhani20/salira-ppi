import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    BookOpenIcon, 
    CalendarIcon, 
    ClockIcon, 
    UserGroupIcon,
    ArrowLeftIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function AgendaShow({ agenda }: { agenda: any }) {
    const attendanceStats = agenda.attendances.reduce((acc: any, curr: any) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {});

    const totalStudents = agenda.attendances.length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
                    </button>
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Detail Jurnal Mengajar</h2>
                </div>
            }
        >
            <Head title={`Detail Jurnal - ${agenda.subject}`} />

            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Header Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 p-12 bg-white/10 rounded-full blur-3xl" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider mb-4">
                                        {agenda.academic_class.name}
                                    </div>
                                    <h1 className="text-3xl font-black mb-2">{agenda.subject}</h1>
                                    <p className="text-indigo-100 font-medium max-w-xl">{agenda.topic}</p>
                                </div>
                                <div className="flex gap-3">
                                    <Link
                                        href={route('teacher.agendas.edit', agenda.id)}
                                        className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold shadow-lg hover:bg-indigo-50 transition-all active:scale-95"
                                    >
                                        <PencilSquareIcon className="w-5 h-5" />
                                        Edit Jurnal
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x dark:divide-gray-700 border-b dark:border-gray-700">
                            {[
                                { label: 'Tanggal', value: new Date(agenda.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), icon: CalendarIcon },
                                { label: 'Jam Ke', value: agenda.lesson_period, icon: ClockIcon },
                                { label: 'Tingkat Presence', value: `${Math.round((attendanceStats.hadir / totalStudents) * 100 || 0)}%`, icon: UserGroupIcon },
                                { label: 'Total Siswa', value: totalStudents, icon: UserGroupIcon },
                            ].map((item, i) => (
                                <div key={i} className="p-6 text-center">
                                    <item.icon className="w-5 h-5 mx-auto mb-2 text-indigo-500 opacity-60" />
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{item.label}</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white mt-1">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <InformationCircleIcon className="w-6 h-6 text-indigo-500" />
                                    Aktivitas Pembelajaran
                                </h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Ringkasan Aktivitas</h4>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {agenda.activities}
                                        </p>
                                    </div>
                                    
                                    {agenda.student_tasks && (
                                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <h4 className="text-[10px] uppercase font-black text-indigo-500 tracking-widest mb-2">Tugas / Catatan Tambahan</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {agenda.student_tasks}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Attendance Table */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <UserGroupIcon className="w-6 h-6 text-emerald-500" />
                                        Data Kehadiran Siswa
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b dark:border-gray-700">
                                                <th className="px-8 py-4">Nama Siswa</th>
                                                <th className="px-8 py-4 text-center">Status</th>
                                                <th className="px-8 py-4">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {agenda.attendances.map((att: any) => (
                                                <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <div className="text-sm font-bold text-gray-800 dark:text-white">{att.student.name}</div>
                                                        <div className="text-[10px] text-slate-400 uppercase">NISN: {att.student.nisn}</div>
                                                    </td>
                                                    <td className="px-8 py-4 text-center">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                            att.status === 'hadir' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                            att.status === 'sakit' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                                            att.status === 'izin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                                                            'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                                                        }`}>
                                                            {att.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 text-xs text-slate-500 italic">
                                                        {att.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Quick Stats */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Ringkasan Statistik</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Hadir', count: attendanceStats.hadir || 0, color: 'emerald', icon: CheckCircleIcon },
                                        { label: 'Sakit', count: attendanceStats.sakit || 0, color: 'amber', icon: InformationCircleIcon },
                                        { label: 'Izin', count: attendanceStats.izin || 0, color: 'blue', icon: InformationCircleIcon },
                                        { label: 'Alpha', count: attendanceStats.alpha || 0, color: 'rose', icon: XCircleIcon },
                                    ].map((stat) => (
                                        <div key={stat.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                                            <div className="flex items-center gap-3">
                                                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{stat.label}</span>
                                            </div>
                                            <div className={`text-lg font-black text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                                {stat.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20">
                                <h3 className="text-lg font-bold mb-2">Informasi Guru</h3>
                                <p className="text-indigo-100 text-sm mb-6 opacity-80">Jurnal ini dicatat secara resmi oleh tenaga pengajar di sistem SALIRA.</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-xl">
                                        {agenda.attendances[0]?.recorded_by_name?.charAt(0) || 'G'}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Pengajar</p>
                                        <p className="font-bold underline decoration-indigo-300 underline-offset-4">Anda (Staff Pengajar)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .text-emerald-500 { color: #10b981; }
                .text-amber-500 { color: #f59e0b; }
                .text-blue-500 { color: #3b82f6; }
                .text-rose-500 { color: #ef4444; }
                .text-emerald-600 { color: #059669; }
                .text-amber-600 { color: #d97706; }
                .text-blue-600 { color: #2563eb; }
                .text-rose-600 { color: #dc2626; }
                .text-emerald-700 { color: #047857; }
                .text-amber-700 { color: #b45309; }
                .text-blue-700 { color: #1d4ed8; }
                .text-rose-700 { color: #b91c1c; }
                .bg-emerald-100 { background-color: #d1fae5; }
                .bg-amber-100 { background-color: #fef3c7; }
                .bg-blue-100 { background-color: #dbeafe; }
                .bg-rose-100 { background-color: #fee2e2; }
            `}</style>
        </AuthenticatedLayout>
    );
}
