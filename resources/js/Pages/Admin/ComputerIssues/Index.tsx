import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    FunnelIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ClockIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

const issueStatusMap: Record<string, { label: string; color: string; icon: any }> = {
    pending: {
        label: 'Menunggu',
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        icon: ClockIcon,
    },
    open: {
        label: 'Proses',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: ExclamationCircleIcon,
    },
    resolved: {
        label: 'Selesai',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircleIcon,
    },
};

export default function Index({ issues, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    
    const [resolveTicket, setResolveTicket] = useState<any>(null);
    const [viewPhoto, setViewPhoto] = useState<string | null>(null);

    const resolveForm = useForm({
        resolution_notes: '',
        pc_status: 'active',
    });

    const applyFilter = () => {
        router.get(
            route('admin.computer-issues.index'),
            { search, status: statusFilter },
            { preserveState: true }
        );
    };

    const handleResolveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        resolveForm.post(route('admin.computer-issues.resolve', resolveTicket.id), {
            onSuccess: () => {
                setResolveTicket(null);
                resolveForm.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                        Tiket Laporan Masalah PC
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Pantau, kelola, dan selesaikan pelaporan kerusakan komputer dari siswa dan guru
                    </p>
                </div>
            }
        >
            <Head title="Tiket Masalah PC" />

            <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                            Cari Laporan
                        </label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                                type="text"
                                placeholder="Kode PC, nama pelapor, isi laporan..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                    <div className="min-w-[150px]">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                            Status Tiket
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Menunggu Perbaikan</option>
                            <option value="open">Dalam Proses</option>
                            <option value="resolved">Selesai (Resolved)</option>
                        </select>
                    </div>
                    <button
                        onClick={applyFilter}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
                    >
                        <FunnelIcon className="w-4 h-4" /> Filter
                    </button>
                </div>

                {/* Table list */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/30">
                                    <th className="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Kode Tiket</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">PC & Ruangan</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Pelapor</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Laporan Kerusakan</th>
                                    <th className="text-center px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Foto</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="text-center px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                                {issues.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                                            Tidak ada tiket laporan kerusakan
                                        </td>
                                    </tr>
                                ) : (
                                    issues.data.map((issue: any) => {
                                        const badge = issueStatusMap[issue.status] || {
                                            label: issue.status,
                                            color: 'bg-slate-100 text-slate-700',
                                            icon: ClockIcon,
                                        };
                                        return (
                                            <tr
                                                key={issue.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                                            >
                                                <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                                                    {new Date(issue.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-4 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                                                    {issue.ticket_code || '-'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                                                        {issue.unit?.code}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500">{issue.unit?.lab?.name || '-'}</p>
                                                </td>
                                                <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                                    {issue.reporter_name}
                                                </td>
                                                <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                                                    <p className="line-clamp-2">{issue.description}</p>
                                                    {issue.status === 'resolved' && (
                                                        <div className="mt-1.5 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                                                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Log Solusi:</p>
                                                            <p className="text-[10px] text-slate-500 italic mt-0.5">{issue.resolution_notes}</p>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {issue.photo_url ? (
                                                        <button
                                                            onClick={() => setViewPhoto(issue.photo_url)}
                                                            className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform flex items-center justify-center bg-slate-50 cursor-pointer"
                                                        >
                                                            <img
                                                                src={issue.photo_url}
                                                                alt="Lampiran"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <EyeIcon className="w-4 h-4 text-white" />
                                                            </div>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 italic">No Photo</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
                                                        <badge.icon className="w-3 h-3" />
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {issue.status === 'pending' && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('Mulai proses perbaikan untuk tiket ini?')) {
                                                                        router.post(route('admin.computer-issues.process', issue.id));
                                                                    }
                                                                }}
                                                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer animate-pulse"
                                                            >
                                                                Proses
                                                            </button>
                                                        )}
                                                        {issue.status !== 'resolved' ? (
                                                            <button
                                                                onClick={() => {
                                                                    setResolveTicket(issue);
                                                                    resolveForm.setData({
                                                                        resolution_notes: '',
                                                                        pc_status: 'active',
                                                                    });
                                                                }}
                                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                                                            >
                                                                Selesaikan
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-bold">Closed</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {issues.last_page > 1 && (
                        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                            <span>
                                Menampilkan {issues.from}–{issues.to} dari {issues.total}
                            </span>
                            <div className="flex gap-1">
                                {issues.links.map((link: any, i: number) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Resolve Modal */}
            {resolveTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white">
                                Selesaikan Perbaikan PC - {resolveTicket.unit?.code}
                            </h3>
                            <button
                                onClick={() => setResolveTicket(null)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                    Status PC Pasca Perbaikan *
                                </label>
                                <select
                                    value={resolveForm.data.pc_status}
                                    onChange={(e) => resolveForm.setData('pc_status', e.target.value)}
                                    className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="active">Baik / Aktif Kembali</option>
                                    <option value="maintenance">Masih Butuh Pemeliharaan Lanjut</option>
                                    <option value="broken">Tetap Rusak / Afkir</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                    Log Solusi / Tindakan Troubleshooting *
                                </label>
                                <textarea
                                    value={resolveForm.data.resolution_notes}
                                    onChange={(e) => resolveForm.setData('resolution_notes', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    rows={4}
                                    placeholder="mis: Replaced RAM 8GB with a new one. OS re-installed."
                                    required
                                />
                                {resolveForm.errors.resolution_notes && <p className="text-xs text-red-500 mt-1">{resolveForm.errors.resolution_notes}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setResolveTicket(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={resolveForm.processing}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    {resolveForm.processing ? 'Menyelesaikan...' : 'Tandai Selesai'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Photo Lightbox */}
            {viewPhoto && (
                <div
                    onClick={() => setViewPhoto(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
                >
                    <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2">
                        <img
                            src={viewPhoto}
                            alt="Bukti Lampiran"
                            className="max-w-full max-h-[80vh] object-contain rounded-xl"
                        />
                        <button
                            onClick={() => setViewPhoto(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 cursor-pointer"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
