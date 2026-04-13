import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeftIcon, FunnelIcon } from '@heroicons/react/24/outline';

const actionColor: Record<string, string> = {
    masuk:      'bg-emerald-100 text-emerald-700',
    keluar:     'bg-red-100 text-red-700',
    pinjam:     'bg-blue-100 text-blue-700',
    kembali:    'bg-indigo-100 text-indigo-700',
    perbaikan:  'bg-amber-100 text-amber-700',
    pemusnahan: 'bg-slate-100 text-slate-500',
};

export default function InventoryLogs({ logs, filters }: any) {
    const [actionFilter, setActionFilter] = useState(filters.action || '');

    const applyFilter = () => {
        router.get(route('admin.inventory.logs'), { action: actionFilter }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-4">
                <a href={route('admin.inventory.index')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
                </a>
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">Log Transaksi Inventaris</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Riwayat seluruh aktivitas barang</p>
                </div>
            </div>
        }>
            <Head title="Log Inventaris" />

            <div className="space-y-5">
                {/* Filter */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex flex-wrap gap-3 items-end">
                    <div className="min-w-[160px]">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Filter Aksi</label>
                        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500">
                            <option value="">Semua Aksi</option>
                            {Object.keys(actionColor).map(k => (
                                <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={applyFilter} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all">
                        <FunnelIcon className="w-4 h-4" /> Filter
                    </button>
                </div>

                {/* Log Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/30">
                                    <th className="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Waktu</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Barang</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Barcode</th>
                                    <th className="text-center px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Qty</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Pengguna</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Catatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                                {logs.data.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-16 text-slate-400">Belum ada log transaksi</td></tr>
                                ) : logs.data.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${actionColor[log.action] ?? 'bg-slate-100 text-slate-500'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{log.item?.name}</p>
                                            <p className="text-[10px] font-mono text-slate-400">{log.item?.code}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-[10px] font-mono text-slate-500">{log.barcode?.barcode_value || '-'}</td>
                                        <td className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 dark:text-slate-300">{log.quantity}</td>
                                        <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{log.user?.name || '-'}</td>
                                        <td className="px-4 py-3.5 text-xs text-slate-500 max-w-xs truncate">{log.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                            <span>Menampilkan {logs.from}–{logs.to} dari {logs.total}</span>
                            <div className="flex gap-1">
                                {logs.links.map((link: any, i: number) => (
                                    <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 rounded-lg font-bold transition-all ${link.active ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40'}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
