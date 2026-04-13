import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowLeftIcon,
    QrCodeIcon,
    PlusIcon,
    TrashIcon,
    PrinterIcon,
    ClockIcon,
    WrenchScrewdriverIcon,
    ArrowUturnLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

declare const JsBarcode: any;

const statusBadge: Record<string, string> = {
    tersedia:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200',
    dipinjam:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200',
    perbaikan: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200',
    dihapus:   'bg-slate-100 text-slate-500 border border-slate-200',
};

const statusLabel: Record<string, string> = {
    tersedia: 'Tersedia', dipinjam: 'Dipinjam', perbaikan: 'Perbaikan', dihapus: 'Dihapus',
};

const actionColor: Record<string, string> = {
    masuk: 'bg-emerald-100 text-emerald-700', keluar: 'bg-red-100 text-red-700',
    pinjam: 'bg-blue-100 text-blue-700', kembali: 'bg-indigo-100 text-indigo-700',
    perbaikan: 'bg-amber-100 text-amber-700', pemusnahan: 'bg-slate-100 text-slate-500',
};

// Available actions per current status
const actionMap: Record<string, { action: string; label: string; icon: any; color: string }[]> = {
    tersedia: [
        { action: 'pinjam',    label: 'Pinjam',          icon: null, color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' },
        { action: 'perbaikan', label: 'Kirim Perbaikan', icon: null, color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' },
    ],
    dipinjam: [
        { action: 'kembali',   label: 'Kembalikan',      icon: null, color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' },
        { action: 'perbaikan', label: 'Kirim Perbaikan', icon: null, color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' },
    ],
    perbaikan: [
        { action: 'kembali',    label: 'Selesai Perbaikan', icon: null, color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' },
        { action: 'pemusnahan', label: 'Musnahkan',          icon: null, color: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' },
    ],
    dihapus: [],
};

interface BarcodeItemProps {
    barcode: any;
    onDelete: () => void;
    onAction: (barcodeId: number, action: string, notes: string) => Promise<boolean>;
}

function BarcodeItem({ barcode, onDelete, onAction }: BarcodeItemProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showNotes, setShowNotes] = useState<string | null>(null); // which action is pending notes
    const [notes, setNotes] = useState('');
    const [localStatus, setLocalStatus] = useState(barcode.status);

    useEffect(() => {
        const render = () => {
            if (svgRef.current && typeof JsBarcode !== 'undefined') {
                try { JsBarcode(svgRef.current, barcode.barcode_value, { format: 'CODE128', width: 1.4, height: 36, displayValue: true, fontSize: 9, margin: 4 }); } catch {}
            }
        };
        if (typeof JsBarcode === 'undefined') {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js';
            s.onload = render;
            document.head.appendChild(s);
        } else { render(); }
    }, [barcode.barcode_value]);

    const handlePrint = () => {
        const w = window.open('', '_blank', 'width=420,height=320');
        if (!w || !svgRef.current) return;
        w.document.write(`<!DOCTYPE html><html><head><title>${barcode.barcode_value}</title><style>body{display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;font-family:monospace;}div{text-align:center;padding:16px;border:1px solid #ccc;border-radius:8px;}</style></head><body><div>${svgRef.current.outerHTML}<p style="font-size:10px;margin-top:6px">${barcode.serial_number || ''}</p></div><script>window.print();window.close();<\/script></body></html>`);
    };

    const confirmAction = async (action: string) => {
        setActionLoading(action);
        const ok = await onAction(barcode.id, action, notes);
        if (ok) {
            // Optimistically update local status
            const newStatus: Record<string, string> = {
                pinjam: 'dipinjam', kembali: 'tersedia', perbaikan: 'perbaikan', pemusnahan: 'dihapus',
            };
            setLocalStatus(newStatus[action] ?? localStatus);
        }
        setActionLoading(null);
        setShowNotes(null);
        setNotes('');
    };

    const actions = actionMap[localStatus] ?? [];

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col gap-3">
            {/* Barcode image */}
            <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-900/30 rounded-xl py-2 px-1">
                <svg ref={svgRef} className="max-w-full" />
            </div>

            {/* Info */}
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[10px] font-mono text-slate-500 truncate">{barcode.barcode_value}</p>
                    {barcode.serial_number && <p className="text-[10px] text-slate-400">{barcode.serial_number}</p>}
                </div>
                <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-lg ${statusBadge[localStatus] ?? ''}`}>
                    {statusLabel[localStatus] ?? localStatus}
                </span>
            </div>

            {/* Notes input (shown when action needs confirmation) */}
            {showNotes && (
                <div className="space-y-1.5 p-2.5 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        Konfirmasi: {actionMap[localStatus]?.find(a => a.action === showNotes)?.label}
                    </p>
                    <textarea
                        rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Catatan (opsional)..."
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 resize-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <div className="flex gap-1.5">
                        <button onClick={() => { setShowNotes(null); setNotes(''); }} className="flex-1 text-[10px] font-bold py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-100 transition-all">Batal</button>
                        <button onClick={() => confirmAction(showNotes)} disabled={!!actionLoading} className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all">
                            {actionLoading ? '...' : 'Ya, Konfirmasi'}
                        </button>
                    </div>
                </div>
            )}

            {/* Action buttons */}
            {!showNotes && localStatus !== 'dihapus' && (
                <div className="flex flex-col gap-1.5">
                    {actions.map(a => (
                        <button
                            key={a.action}
                            onClick={() => setShowNotes(a.action)}
                            disabled={!!actionLoading}
                            className={`w-full text-[10px] font-bold py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 ${a.color}`}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Print + Delete */}
            <div className="flex gap-2">
                <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-xl transition-all">
                    <PrinterIcon className="w-3 h-3" /> Cetak
                </button>
                <button onClick={onDelete} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-500 text-[10px] font-bold rounded-xl transition-all">
                    <TrashIcon className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

export default function InventoryShow({ item }: any) {
    const [showGenForm, setShowGenForm] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({ quantity: 1, serial_prefix: '' });

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.inventory.barcodes.store', item.id), {
            onSuccess: () => { setShowGenForm(false); reset(); },
        });
    };

    const handleDeleteBarcode = (barcodeId: number) => {
        if (confirm('Hapus barcode ini?')) {
            router.delete(route('admin.inventory.barcodes.destroy', barcodeId));
        }
    };

    const handleAction = async (barcodeId: number, action: string, notes: string): Promise<boolean> => {
        try {
            const res = await fetch(route('admin.inventory.action'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ barcode_id: barcodeId, action, notes }),
            });
            const json = await res.json();
            if (json.success) {
                showToast('success', json.message);
                return true;
            } else {
                showToast('error', json.message);
                return false;
            }
        } catch {
            showToast('error', 'Gagal menghubungi server.');
            return false;
        }
    };

    // Group barcodes by status for the summary
    const grouped = (item.barcodes || []).reduce((acc: Record<string, number>, bc: any) => {
        acc[bc.status] = (acc[bc.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-4">
                <a href={route('admin.inventory.index')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
                </a>
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">{item.name}</h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{item.code} · {item.category?.name}</p>
                </div>
            </div>
        }>
            <Head title={`Inventaris: ${item.name}`} />

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                    {toast.msg}
                </div>
            )}

            <div className="space-y-6">
                {/* Item Info + Status Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        {/* Detail */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-6 space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Detail Barang</h3>
                            <dl className="space-y-3">
                                {[
                                    ['Nama', item.name],
                                    ['Kode', item.code],
                                    ['Merek', item.brand || '-'],
                                    ['Lokasi', item.location || '-'],
                                    ['Harga Satuan', item.unit_price ? `Rp ${Number(item.unit_price).toLocaleString('id')}` : '-'],
                                    ['Deskripsi', item.description || '-'],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex gap-3">
                                        <dt className="text-xs text-slate-400 font-medium w-24 shrink-0">{k}</dt>
                                        <dd className="text-xs text-slate-800 dark:text-slate-200 font-semibold flex-1">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* Status Summary */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-5 space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rekapitulasi Unit</h3>
                            <div className="space-y-2">
                                {[
                                    { key: 'tersedia',  label: 'Tersedia',   color: 'bg-emerald-500' },
                                    { key: 'dipinjam',  label: 'Dipinjam',   color: 'bg-blue-500' },
                                    { key: 'perbaikan', label: 'Perbaikan',  color: 'bg-amber-500' },
                                    { key: 'dihapus',   label: 'Dimusnahkan', color: 'bg-slate-400' },
                                ].map(({ key, label, color }) => {
                                    const count = grouped[key] || 0;
                                    const total = item.barcodes?.length || 1;
                                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                    return (
                                        <div key={key}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">{label}</span>
                                                <span className="font-black text-slate-800 dark:text-slate-200">{count} unit</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                <p className="text-xs text-slate-400 pt-1 text-right">Total: {item.barcodes?.length || 0} unit terdaftar</p>
                            </div>
                        </div>
                    </div>

                    {/* Barcodes */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kelola Unit Barcode</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Klik tombol aksi pada kartu untuk ubah status unit</p>
                            </div>
                            <button onClick={() => setShowGenForm(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95">
                                <PlusIcon className="w-4 h-4" /> Generate Barcode
                            </button>
                        </div>

                        {/* Legend */}
                        {item.barcodes?.length > 0 && (
                            <div className="px-5 pt-4 flex flex-wrap gap-2">
                                {[
                                    { label: 'Tersedia', color: 'bg-emerald-100 text-emerald-700' },
                                    { label: 'Dipinjam', color: 'bg-blue-100 text-blue-700' },
                                    { label: 'Perbaikan', color: 'bg-amber-100 text-amber-700' },
                                ].map(l => (
                                    <span key={l.label} className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${l.color}`}>{l.label}</span>
                                ))}
                                <span className="text-[9px] text-slate-400 ml-1">← Status ditampilkan di pojok kanan kartu. Klik tombol untuk mengubah.</span>
                            </div>
                        )}

                        {item.barcodes?.length === 0 ? (
                            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                                <QrCodeIcon className="w-12 h-12 opacity-30" />
                                <p className="text-sm font-semibold">Belum ada barcode</p>
                                <p className="text-xs opacity-60">Klik "Generate Barcode" untuk mendaftarkan unit</p>
                            </div>
                        ) : (
                            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                {item.barcodes.map((bc: any) => (
                                    <BarcodeItem
                                        key={bc.id}
                                        barcode={bc}
                                        onDelete={() => handleDeleteBarcode(bc.id)}
                                        onAction={handleAction}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Logs */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                        <ClockIcon className="w-5 h-5 text-slate-400" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Riwayat Transaksi</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Log semua aktivitas barang ini</p>
                        </div>
                    </div>
                    {item.logs?.length === 0 ? (
                        <div className="py-10 text-center text-slate-400 text-sm">Belum ada log transaksi</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700/30 max-h-72 overflow-y-auto custom-scrollbar">
                            {item.logs.map((log: any) => (
                                <div key={log.id} className="px-6 py-3 flex items-center gap-4">
                                    <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-lg ${actionColor[log.action] ?? 'bg-slate-100 text-slate-500'}`}>{log.action}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">{log.user?.name}</p>
                                        {log.barcode && <p className="text-[10px] font-mono text-slate-400">{log.barcode.barcode_value}</p>}
                                        {log.notes && <p className="text-[10px] text-slate-500">{log.notes}</p>}
                                    </div>
                                    <span className="shrink-0 text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString('id-ID')}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Generate Modal */}
            {showGenForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white">Generate Barcode</h3>
                            <button onClick={() => setShowGenForm(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleGenerate} className="p-6 space-y-4">
                            <div>
                                <label className="label-form">Jumlah Unit *</label>
                                <input type="number" min={1} max={100} value={data.quantity} onChange={e => setData('quantity', parseInt(e.target.value))} className="input-form" />
                                {errors.quantity && <p className="error-text">{errors.quantity}</p>}
                            </div>
                            <div>
                                <label className="label-form">Prefix Serial Number (Opsional)</label>
                                <input value={data.serial_prefix} onChange={e => setData('serial_prefix', e.target.value)} className="input-form" placeholder="mis: SN2024-A" />
                                <p className="text-[10px] text-slate-400 mt-1">Hasil: SN2024-A-001, SN2024-A-002, ...</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowGenForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">Batal</button>
                                <button type="submit" disabled={processing} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all">
                                    {processing ? 'Generating...' : `Generate ${data.quantity} Unit`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
