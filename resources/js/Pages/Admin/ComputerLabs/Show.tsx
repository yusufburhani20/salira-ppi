import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    QrCodeIcon,
    ArrowLeftIcon,
    DocumentArrowUpIcon,
    PrinterIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const statusLabel: Record<string, { label: string; color: string; icon: any }> = {
    active: {
        label: 'Baik / Aktif',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircleIcon,
    },
    maintenance: {
        label: 'Perbaikan',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: WrenchScrewdriverIcon,
    },
    broken: {
        label: 'Rusak',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: ExclamationTriangleIcon,
    },
};

export default function Show({ lab, kepalaPrograms }: any) {
    const [showUnitForm, setShowUnitForm] = useState(false);
    const [editUnit, setEditUnit] = useState<any>(null);
    
    const [showReportModal, setShowReportModal] = useState(false);
    const [viewQrUnit, setViewQrUnit] = useState<any>(null);

    const [showScannerModal, setShowScannerModal] = useState(false);
    const [scannerActive, setScannerActive] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // PC Unit Form
    const unitForm = useForm({
        code: '',
        name: '',
        brand: '',
        processor: '',
        ram: '',
        storage: '',
        gpu: '',
        os: '',
        status: 'active',
        note: '',
    });

    // Report Form
    const reportForm = useForm({
        recipient_id: kepalaPrograms[0]?.id || '',
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
        end_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const openAddUnit = () => {
        unitForm.reset();
        // Prefill code format based on lab
        const nextNum = String(lab.units.length + 1).padStart(2, '0');
        unitForm.setData({
            code: `${lab.name.replace(/\s+/g, '').toUpperCase()}-PC${nextNum}`,
            name: `PC ${nextNum}`,
            brand: '',
            processor: '',
            ram: '',
            storage: '',
            gpu: '',
            os: '',
            status: 'active',
            note: '',
        });
        setEditUnit(null);
        setShowUnitForm(true);
    };

    const openEditUnit = (unit: any) => {
        setEditUnit(unit);
        unitForm.setData({
            code: unit.code,
            name: unit.name,
            brand: unit.brand || '',
            processor: unit.processor || '',
            ram: unit.ram || '',
            storage: unit.storage || '',
            gpu: unit.gpu || '',
            os: unit.os || '',
            status: unit.status,
            note: unit.note || '',
        });
        setShowUnitForm(true);
    };

    const handleUnitSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editUnit) {
            unitForm.put(route('admin.computer-units.update', editUnit.id), {
                onSuccess: () => {
                    setShowUnitForm(false);
                    unitForm.reset();
                },
            });
        } else {
            unitForm.post(route('admin.computer-labs.units.store', lab.id), {
                onSuccess: () => {
                    setShowUnitForm(false);
                    unitForm.reset();
                },
            });
        }
    };

    const handleUnitDelete = (unit: any) => {
        if (confirm(`Hapus unit PC "${unit.code}"? Tindakan ini tidak bisa dibatalkan.`)) {
            router.delete(route('admin.computer-units.destroy', unit.id));
        }
    };

    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        reportForm.post(route('admin.computer-labs.send-report', lab.id), {
            onSuccess: () => {
                setShowReportModal(false);
                reportForm.reset('notes');
            },
        });
    };

    const handleDownloadPdf = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!reportForm.data.recipient_id) {
            reportForm.setError('recipient_id', 'Penerima laporan harus dipilih.');
            return;
        }
        if (!reportForm.data.start_date) {
            reportForm.setError('start_date', 'Tanggal mulai harus diisi.');
            return;
        }
        if (!reportForm.data.end_date) {
            reportForm.setError('end_date', 'Tanggal selesai harus diisi.');
            return;
        }

        const url = route('admin.computer-labs.download-report', lab.id) + 
            `?recipient_id=${reportForm.data.recipient_id}` +
            `&start_date=${reportForm.data.start_date}` +
            `&end_date=${reportForm.data.end_date}` +
            `&notes=${encodeURIComponent(reportForm.data.notes)}`;
        
        window.open(url, '_blank');
    };

    // Scanner functions
    const extractPcCode = (scannedValue: string) => {
        const match = scannedValue.match(/[\?&]code=([^&]+)/);
        if (match) {
            return decodeURIComponent(match[1]);
        }
        return scannedValue.trim();
    };

    const startScanner = async () => {
        setScannerError(null);
        setScannerActive(true);
        await new Promise(r => setTimeout(r, 200));
        const scanner = new Html5Qrcode('pc-qr-scanner-region');
        scannerRef.current = scanner;
        try {
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                async (decodedText) => {
                    await stopScanner();
                    handleScannedCode(decodedText);
                },
                () => {}
            );
        } catch (err) {
            setScannerActive(false);
            setScannerError('Kamera tidak dapat diakses atau diblokir. Silakan ketik kode PC secara manual.');
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (e) {}
            scannerRef.current = null;
        }
        setScannerActive(false);
    };

    const handleScannedCode = (value: string) => {
        const pcCode = extractPcCode(value);
        const unit = lab.units.find((u: any) => u.code.toLowerCase() === pcCode.toLowerCase());
        if (unit) {
            openEditUnit(unit);
            setManualCode('');
            setShowScannerModal(false);
        } else {
            alert(`Unit PC dengan kode "${pcCode}" tidak ditemukan di lab ${lab.name}.`);
        }
    };

    const handleManualScanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualCode.trim()) return;
        handleScannedCode(manualCode);
    };

    useEffect(() => {
        if (showScannerModal) {
            startScanner();
        } else {
            stopScanner();
        }
        return () => {
            stopScanner();
        };
    }, [showScannerModal]);

    // Calculate stats
    const totalCount = lab.units.length;
    const activeCount = lab.units.filter((u: any) => u.status === 'active').length;
    const maintenanceCount = lab.units.filter((u: any) => u.status === 'maintenance').length;
    const brokenCount = lab.units.filter((u: any) => u.status === 'broken').length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <a
                            href={route('admin.computer-labs.index')}
                            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                        </a>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                                {lab.name}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">{lab.location || 'Tidak ada info lokasi'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setShowScannerModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                            <QrCodeIcon className="w-4 h-4" /> Scan QR PC
                        </button>
                        <a
                            href={route('admin.computer-labs.print-qrs', lab.id)}
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                            <PrinterIcon className="w-4 h-4" /> Cetak QR Massal (PDF)
                        </a>
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                        >
                            <DocumentArrowUpIcon className="w-4 h-4" /> Kirim Stock Opname
                        </button>
                        <button
                            onClick={openAddUnit}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                        >
                            <PlusIcon className="w-4 h-4" /> Tambah Unit PC
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Lab ${lab.name}`} />

            <div className="space-y-6">
                {/* Mobile Header (Visible only on mobile / screens < lg) */}
                <div className="lg:hidden flex items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100/80 dark:border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-3">
                        <a
                            href={route('admin.computer-labs.index')}
                            className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                        </a>
                        <div>
                            <h2 className="text-base font-black text-slate-800 dark:text-slate-200 tracking-tight">
                                {lab.name}
                            </h2>
                            <p className="text-[10px] text-slate-500 mt-0.5">{lab.location || 'Tidak ada info lokasi'}</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Action Buttons (Visible only on mobile / screens < lg) */}
                <div className="lg:hidden grid grid-cols-2 gap-2 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100/80 dark:border-slate-700/50 shadow-sm">
                    <button
                        onClick={() => setShowScannerModal(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                        <QrCodeIcon className="w-4 h-4" /> Scan QR PC
                    </button>
                    <a
                        href={route('admin.computer-labs.print-qrs', lab.id)}
                        target="_blank"
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                        <PrinterIcon className="w-4 h-4" /> Cetak QR Massal
                    </a>
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                    >
                        <DocumentArrowUpIcon className="w-4 h-4" /> Kirim Opname
                    </button>
                    <button
                        onClick={openAddUnit}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4" /> Tambah Unit PC
                    </button>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Unit PC', value: totalCount, color: 'indigo', icon: QrCodeIcon },
                        { label: 'Kondisi Baik', value: activeCount, color: 'emerald', icon: CheckCircleIcon },
                        { label: 'Sedang Perbaikan', value: maintenanceCount, color: 'amber', icon: WrenchScrewdriverIcon },
                        { label: 'Rusak / Bermasalah', value: brokenCount, color: 'red', icon: ExclamationTriangleIcon },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-4"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 dark:bg-${s.color}-900/30 flex items-center justify-center shrink-0`}>
                                <s.icon className={`w-5 h-5 text-${s.color}-600 dark:text-${s.color}-400`} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* PC Units Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/30">
                                    <th className="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Kode PC</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Merek & Tipe</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Spesifikasi Utama</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Kondisi</th>
                                    <th className="text-center px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                                {lab.units.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-16 text-slate-400 text-sm">
                                            Belum ada unit PC terdaftar di lab ini
                                        </td>
                                    </tr>
                                ) : (
                                    lab.units.map((unit: any) => {
                                        const badge = statusLabel[unit.status] || { label: unit.status, color: 'bg-slate-100 text-slate-700', icon: CheckCircleIcon };
                                        return (
                                            <tr
                                                key={unit.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                                            >
                                                <td className="px-5 py-3.5 font-bold font-mono text-slate-800 dark:text-slate-200">
                                                    {unit.code}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <p className="font-semibold text-slate-700 dark:text-slate-300">{unit.name}</p>
                                                    <p className="text-[10px] text-slate-400">{unit.brand || 'No Brand'}</p>
                                                </td>
                                                <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                                                    <div className="flex flex-wrap gap-x-2 gap-y-1 font-medium">
                                                        {unit.processor && <span>{unit.processor}</span>}
                                                        {unit.ram && <span>• RAM {unit.ram}</span>}
                                                        {unit.storage && <span>• Disk {unit.storage}</span>}
                                                        {unit.gpu && <span>• GPU {unit.gpu}</span>}
                                                        {unit.os && <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-bold">{unit.os}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
                                                        <badge.icon className="w-3.5 h-3.5" />
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => setViewQrUnit(unit)}
                                                            className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 text-indigo-500 transition-colors cursor-pointer"
                                                            title="Tampilkan QR Code"
                                                        >
                                                            <QrCodeIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditUnit(unit)}
                                                            className="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors cursor-pointer"
                                                            title="Edit PC"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUnitDelete(unit)}
                                                            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors cursor-pointer"
                                                            title="Hapus PC"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* PC Unit Form Modal */}
            {showUnitForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white">
                                {editUnit ? 'Edit Unit PC' : 'Tambah Unit PC'}
                            </h3>
                            <button
                                onClick={() => setShowUnitForm(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUnitSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Kode PC *
                                    </label>
                                    <input
                                        value={unitForm.data.code}
                                        onChange={(e) => unitForm.setData('code', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono"
                                        placeholder="LAB-PC01"
                                        required
                                    />
                                    {unitForm.errors.code && <p className="text-xs text-red-500 mt-1">{unitForm.errors.code}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Nama PC / Nomor Meja *
                                    </label>
                                    <input
                                        value={unitForm.data.name}
                                        onChange={(e) => unitForm.setData('name', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="PC 01"
                                        required
                                    />
                                    {unitForm.errors.name && <p className="text-xs text-red-500 mt-1">{unitForm.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Merek / Brand Tipe
                                    </label>
                                    <input
                                        value={unitForm.data.brand}
                                        onChange={(e) => unitForm.setData('brand', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="mis: Lenovo ThinkCentre"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Sistem Operasi (OS)
                                    </label>
                                    <input
                                        value={unitForm.data.os}
                                        onChange={(e) => unitForm.setData('os', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="Windows 11 / Ubuntu"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Processor (CPU)
                                    </label>
                                    <input
                                        value={unitForm.data.processor}
                                        onChange={(e) => unitForm.setData('processor', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="Intel Core i5-12400"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        RAM
                                    </label>
                                    <input
                                        value={unitForm.data.ram}
                                        onChange={(e) => unitForm.setData('ram', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="16 GB DDR4"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Storage / Penyimpanan
                                    </label>
                                    <input
                                        value={unitForm.data.storage}
                                        onChange={(e) => unitForm.setData('storage', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="512 GB SSD NVMe"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Kartu Grafis (GPU)
                                    </label>
                                    <input
                                        value={unitForm.data.gpu}
                                        onChange={(e) => unitForm.setData('gpu', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="NVIDIA GTX 1650 / Integrated"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Status Kondisi *
                                    </label>
                                    <select
                                        value={unitForm.data.status}
                                        onChange={(e) => unitForm.setData('status', e.target.value)}
                                        className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="active">Baik / Aktif</option>
                                        <option value="maintenance">Sedang Perbaikan</option>
                                        <option value="broken">Rusak / Bermasalah</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Catatan / Keterangan
                                    </label>
                                    <textarea
                                        value={unitForm.data.note}
                                        onChange={(e) => unitForm.setData('note', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        rows={3}
                                        placeholder="Catatan tambahan mengenai unit PC ini..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUnitForm(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={unitForm.processing}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    {unitForm.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR View Modal */}
            {viewQrUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black text-slate-900 dark:text-white">QR Code Unit</h3>
                            <button
                                onClick={() => setViewQrUnit(null)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl inline-block mb-4 border border-slate-100 dark:border-slate-800">
                            <QRCodeSVG
                                value={route('public.computer-issues.report') + '?code=' + viewQrUnit.code}
                                size={180}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">
                            {viewQrUnit.code}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Scan QR Code ini untuk melaporkan kerusakan unit PC ini.
                        </p>
                        <button
                            onClick={() => window.print()}
                            className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                            Cetak QR Code
                        </button>
                    </div>
                </div>
            )}

            {/* Stock Opname Mail Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white">Kirim Laporan Stock Opname</h3>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 animate-pulse"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                    Pilih Kepala Program *
                                </label>
                                <select
                                    value={reportForm.data.recipient_id}
                                    onChange={(e) => reportForm.setData('recipient_id', e.target.value)}
                                    className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                >
                                    <option value="">Pilih Penerima Laporan</option>
                                    {kepalaPrograms.map((kp: any) => (
                                        <option key={kp.id} value={kp.id}>
                                            {kp.name} ({kp.email})
                                        </option>
                                    ))}
                                </select>
                                {reportForm.errors.recipient_id && <p className="text-xs text-red-500 mt-1">{reportForm.errors.recipient_id}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Tanggal Mulai *
                                    </label>
                                    <input
                                        type="date"
                                        value={reportForm.data.start_date}
                                        onChange={(e) => reportForm.setData('start_date', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    />
                                    {reportForm.errors.start_date && <p className="text-xs text-red-500 mt-1">{reportForm.errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Tanggal Selesai *
                                    </label>
                                    <input
                                        type="date"
                                        value={reportForm.data.end_date}
                                        onChange={(e) => reportForm.setData('end_date', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    />
                                    {reportForm.errors.end_date && <p className="text-xs text-red-500 mt-1">{reportForm.errors.end_date}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                    Catatan / Rekomendasi Laboran
                                </label>
                                <textarea
                                    value={reportForm.data.notes}
                                    onChange={(e) => reportForm.setData('notes', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    rows={4}
                                    placeholder="Tuliskan analisis, catatan kerusakan, atau permohonan pengadaan barang baru..."
                                />
                                {reportForm.errors.notes && <p className="text-xs text-red-500 mt-1">{reportForm.errors.notes}</p>}
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        disabled={reportForm.processing}
                                        onClick={handleDownloadPdf}
                                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <PrinterIcon className="w-4 h-4" /> Unduh PDF
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={reportForm.processing}
                                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <DocumentArrowUpIcon className="w-4 h-4" /> Kirim Email
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowReportModal(false)}
                                    className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Scanner Modal */}
            {showScannerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <QrCodeIcon className="w-5 h-5 text-indigo-500" />
                                <span>Scan QR Code Unit PC</span>
                            </h3>
                            <button
                                onClick={() => setShowScannerModal(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Camera Frame */}
                            {scannerActive ? (
                                <div className="space-y-3">
                                    <div id="pc-qr-scanner-region" className="w-full rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-700" style={{ minHeight: 250 }} />
                                    <p className="text-xs text-center text-slate-500">Posisikan QR Code di tengah kamera</p>
                                </div>
                            ) : (
                                <div className="py-10 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                    {scannerError ? (
                                        <div className="text-center px-4 text-rose-500">
                                            <ExclamationTriangleIcon className="w-10 h-10 mx-auto mb-2 text-rose-500" />
                                            <p className="font-bold text-xs">{scannerError}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse flex items-center justify-center mx-auto text-slate-400">
                                                <QrCodeIcon className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 font-medium">Memulai kamera...</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Manual Lookup form */}
                            <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Input Kode Manual</h4>
                                <form onSubmit={handleManualScanSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                        placeholder="mis: LAB1-PC01"
                                        className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                                    >
                                        Cari
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
