import PortalLayout from '@/Layouts/PortalLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

type AttendanceDetail = {
    subject: string;
    lesson_period: string;
    status: string;
};

type AttendanceRecord = {
    id: number;
    date: string;
    status: string;
    notes: string | null;
    details: AttendanceDetail[];
};

type PaginatedAttendance = {
    data: AttendanceRecord[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
};

const STATUS_CONFIG: Record<string, { bg: string; border: string; badge: string; text: string; icon: string; label: string }> = {
    hadir: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-500 text-white',
        text: 'text-emerald-700',
        icon: '✓',
        label: 'HADIR',
    },
    sakit: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-500 text-white',
        text: 'text-amber-700',
        icon: '🤒',
        label: 'SAKIT',
    },
    izin: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-500 text-white',
        text: 'text-blue-700',
        icon: '📋',
        label: 'IZIN',
    },
    alpha: {
        bg: 'bg-rose-50',
        border: 'border-rose-300',
        badge: 'bg-rose-600 text-white',
        text: 'text-rose-700',
        icon: '✗',
        label: 'ALFA',
    },
    terlambat: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        badge: 'bg-orange-500 text-white',
        text: 'text-orange-700',
        icon: '⏰',
        label: 'TERLAMBAT',
    },
};

function AttendanceCard({ att }: { att: AttendanceRecord }) {
    const [expanded, setExpanded] = useState(false);
    const statusKey = (att.status || 'hadir').toLowerCase();
    const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG['hadir'];

    const formattedDate = new Date(att.date + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden transition-shadow hover:shadow-md`}>
            {/* Main row — always visible */}
            <div className="flex items-center gap-4 p-5">
                {/* Status Icon Badge */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black flex-shrink-0 ${cfg.badge}`}>
                    {cfg.icon}
                </div>

                {/* Date + Status Label */}
                <div className="flex-1 min-w-0">
                    <div className={`text-xs font-black uppercase tracking-widest mb-1 ${cfg.text}`}>{cfg.label}</div>
                    <div className="text-base font-bold text-slate-800 leading-snug">{formattedDate}</div>
                    {att.notes && (
                        <div className="text-sm text-slate-500 mt-1 truncate">{att.notes}</div>
                    )}
                    {att.details.length > 0 && (
                        <div className={`text-xs font-bold mt-1.5 px-2.5 py-1 rounded-lg inline-block ${cfg.badge} bg-opacity-20 ${cfg.text} border ${cfg.border}`}>
                            {att.details.length} Jam Pelajaran Tercatat
                        </div>
                    )}
                </div>

                {/* Expand button */}
                {att.details.length > 0 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all ${
                            expanded
                                ? 'bg-slate-800 text-white shadow-md'
                                : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                    >
                        <span>{expanded ? 'Tutup' : 'Rincian'}</span>
                        <svg
                            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Detail panel */}
            {expanded && att.details.length > 0 && (
                <div className="border-t-2 border-slate-200 bg-white/50 px-5 py-4 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                        Rincian per Mata Pelajaran:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                        {att.details.map((detail, idx) => {
                            const dCfg = STATUS_CONFIG[detail.status.toLowerCase()] ?? STATUS_CONFIG['hadir'];
                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-between bg-white border ${dCfg.border} rounded-xl px-4 py-3 shadow-sm`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${dCfg.badge} bg-opacity-10 ${dCfg.text}`}>
                                            <span className="text-sm">{dCfg.icon}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-sm">{detail.subject}</span>
                                            <span className="text-[10px] font-black uppercase opacity-40">Jam ke-{detail.lesson_period}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border ${dCfg.badge} bg-opacity-10 ${dCfg.text} ${dCfg.border}`}>
                                        {dCfg.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Attendance({ attendances, attendanceStats, filters }: { attendances: PaginatedAttendance; attendanceStats: any; filters: any }) {
    const [month, setMonth] = useState(filters.month || '');
    const [year, setYear] = useState(filters.year || new Date().getFullYear().toString());

    const handleFilter = () => {
        router.get(route('portal.attendance'), { month, year }, { preserveState: true });
    };

    const months = [
        { v: '01', l: 'Januari' }, { v: '02', l: 'Februari' }, { v: '03', l: 'Maret' },
        { v: '04', l: 'April' }, { v: '05', l: 'Mei' }, { v: '06', l: 'Juni' },
        { v: '07', l: 'Juli' }, { v: '08', l: 'Agustus' }, { v: '09', l: 'September' },
        { v: '10', l: 'Oktober' }, { v: '11', l: 'November' }, { v: '12', l: 'Desember' }
    ];

    const stats = [
        { label: 'Hadir',     value: attendanceStats.hadir,     color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
        { label: 'Sakit',     value: attendanceStats.sakit,     color: 'bg-amber-50 text-amber-800 border-amber-200' },
        { label: 'Izin',      value: attendanceStats.izin,      color: 'bg-blue-50 text-blue-800 border-blue-200' },
        { label: 'Alfa',      value: attendanceStats.alpha,     color: 'bg-rose-50 text-rose-800 border-rose-200' },
        { label: 'Terlambat', value: attendanceStats.terlambat, color: 'bg-orange-50 text-orange-800 border-orange-200' },
    ];

    return (
        <PortalLayout header="Riwayat Kehadiran">
            <Head title="Kehadiran Siswa" />

            <div className="max-w-4xl mx-auto space-y-6 pb-20">

                {/* Summary strip */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {stats.map(s => (
                        <div key={s.label} className={`rounded-2xl border-2 p-4 text-center ${s.color}`}>
                            <div className="text-3xl font-black">{s.value}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Filter Bulan</label>
                            <select 
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                            >
                                <option value="">Semua Bulan (Last 6 Months)</option>
                                {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                            </select>
                        </div>
                        <div className="w-full md:w-32">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tahun</label>
                            <select 
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                            >
                                {[new Date().getFullYear(), new Date().getFullYear()-1].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={handleFilter}
                            className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all"
                        >
                            Cari Data
                        </button>
                    </div>
                </div>

                {/* List Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Log Presensi Harian</h2>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">
                            Menampilkan {attendances.total} hari tercatat dalam periode ini
                        </p>
                    </div>
                    <div className="text-sm font-bold text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                        Halaman {attendances.current_page} dari {attendances.last_page}
                    </div>
                </div>

                {/* Cards */}
                {attendances.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {attendances.data.map((att) => (
                            <AttendanceCard key={att.id} att={att} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 py-20 text-center text-slate-300">
                        <div className="text-7xl mb-6">🗓️</div>
                        <p className="text-lg font-black text-slate-400">Belum ada data kehadiran tersedia.</p>
                        <p className="text-sm font-bold mt-2">Coba sesuaikan filter bulan atau tahun Anda.</p>
                    </div>
                )}

                {/* Pagination */}
                {attendances.links && attendances.links.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-6">
                        {attendances.links.map((link, k) => (
                            <button
                                key={k}
                                disabled={!link.url}
                                onClick={() => link.url && (window.location.href = link.url)}
                                className={`px-5 py-3 text-sm font-black rounded-xl border-2 transition-all ${
                                    link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                                        : link.url
                                            ? 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                            : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
