import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowLeftIcon,
    QrCodeIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Html5Qrcode } from 'html5-qrcode';

interface ScanResult {
    found: boolean;
    message?: string;
    barcode?: any;
    item?: any;
}

const statusColor: Record<string, string> = {
    tersedia:  'bg-emerald-100 text-emerald-700 border-emerald-200',
    dipinjam:  'bg-blue-100 text-blue-700 border-blue-200',
    perbaikan: 'bg-amber-100 text-amber-700 border-amber-200',
    dihapus:   'bg-slate-100 text-slate-500 border-slate-200',
};

const actionInfo: Record<string, { label: string; color: string; allowed: string[] }> = {
    pinjam:             { label: 'Pinjam',            color: 'bg-blue-600 hover:bg-blue-700',       allowed: ['tersedia'] },
    kembali:            { label: 'Kembalikan',        color: 'bg-emerald-600 hover:bg-emerald-700', allowed: ['dipinjam'] },
    perbaikan:          { label: 'Kirim Perbaikan',   color: 'bg-amber-600 hover:bg-amber-700',     allowed: ['tersedia', 'dipinjam'] },
    selesai_perbaikan:  { label: 'Selesai Perbaikan', color: 'bg-teal-600 hover:bg-teal-700',       allowed: ['perbaikan'] },
    pemusnahan:         { label: 'Musnahkan',         color: 'bg-red-600 hover:bg-red-700',         allowed: ['tersedia', 'perbaikan', 'dipinjam'] },
};

export default function InventoryScanner() {
    const [scannerActive, setScannerActive] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [borrowDays, setBorrowDays] = useState('');
    const [borrowerEmail, setBorrowerEmail] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerDivId = 'qr-scanner-region';

    const startScanner = async () => {
        setScannerActive(true);
        await new Promise(r => setTimeout(r, 200));
        const scanner = new Html5Qrcode(scannerDivId);
        scannerRef.current = scanner;
        try {
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 280, height: 140 } },
                async (decodedText) => {
                    await scanner.stop();
                    setScannerActive(false);
                    lookupBarcode(decodedText);
                },
                () => {}
            );
        } catch {
            setScannerActive(false);
            setFeedback({ type: 'error', message: 'Kamera tidak dapat diakses. Gunakan input manual.' });
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try { await scannerRef.current.stop(); } catch {}
        }
        setScannerActive(false);
    };

    const lookupBarcode = async (value: string) => {
        setIsLoading(true);
        setScanResult(null);
        try {
            const res = await fetch(route('admin.inventory.scan'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ barcode_value: value }),
            });
            const data = await res.json();
            setScanResult(data);
        } catch {
            setScanResult({ found: false, message: 'Gagal menghubungi server.' });
        }
        setIsLoading(false);
    };

    const handleManualScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualInput.trim()) return;
        lookupBarcode(manualInput.trim());
        setManualInput('');
    };

    const executeAction = async (action: string) => {
        if (!scanResult?.barcode) return;
        setActionLoading(true);
        try {
            const res = await fetch(route('admin.inventory.action'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ 
                    barcode_id: scanResult.barcode.id, 
                    action, 
                    notes,
                    borrow_days: borrowDays ? parseInt(borrowDays) : null,
                    borrower_email: borrowerEmail || null,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setFeedback({ type: 'success', message: data.message });
                setHistory(prev => [{ action, item: scanResult.item?.name, barcode: scanResult.barcode?.barcode_value, time: new Date().toLocaleTimeString('id-ID') }, ...prev.slice(0, 9)]);
                setScanResult(null);
                setNotes('');
                setBorrowDays('');
                setBorrowerEmail('');
            } else {
                setFeedback({ type: 'error', message: data.message });
            }
        } catch {
            setFeedback({ type: 'error', message: 'Gagal menghubungi server.' });
        }
        setActionLoading(false);
        setTimeout(() => setFeedback(null), 4000);
    };

    useEffect(() => { return () => { stopScanner(); }; }, []);

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-4">
                <a href={route('admin.inventory.index')} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
                </a>
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">Scanner Barcode</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Scan untuk pinjam, kembalikan, atau catat aksi barang</p>
                </div>
            </div>
        }>
            <Head title="Scanner Barcode" />

            {/* Feedback Toast */}
            {feedback && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold transition-all ${feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {feedback.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                    {feedback.message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Scanner & Manual Input */}
                <div className="space-y-5">
                    {/* Camera Scanner */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Scanner Kamera</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Arahkan kamera ke barcode barang</p>
                            </div>
                            <QrCodeIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="p-5">
                            {scannerActive ? (
                                <div className="space-y-3">
                                    <div id={scannerDivId} className="w-full rounded-xl overflow-hidden bg-black" style={{ minHeight: 200 }} />
                                    <button onClick={stopScanner} className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                                        Hentikan Scanner
                                    </button>
                                </div>
                            ) : (
                                <button onClick={startScanner} className="w-full py-10 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <QrCodeIcon className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-sm">Klik untuk Aktifkan Kamera</p>
                                        <p className="text-xs opacity-60 mt-0.5">Pastikan izin kamera sudah diaktifkan</p>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Manual Input */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Input Manual / Barcode Gun</h3>
                        <form onSubmit={handleManualScan} className="flex gap-3">
                            <input
                                type="text" value={manualInput}
                                onChange={e => setManualInput(e.target.value)}
                                placeholder="Ketik atau scan barcode..."
                                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                autoFocus
                            />
                            <button type="submit" disabled={isLoading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 active:scale-95">
                                {isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Cari'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Result & Action */}
                <div className="space-y-5">
                    {/* Scan Result */}
                    {isLoading && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-10 flex flex-col items-center gap-3">
                            <ArrowPathIcon className="w-8 h-8 text-indigo-500 animate-spin" />
                            <p className="text-sm text-slate-500 font-medium">Mencari barcode...</p>
                        </div>
                    )}

                    {!isLoading && scanResult && !scanResult.found && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex items-center gap-4">
                            <XCircleIcon className="w-8 h-8 text-red-500 shrink-0" />
                            <div>
                                <p className="font-bold text-red-700 dark:text-red-400">Barcode Tidak Ditemukan</p>
                                <p className="text-sm text-red-500">{scanResult.message}</p>
                            </div>
                        </div>
                    )}

                    {!isLoading && scanResult?.found && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-900/10">
                                <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Barcode Ditemukan!</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                {/* Item Info */}
                                <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-4 space-y-2">
                                    <p className="text-base font-black text-slate-900 dark:text-white">{scanResult.item?.name}</p>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg font-bold">{scanResult.item?.code}</span>
                                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg">{scanResult.item?.category}</span>
                                        {scanResult.item?.brand && <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 rounded-lg">{scanResult.item.brand}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-slate-500">Status:</span>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${statusColor[scanResult.barcode?.status] ?? ''}`}>
                                            {scanResult.barcode?.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-mono text-slate-400">{scanResult.barcode?.barcode_value}</p>
                                </div>

                                {/* Borrow Form (Only for Tersedia) */}
                                {scanResult.barcode?.status === 'tersedia' && (
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 block mb-1.5">Lama Pinjam (Hari)</label>
                                            <input type="number" min="1" max="365" value={borrowDays} onChange={e => setBorrowDays(e.target.value)} placeholder="Contoh: 7" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 block mb-1.5">Email (Opsional)</label>
                                            <input type="email" value={borrowerEmail} onChange={e => setBorrowerEmail(e.target.value)} placeholder="email@contoh.com" className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1.5">Catatan Aksi (Opsional)</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Keterangan..." className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 resize-none" />
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(actionInfo).map(([action, info]) => {
                                        const isAllowed = info.allowed.includes(scanResult.barcode?.status ?? '');
                                        return (
                                            <button
                                                key={action}
                                                onClick={() => executeAction(action)}
                                                disabled={!isAllowed || actionLoading}
                                                className={`py-2.5 text-sm font-bold rounded-xl text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${info.color}`}
                                            >
                                                {actionLoading ? '...' : info.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button onClick={() => setScanResult(null)} className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">
                                    ✕ Bersihkan & Scan Ulang
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scan History */}
                    {history.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Riwayat Sesi Ini</h3>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700/30 max-h-60 overflow-y-auto custom-scrollbar">
                                {history.map((h, i) => (
                                    <div key={i} className="px-5 py-3 flex items-center gap-3">
                                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg">{h.action}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{h.item}</p>
                                            <p className="text-[10px] font-mono text-slate-400 truncate">{h.barcode}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 shrink-0">{h.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
