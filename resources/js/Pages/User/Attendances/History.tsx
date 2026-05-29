import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { 
    CalendarIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    ExclamationTriangleIcon, 
    MapPinIcon, 
    XMarkIcon,
    CameraIcon
} from '@heroicons/react/24/outline';

interface Attendance {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    verification_status: string;
    latitude: number | null;
    longitude: number | null;
    photo_url: string | null;
    checkout_photo_url: string | null;
    notes: string | null;
    checkout_notes: string | null;
    system_notes: string | null;
}

interface Geofence {
    id: number;
    name: string;
    latitude: string;
    longitude: string;
    radius: number;
}

interface HistoryProps extends PageProps {
    attendances: Attendance[];
    geofences: Geofence[];
    stats: {
        total_days: number;
        present: number;
        late: number;
        permit: number;
        alpha: number;
        attendance_rate: number;
    };
    filters: {
        month: string;
        year: string;
    };
}

export default function History({ auth, attendances, geofences, stats, filters }: HistoryProps) {
    const [selectedMonth, setSelectedMonth] = useState(filters.month);
    const [selectedYear, setSelectedYear] = useState(filters.year);
    
    // Modal & Map States
    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [leafletLoaded, setLeafletLoaded] = useState(false);
    const modalMapRef = useRef<any>(null);

    const MONTHS = [
        { value: '01', label: 'Januari' },
        { value: '02', label: 'Februari' },
        { value: '03', label: 'Maret' },
        { value: '04', label: 'April' },
        { value: '05', label: 'Mei' },
        { value: '06', label: 'Juni' },
        { value: '07', label: 'Juli' },
        { value: '08', label: 'Agustus' },
        { value: '09', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' }
    ];

    const YEARS = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

    // Handle filter changes
    const handleFilterChange = (month: string, year: string) => {
        setSelectedMonth(month);
        setSelectedYear(year);
        router.get(route('attendances.history'), { month, year }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Load Leaflet dynamically
    useEffect(() => {
        if ((window as any).L) {
            setLeafletLoaded(true);
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => setLeafletLoaded(true);
        document.body.appendChild(script);
    }, []);

    // Load Modal Map
    useEffect(() => {
        if (!selectedAttendance || !isMapOpen || !leafletLoaded || !selectedAttendance.latitude || !selectedAttendance.longitude) return;

        const L = (window as any).L;
        if (!L) return;

        const containerId = 'history-modal-map';
        
        // Timeout to ensure modal DOM is fully rendered
        const timer = setTimeout(() => {
            const mapContainer = document.getElementById(containerId);
            if (!mapContainer) return;

            try {
                const lat = Number(selectedAttendance.latitude);
                const lng = Number(selectedAttendance.longitude);

                if (modalMapRef.current) {
                    modalMapRef.current.remove();
                    modalMapRef.current = null;
                }

                modalMapRef.current = L.map(containerId, {
                    zoomControl: true,
                    attributionControl: false
                }).setView([lat, lng], 16);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(modalMapRef.current);

                // Geofences
                geofences.forEach(gf => {
                    L.circle([parseFloat(gf.latitude), parseFloat(gf.longitude)], {
                        color: '#4f46e5',
                        fillColor: '#818cf8',
                        fillOpacity: 0.15,
                        radius: gf.radius
                    }).addTo(modalMapRef.current).bindPopup(`<b>${gf.name}</b><br>Radius: ${gf.radius}m`);
                });

                // User Marker
                const userIcon = L.divIcon({
                    className: 'custom-history-icon',
                    html: `<div class="w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center"><div class="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                L.marker([lat, lng], { icon: userIcon })
                    .addTo(modalMapRef.current)
                    .bindPopup(`<b>Lokasi Absensi</b><br>Tanggal: ${formatIndoDate(selectedAttendance.date)}`)
                    .openPopup();

            } catch (err) {
                console.error("Modal map error: ", err);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (modalMapRef.current) {
                modalMapRef.current.remove();
                modalMapRef.current = null;
            }
        };
    }, [selectedAttendance, isMapOpen, leafletLoaded]);

    const formatIndoDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const getStatusBadge = (status: string) => {
        const styleMap: Record<string, string> = {
            hadir: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40',
            terlambat: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40',
            izin: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40',
            sakit: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800/40',
            alpha: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40',
            lembur: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/40',
            pulang_awal: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/40'
        };

        const labelMap: Record<string, string> = {
            hadir: 'Hadir',
            terlambat: 'Terlambat',
            izin: 'Izin',
            sakit: 'Sakit',
            alpha: 'Alpha',
            lembur: 'Lembur',
            pulang_awal: 'Pulang Awal'
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${styleMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                {labelMap[status] || status}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">Riwayat Absensi Saya</h2>
                    <p className="text-xs text-slate-500 font-medium">Lihat dan lacak seluruh data kehadiran serta catatan presensi Anda</p>
                </div>
            }
        >
            <Head title="Riwayat Absensi Saya" />

            <div className="space-y-6 py-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                
                {/* ── SECTION 1: Filters ── */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-indigo-600 shrink-0" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Rentang Waktu Laporan</h3>
                            <p className="text-xs text-slate-400">Pilih bulan dan tahun untuk memfilter riwayat</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select
                            value={selectedMonth}
                            onChange={(e) => handleFilterChange(e.target.value, selectedYear)}
                            className="text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 py-2.5 pl-3 pr-8 flex-1 sm:flex-none cursor-pointer"
                        >
                            {MONTHS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                        
                        <select
                            value={selectedYear}
                            onChange={(e) => handleFilterChange(selectedMonth, e.target.value)}
                            className="text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 py-2.5 pl-3 pr-8 flex-1 sm:flex-none cursor-pointer"
                        >
                            {YEARS.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── SECTION 2: Attendance Stats Summary ── */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl shadow-sm text-center relative overflow-hidden flex flex-col justify-center min-h-[110px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Persentase Kehadiran</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{stats.attendance_rate}%</span>
                        <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 rounded-full blur-xl"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl shadow-sm text-center relative overflow-hidden flex flex-col justify-center min-h-[110px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Hadir Tepat Waktu</span>
                        <span className="text-2xl font-black text-emerald-600 mt-2">{stats.present - stats.late} Hari</span>
                        <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-full blur-xl"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl shadow-sm text-center relative overflow-hidden flex flex-col justify-center min-h-[110px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Datang Terlambat</span>
                        <span className="text-2xl font-black text-amber-500 mt-2">{stats.late} Hari</span>
                        <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-amber-50 dark:bg-amber-950/20 rounded-full blur-xl"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl shadow-sm text-center relative overflow-hidden flex flex-col justify-center min-h-[110px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Izin & Sakit</span>
                        <span className="text-2xl font-black text-blue-500 mt-2">{stats.permit} Hari</span>
                        <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-blue-50 dark:bg-blue-950/20 rounded-full blur-xl"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl shadow-sm text-center col-span-2 lg:col-span-1 relative overflow-hidden flex flex-col justify-center min-h-[110px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tanpa Keterangan (Alpha)</span>
                        <span className="text-2xl font-black text-rose-600 mt-2">{stats.alpha} Hari</span>
                        <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-rose-50 dark:bg-rose-950/20 rounded-full blur-xl"></div>
                    </div>
                </div>

                {/* ── SECTION 3: Detailed History Table ── */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 overflow-hidden shadow-sm shadow-slate-100/50 dark:shadow-none">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-700/60">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider">Check-In</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider">Check-Out</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-700 dark:text-slate-200">
                                {attendances.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                                        
                                        {/* Date */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                                {formatIndoDate(item.date)}
                                            </div>
                                        </td>
                                        
                                        {/* Status */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {getStatusBadge(item.status)}
                                        </td>

                                        {/* Check-In Details */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-start space-x-3 min-w-[200px]">
                                                {item.photo_url ? (
                                                    <div className="relative group shrink-0">
                                                        <img 
                                                            src={item.photo_url} 
                                                            alt="Check-in selfie" 
                                                            className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-sm"
                                                        />
                                                        <a href={item.photo_url} target="_blank" className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <CameraIcon className="w-4 h-4 text-white" />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                                        <ClockIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center">
                                                        <ClockIcon className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                                        {item.check_in || '--:--'}
                                                    </div>
                                                    {item.notes && (
                                                        <p className="text-[10px] mt-1 text-slate-500 font-medium italic max-w-[200px] break-words">
                                                            "{item.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Check-Out Details */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-start space-x-3 min-w-[200px]">
                                                {item.checkout_photo_url ? (
                                                    <div className="relative group shrink-0">
                                                        <img 
                                                            src={item.checkout_photo_url} 
                                                            alt="Check-out selfie" 
                                                            className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-sm"
                                                        />
                                                        <a href={item.checkout_photo_url} target="_blank" className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <CameraIcon className="w-4 h-4 text-white" />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                                                        <ClockIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center">
                                                        <ClockIcon className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                                        {item.check_out || '--:--'}
                                                    </div>
                                                    {item.checkout_notes && (
                                                        <p className="text-[10px] mt-1 text-slate-500 font-medium italic max-w-[200px] break-words">
                                                            "{item.checkout_notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {item.latitude && item.longitude ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedAttendance(item);
                                                        setIsMapOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    <MapPinIcon className="w-4 h-4" />
                                                    <span>Lihat Lokasi</span>
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-medium">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {attendances.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <ExclamationTriangleIcon className="w-10 h-10 text-slate-350 opacity-50" />
                                                <p className="text-sm font-semibold">Belum ada riwayat absensi pada periode ini.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── SECTION 4: Map Visual Modal ── */}
            {isMapOpen && selectedAttendance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-x-hidden overflow-y-auto">
                    {/* Modal Overlay */}
                    <div 
                        onClick={() => setIsMapOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl z-10 border border-slate-100 dark:border-slate-700/80 transform transition-all">
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-150 dark:border-slate-700/60 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lokasi Presensi Pegawai</h3>
                                <p className="text-[10px] text-slate-400 font-medium">{formatIndoDate(selectedAttendance.date)}</p>
                            </div>
                            <button
                                onClick={() => setIsMapOpen(false)}
                                className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Map Container */}
                            <div className="relative">
                                <div 
                                    id="history-modal-map" 
                                    className="w-full h-80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner z-0"
                                ></div>
                                {!leafletLoaded && (
                                    <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                                        Memuat peta...
                                    </div>
                                )}
                            </div>

                            {/* Details inside modal */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Check-In</span>
                                    <span className="text-xs font-black mt-1 inline-flex items-center text-slate-700 dark:text-slate-300">
                                        <ClockIcon className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                        {selectedAttendance.check_in || '--:--'}
                                    </span>
                                    {selectedAttendance.notes && (
                                        <p className="text-[10px] text-slate-500 italic mt-1 font-medium">"{selectedAttendance.notes}"</p>
                                    )}
                                </div>
                                
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Check-Out</span>
                                    <span className="text-xs font-black mt-1 inline-flex items-center text-slate-700 dark:text-slate-300">
                                        <ClockIcon className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                                        {selectedAttendance.check_out || '--:--'}
                                    </span>
                                    {selectedAttendance.checkout_notes && (
                                        <p className="text-[10px] text-slate-500 italic mt-1 font-medium">"{selectedAttendance.checkout_notes}"</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-150 dark:border-slate-700/60 flex justify-end">
                            <button
                                onClick={() => setIsMapOpen(false)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
