import React, { useEffect, useState, useRef } from 'react';
import PortalLayout from '@/Layouts/PortalLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import axios from 'axios';
import { 
    CameraIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    InformationCircleIcon,
    AcademicCapIcon,
    ClockIcon,
    UserIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

interface ScanResult {
    student_name: string;
    subject: string;
    teacher: string;
    time: string;
}

export default function Scanner() {
    const { props } = usePage();
    const auth = props.auth as any;
    const isGuest = !auth?.user;

    const [lastResult, setLastResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize scanner
        scannerRef.current = new Html5QrcodeScanner(
            "reader", 
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
            }, 
            /* verbose= */ false
        );

        scannerRef.current.render(onScanSuccess, onScanFailure);

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner", error);
                });
            }
        };
    }, []);

    const onScanSuccess = (decodedText: string) => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        setError(null);
        
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate(100);

        axios.post(route('portal.attendance.scan'), { qr_token: decodedText })
            .then(res => {
                setLastResult(res.data.data);
                // Reset processing after 3 seconds to allow next scan
                setTimeout(() => {
                    setIsProcessing(false);
                    setLastResult(null);
                }, 3000);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Gagal memproses QR');
                setIsProcessing(false);
                setTimeout(() => setError(null), 3000);
            });
    };

    const onScanFailure = (error: string) => {
        // We generally ignore scan failures as they happen every frame
    };

    const ScannerContent = (
        <div className="max-w-xl mx-auto py-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
                {/* Header Info */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <CameraIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold leading-tight">Scan Kartu Pelajar</h3>
                            <p className="text-xs text-blue-100">Posisikan QR Code di kotak scan</p>
                        </div>
                    </div>
                    {isGuest && (
                        <Link 
                            href={route('portal.login')} 
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            EXIT
                        </Link>
                    )}
                </div>

                {/* Scanner Area */}
                <div className="relative aspect-square sm:aspect-video md:aspect-square bg-slate-900 flex items-center justify-center overflow-hidden">
                    <div id="reader" className="w-full h-full scale-110"></div>
                    
                    {/* Status Overlays */}
                    {isProcessing && !lastResult && !error && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent shadow-lg"></div>
                                <span className="text-white font-bold text-sm tracking-widest uppercase">Memproses...</span>
                            </div>
                        </div>
                    )}

                    {lastResult && (
                        <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in zoom-in duration-300">
                            <div className="p-8 text-center text-white flex flex-col items-center max-w-sm">
                                <CheckCircleIcon className="w-20 h-20 mb-4 animate-bounce" />
                                <h4 className="text-2xl font-black mb-2">Presensi Berhasil!</h4>
                                
                                <div className="w-full bg-white/10 rounded-2xl p-4 text-left border border-white/20 space-y-3">
                                    <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                                        <div className="p-1.5 bg-white/20 rounded-lg"><UserIcon className="w-4 h-4" /></div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] uppercase font-bold text-emerald-100">Nama Siswa</p>
                                            <p className="font-bold truncate">{lastResult.student_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white/20 rounded-lg"><AcademicCapIcon className="w-4 h-4" /></div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] uppercase font-bold text-emerald-100">Mata Pelajaran</p>
                                            <p className="font-bold truncate">{lastResult.subject}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div className="flex items-center gap-2">
                                            <ClockIcon className="w-4 h-4 text-emerald-200" />
                                            <span className="text-sm font-medium">{lastResult.time} WIB</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold px-2 py-1 bg-white text-emerald-700 rounded-full uppercase">HADIR</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="mt-6 text-xs text-emerald-100 italic">Siap untuk scan berikutnya...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 bg-rose-600/90 backdrop-blur-md flex items-center justify-center z-20 animate-in fade-in zoom-in duration-300">
                            <div className="p-8 text-center text-white flex flex-col items-center">
                                <XCircleIcon className="w-20 h-20 mb-4 animate-pulse" />
                                <h4 className="text-2xl font-black mb-2">Gagal!</h4>
                                <p className="bg-white/20 px-4 py-2 rounded-xl text-sm font-medium border border-white/20">
                                    {error}
                                </p>
                                <p className="mt-8 text-xs text-rose-100">Silakan coba lagi atau hubungi petugas</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Instructions */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-start gap-4">
                        <InformationCircleIcon className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <div className="space-y-2">
                            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">Petunjuk Penggunaan:</h5>
                            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                                <li>Pastikan pencahayaan cukup terang</li>
                                <li>Scanner ini dapat digunakan tanpa login akun siswa</li>
                                <li>Jika berhasil, detail siswa akan muncul selama 3 detik</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                #reader { border: none !important; }
                #reader img { display: none !important; }
                #reader__scan_region { background: #0f172a !important; }
                #reader__dashboard_section_csr button {
                    background-color: #2563eb !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 12px !important;
                    font-weight: 700 !important;
                    font-size: 12px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                }
                #reader__dashboard_section_csr button:hover {
                    background-color: #1d4ed8 !important;
                    transform: scale(1.05) !important;
                }
                #reader__dashboard_section_csr button:active {
                    transform: scale(0.95) !important;
                }
                #reader__status_span { display: none !important; }
            `}</style>
        </div>
    );

    if (isGuest) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <Head title="Kiosk Scanner Presensi" />
                <div className="w-full flex justify-center mb-6">
                    <img src="/images/Salira.png" alt="Logo" className="h-10 w-auto brightness-0 invert opacity-50" />
                </div>
                {ScannerContent}
            </div>
        );
    }

    return (
        <PortalLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Scanner Presensi Mandiri</h2>}
        >
            <Head title="Scanner Presensi" />
            {ScannerContent}
        </PortalLayout>
    );
}
