import PortalLayout from '@/Layouts/PortalLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

type AlphaDetail = {
    subject: string;
    lesson_period: string;
};

type AttendanceRecord = {
    id: number;
    date: string;
    status: string;
    notes: string | null;
    alpha_details: AlphaDetail[];
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
    const isAlpha = statusKey === 'alpha';

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
                    {att.notes && !isAlpha && (
                        <div className="text-sm text-slate-500 mt-1 truncate">{att.notes}</div>
                    )}
                    {isAlpha && att.alpha_details.length > 0 && (
                        <div className={`text-sm font-semibold mt-1 ${cfg.text}`}>
                            {att.alpha_details.length} mata pelajaran tidak hadir
                        </div>
                    )}
                </div>

                {/* Expand button — only for alpha with detail */}
                {isAlpha && att.alpha_details.length > 0 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all ${
                            expanded
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                    >
                        <span>{expanded ? 'Tutup' : 'Lihat Detail'}</span>
                        <svg
                            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Alpha detail panel */}
            {isAlpha && expanded && att.alpha_details.length > 0 && (
                <div className="border-t-2 border-rose-200 bg-white px-5 py-4">
                    <p className="text-xs font-black uppercase tracking-widest text-rose-500 mb-3">
                        Tidak hadir pada:
                    </p>
                    <div className="space-y-2">
                        {att.alpha_details.map((detail, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-200 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <span className="font-bold text-rose-900 text-sm">{detail.subject}</span>
                                </div>
                                <span className="text-xs font-black bg-rose-600 text-white px-3 py-1.5 rounded-lg">
                                    Jam ke-{detail.lesson_period}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Attendance({ attendances }: { attendances: PaginatedAttendance }) {
    const stats = attendances.data.reduce(
        (acc, att) => {
            const s = (att.status || 'hadir').toLowerCase();
            if (s === 'hadir')     acc.hadir++;
            else if (s === 'sakit')     acc.sakit++;
            else if (s === 'izin')      acc.izin++;
            else if (s === 'alpha')     acc.alpha++;
            else if (s === 'terlambat') acc.terlambat++;
            return acc;
        },
        { hadir: 0, sakit: 0, izin: 0, alpha: 0, terlambat: 0 }
    );

    return (
        <PortalLayout header="Riwayat Kehadiran">
            <Head title="Kehadiran Siswa" />

            <div className="max-w-3xl mx-auto space-y-6 pb-20">

                {/* Summary strip */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Hadir',     value: stats.hadir,     color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                        { label: 'Sakit',     value: stats.sakit,     color: 'bg-amber-100 text-amber-800 border-amber-200' },
                        { label: 'Izin',      value: stats.izin,      color: 'bg-blue-100 text-blue-800 border-blue-200' },
                        { label: 'Alfa',      value: stats.alpha,     color: 'bg-rose-100 text-rose-800 border-rose-200' },
                    ].map(s => (
                        <div key={s.label} className={`rounded-2xl border-2 p-4 text-center ${s.color}`}>
                            <div className="text-3xl font-black">{s.value}</div>
                            <div className="text-xs font-bold uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Log Presensi Harian</h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Menampilkan {attendances.total} hari tercatat
                        </p>
                    </div>
                    <div className="text-sm font-bold text-slate-400">
                        Hal. {attendances.current_page}/{attendances.last_page}
                    </div>
                </div>

                {/* Cards */}
                {attendances.data.length > 0 ? (
                    <div className="space-y-3">
                        {attendances.data.map((att) => (
                            <AttendanceCard key={att.id} att={att} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center text-slate-400">
                        <div className="text-5xl mb-3">📋</div>
                        <p className="font-semibold">Belum ada data kehadiran tersedia.</p>
                    </div>
                )}

                {/* Pagination */}
                {attendances.links && attendances.links.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {attendances.links.map((link, k) => (
                            <button
                                key={k}
                                disabled={!link.url}
                                onClick={() => link.url && (window.location.href = link.url)}
                                className={`px-5 py-3 text-sm font-bold rounded-xl border-2 transition-all ${
                                    link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
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
