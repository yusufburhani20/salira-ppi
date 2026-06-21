import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    CalendarIcon,
    UserIcon,
    BookOpenIcon,
    PhotoIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';

const statusBadgeMap: Record<string, { label: string; color: string }> = {
    hadir: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    izin: { label: 'Izin', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    sakit: { label: 'Sakit', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    alpha: { label: 'Alpha', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    terlambat: { label: 'Telat', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
};

export default function Show({ eveningStudy }: any) {
    const dateFormatted = new Date(eveningStudy.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    // Calculate status counts
    const attendances = eveningStudy.attendances || [];
    const totalCount = attendances.length;
    const stats = {
        hadir: attendances.filter((a: any) => (a.status?.value || a.status) === 'hadir').length,
        izin: attendances.filter((a: any) => (a.status?.value || a.status) === 'izin').length,
        sakit: attendances.filter((a: any) => (a.status?.value || a.status) === 'sakit').length,
        alpha: attendances.filter((a: any) => (a.status?.value || a.status) === 'alpha').length,
        terlambat: attendances.filter((a: any) => (a.status?.value || a.status) === 'terlambat').length,
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('teacher.evening-studies.index')}
                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Link>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                            Detail Belajar Malam - {eveningStudy.academic_class?.name || '-'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">{dateFormatted}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Jurnal Belajar Malam ${eveningStudy.academic_class?.name}`} />

            <div className="space-y-6">
                
                {/* Stats Summary Panel */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[
                        { label: 'Hadir', value: stats.hadir, color: 'emerald', icon: CheckCircleIcon },
                        { label: 'Izin', value: stats.izin, color: 'blue', icon: InformationCircleIcon },
                        { label: 'Sakit', value: stats.sakit, color: 'amber', icon: ExclamationTriangleIcon },
                        { label: 'Alpha', value: stats.alpha, color: 'red', icon: ExclamationTriangleIcon },
                        { label: 'Telat', value: stats.terlambat, color: 'indigo', icon: ClockIcon },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-3"
                        >
                            <div className={`w-8 h-8 rounded-lg bg-${s.color}-100 dark:bg-${s.color}-900/30 flex items-center justify-center shrink-0`}>
                                <s.icon className={`w-4 h-4 text-${s.color}-600 dark:text-${s.color}-400`} />
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-900 dark:text-white">{s.value}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel: Activity Information & Photo */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-6 space-y-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60 pb-2 flex items-center gap-1.5">
                                <BookOpenIcon className="w-4 h-4 text-indigo-500" /> Informasi Kegiatan
                            </h3>
                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nama Kegiatan / Materi</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">{eveningStudy.activity_name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Guru Pengawas</p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                                        <UserIcon className="w-3.5 h-3.5 text-slate-400" /> {eveningStudy.supervisor?.name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Catatan Pengawas</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-line italic">
                                        {eveningStudy.notes || 'Tidak ada catatan khusus.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {eveningStudy.photo_url && (
                            <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4">
                                <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <PhotoIcon className="w-4 h-4 text-indigo-500" /> Foto Dokumentasi
                                </h4>
                                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 aspect-video">
                                    <img
                                        src={eveningStudy.photo_url}
                                        alt="Dokumentasi"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Attendance Details */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-6 space-y-4">
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60 pb-3">
                            Rincian Kehadiran Santri ({totalCount} Santri)
                        </h3>

                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                            {attendances.length === 0 ? (
                                <p className="text-center py-16 text-slate-400 italic text-xs">Tidak ada data kehadiran</p>
                            ) : (
                                attendances.map((att: any) => {
                                    const statusVal = att.status?.value || att.status;
                                    const badge = statusBadgeMap[statusVal] || { label: statusVal, color: 'bg-slate-100 text-slate-700' };
                                    return (
                                        <div
                                            key={att.id}
                                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl"
                                        >
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                    {att.student?.name || 'Siswa'}
                                                </p>
                                                {att.notes && (
                                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                                        Keterangan: <span className="font-medium italic">{att.notes}</span>
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
