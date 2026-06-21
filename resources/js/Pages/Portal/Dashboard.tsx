import { Head, Link, usePage } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';
import { useState } from 'react';
import SystemClock from '@/Components/SystemClock';
import usePWA from '@/hooks/usePWA';

export default function Dashboard({ student, unpaidBillsCount, attendanceStats, academics = [], consultations = [], todayStatus, todayAlphaDetails = [], announcements = [] }: any) {
    const totalAttendance = attendanceStats.present + attendanceStats.sick + attendanceStats.permission + attendanceStats.absent;
    const presentPercentage = totalAttendance > 0 
        ? Math.round((attendanceStats.present / totalAttendance) * 100) 
        : 100;

    const { props } = usePage();
    const { vapid_public_key } = props as any;
    const { isInstallable, installApp } = usePWA(vapid_public_key);

    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const months = [
        { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
        { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
    ];

    const handleDownloadReport = () => {
        let url = route('portal.report');
        const params = new URLSearchParams();
        if (selectedMonth) params.append('month', selectedMonth);
        if (selectedYear) params.append('year', selectedYear);
        
        const queryString = params.toString();
        if (queryString) url += '?' + queryString;
        
        window.open(url, '_blank');
        setShowReportModal(false);
    };

    // Helper for today's status badge
    const renderTodayStatus = () => {
        if (!todayStatus) {
            return (
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center min-w-[120px]">
                    <div className="text-sm font-black mt-2 text-slate-300 uppercase tracking-widest">BELUM ADA</div>
                    <div className="text-[10px] font-bold text-blue-200 uppercase mt-2">Absen Hari Ini</div>
                </div>
            );
        }

        const getStatusStyles = () => {
            switch(todayStatus.toLowerCase()) {
                case 'hadir': case 'present': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
                case 'sakit': case 'sick': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
                case 'izin': case 'permission': return 'text-blue-300 border-blue-400/30 bg-blue-400/10';
                case 'alpha': case 'absent': return 'text-rose-400 border-rose-400/30 bg-rose-400/10 ring-2 ring-rose-500/20';
                default: return 'text-white border-white/20 bg-white/10';
            }
        };

        const getStatusLabel = () => {
            switch(todayStatus.toLowerCase()) {
                case 'hadir': case 'present': return 'HADIR';
                case 'sakit': case 'sick': return 'SAKIT';
                case 'izin': case 'permission': return 'IZIN';
                case 'alpha': case 'absent': return 'ALPA';
                default: return todayStatus.toUpperCase();
            }
        };

        const isAlpha = todayStatus.toLowerCase() === 'alpha' || todayStatus.toLowerCase() === 'absent';

        return (
            <div className="flex flex-col gap-2 min-w-[120px]">
                <div className={`backdrop-blur border rounded-2xl p-4 text-center ${getStatusStyles()}`}>
                    <div className="text-xl font-black mt-1 tracking-widest leading-none">{getStatusLabel()}</div>
                    <div className="text-[10px] font-bold opacity-80 uppercase mt-2">Status Hari Ini</div>
                </div>
                {isAlpha && todayAlphaDetails.length > 0 && (
                    <div className="bg-rose-600 text-white p-3 rounded-2xl border border-rose-400 shadow-xl animate-pulse">
                        <div className="text-[9px] font-black uppercase tracking-tighter mb-1 opacity-80">Detail Alpha:</div>
                        <div className="space-y-1">
                            {todayAlphaDetails.slice(0, 3).map((d: any, i: number) => (
                                <div key={i} className="text-[10px] font-bold truncate leading-tight border-b border-white/10 pb-1 last:border-0">
                                    {d.subject} (J-{d.lesson_period})
                                </div>
                            ))}
                            {todayAlphaDetails.length > 3 && <div className="text-[9px] opacity-60">+{todayAlphaDetails.length - 3} lainnya...</div>}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <PortalLayout
            header={<h2 className="font-semibold text-2xl text-slate-800 leading-tight">Beranda Siswa</h2>}
        >
            <Head title="Dashboard Siswa" />

            <div className="space-y-6">

                {/* ANNOUNCEMENTS SECTION */}
                {announcements.length > 0 && (
                    <div className="space-y-4">
                        {announcements.map((ann: any) => (
                            <div 
                                key={ann.id} 
                                className={`p-5 rounded-3xl border flex gap-4 items-start relative overflow-hidden transition-all hover:shadow-lg ${
                                    ann.type === 'important' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                                    ann.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                                    ann.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                                    'bg-blue-50 border-blue-200 text-blue-900'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                    ann.type === 'important' ? 'bg-rose-200 text-rose-600' :
                                    ann.type === 'warning' ? 'bg-amber-200 text-amber-600' :
                                    ann.type === 'success' ? 'bg-emerald-200 text-emerald-600' :
                                    'bg-blue-200 text-blue-600'
                                }`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Pengumuman</span>
                                        <span className="w-1 h-1 rounded-full bg-current opacity-30"></span>
                                        <span className="text-[10px] font-bold opacity-60">{new Date(ann.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                                    </div>
                                    <h4 className="text-lg font-black leading-tight mb-2">{ann.title}</h4>
                                    <div className="text-sm font-medium opacity-80 whitespace-pre-wrap">{ann.content}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Hero Welcome Unit */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg p-8 relative overflow-hidden text-white">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
                    

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <p className="text-blue-100 font-semibold mb-1 text-sm tracking-widest uppercase">Tahun Ajaran 2026/2027</p>
                            <h3 className="text-3xl font-black mb-2">Semangat belajar, {student.name}!</h3>
                            <p className="text-blue-50 max-w-xl text-sm leading-relaxed mb-6">
                                Portal ini menampilkan ringkasan performa akademik dan administratif Anda. Mari pertahankan pencapaian.
                            </p>
                             <div className="flex flex-wrap gap-3">
                                <button 
                                    onClick={() => setShowReportModal(true)}
                                    className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-blue-50 transition-all border-b-4 border-blue-200 active:border-b-0 active:translate-y-1"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Cetak Rapor Digital
                                </button>
                                {isInstallable && (
                                    <button 
                                        onClick={installApp}
                                        className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-amber-300 transition-all border-b-4 border-amber-500 active:border-b-0 active:translate-y-1"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                        Instal Aplikasi
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Quick Status Badges */}
                        <div className="flex flex-col items-end gap-4">
                            <SystemClock light />
                            <div className="flex gap-3">
                                {renderTodayStatus()}
                            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
                                <div className="text-2xl font-black mt-0.5">{totalAttendance}</div>
                                <div className="text-[10px] font-bold text-blue-200 uppercase mt-1.5">Total Absensi</div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* LEFT COLUMN: Administrative & Attendance (Takes 1 Col) */}
                    <div className="space-y-6">
                        
                        {/* WIDGET TAGIHAN */}
                        <div className={`p-6 rounded-3xl shadow-sm border relative overflow-hidden transition-colors ${unpaidBillsCount > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
                            {unpaidBillsCount > 0 ? (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-rose-800">Perhatian: Tunggakan!</h4>
                                        <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                    </div>
                                    <p className="text-rose-700 mb-6 font-medium text-sm">Ada <strong className="text-xl">{unpaidBillsCount}</strong> tagihan administratif yang belum dilunasi.</p>
                                    <Link href={route('portal.bills')} className="inline-block w-full text-center px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors">
                                        Lihat & Bayar Sekarang →
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-slate-800">Administrasi Lunas</h4>
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 mb-6 font-medium text-sm">Luar biasa! Tidak ada tanggungan biaya tertunda.</p>
                                    <Link href={route('portal.bills')} className="inline-block w-full text-center px-5 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl text-sm font-bold transition-colors">
                                        Lihat Histori Tagihan
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* REDESIGNED ATTENDANCE SECTION */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden group">
                            <div className="p-6 pb-0 flex justify-between items-center">
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 tracking-tight">Capaian Kehadiran</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">6 Bulan Terakhir</p>
                                </div>
                                <Link 
                                    href={route('portal.attendance')} 
                                    className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5"
                                >
                                    Lihat Rincian Absensi
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </Link>
                            </div>
                            
                            {/* SVG Progress Ring */}
                            <div className="flex items-center justify-center py-10 relative">
                                <Link href={route('portal.attendance')} className="relative group/ring">
                                    <svg className="w-48 h-48 transform -rotate-90 group-hover/ring:scale-105 transition-transform duration-500">
                                        {/* Background track */}
                                        <circle
                                            cx="96" cy="96" r="80"
                                            stroke="currentColor" strokeWidth="12"
                                            fill="transparent"
                                            className="text-slate-100"
                                        />
                                        {/* Progress bar */}
                                        <circle
                                            cx="96" cy="96" r="80"
                                            stroke="currentColor" strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={2 * Math.PI * 80}
                                            strokeDashoffset={2 * Math.PI * 80 * (1 - presentPercentage / 100)}
                                            strokeLinecap="round"
                                            className="text-blue-600 transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-slate-800 tracking-tighter group-hover/ring:scale-110 transition-transform">{presentPercentage}%</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Hadir</span>
                                    </div>
                                </Link>
                            </div>
                            
                            {/* Status Cards Grid */}
                            <div className="p-6 pt-0">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Hadir', value: attendanceStats.present, color: 'emerald', icon: '✓' },
                                        { label: 'Sakit', value: attendanceStats.sick, color: 'amber', icon: '🤒' },
                                        { label: 'Izin', value: attendanceStats.permission, color: 'blue', icon: '📋' },
                                        { label: 'Alpha', value: attendanceStats.absent, color: 'rose', icon: '✗' },
                                        { label: 'Terlambat', value: attendanceStats.late || 0, color: 'orange', icon: '⏰', full: true },
                                    ].map((s) => (
                                        <Link 
                                            key={s.label} 
                                            href={route('portal.attendance')}
                                            className={`rounded-2xl p-3 flex items-center gap-3 border transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 ${
                                                s.color === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 hover:border-emerald-300' :
                                                s.color === 'amber' ? 'bg-amber-50 border-amber-100 text-amber-800 hover:border-amber-300' :
                                                s.color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-800 hover:border-blue-300' :
                                                s.color === 'rose' ? 'bg-rose-50 border-rose-100 text-rose-800 hover:border-rose-300' :
                                                'bg-orange-50 border-orange-100 text-orange-800 hover:border-orange-300'
                                            } ${s.full ? 'col-span-2' : ''}`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg ${
                                                s.color === 'emerald' ? 'bg-emerald-200/50' :
                                                s.color === 'amber' ? 'bg-amber-200/50' :
                                                s.color === 'blue' ? 'bg-blue-200/50' :
                                                s.color === 'rose' ? 'bg-rose-200/50' :
                                                'bg-orange-200/50'
                                            }`}>
                                                {s.icon}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">{s.label}</p>
                                                <p className="text-lg font-black mt-1 leading-none">{s.value}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Academics & Consultations (Takes 2 Cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* WIDGET AKADEMIK (NILAI) */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-800">Rapor Nilai Penilaian Harian</h4>
                                    <p className="text-xs text-slate-500">Rata-rata 6 bulan terakhir</p>
                                </div>
                                <Link href={route('portal.scores')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">Lihat Semua Nilai →</Link>
                            </div>
                            <div className="p-6">
                                {academics.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {academics.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                                <div className="flex-1">
                                                    <div className="font-bold text-slate-800 text-sm mb-1">{item.subject}</div>
                                                    <div className="text-[10px] uppercase font-semibold text-slate-400">{item.count} Penilaian</div>
                                                </div>
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg bg-blue-100 text-blue-700">
                                                    {item.average}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500 text-sm">Belum ada rekapan nilai akademik yang dimasukkan.</div>
                                )}
                            </div>
                        </div>

                        {/* WIDGET KONSULTASI BK */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                                <div>
                                    <h4 className="text-lg font-bold text-indigo-900">Riwayat Bimbingan & Konseling</h4>
                                    <p className="text-xs text-indigo-700/70">Catatan perkembangan guru wali / BK</p>
                                </div>
                            </div>
                            <div className="p-0">
                                {consultations.length > 0 ? (
                                    <ul className="divide-y divide-slate-100">
                                        {consultations.map((cons: any, idx: number) => (
                                            <li key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <span className="inline-block px-2.5 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg uppercase tracking-wider mb-2">
                                                            {new Date(cons.consultation_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                                                        </span>
                                                        <h5 className="font-bold text-slate-800">{cons.issue}</h5>
                                                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{cons.solution}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                        {cons.homeroom_teacher?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-500">Guru/Wali: {cons.homeroom_teacher?.name}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-10 px-6 text-slate-500 text-sm">Tidak ada catatan pelanggaran atau bimbingan sejauh ini. Pertahankan prestasimu!</div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* REPORT SELECTION MODAL */}
            {showReportModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-bounce-in">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Cetak Rapor Digital</h3>
                                <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </button>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                Pilih rentang waktu laporan yang ingin dicetak. Kosongkan pilihan bulan untuk mencetak ringkasan satu semester.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pilih Bulan</label>
                                    <select 
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                    >
                                        <option value="">Semua Bulan (Last 6 Months)</option>
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pilih Tahun</label>
                                    <select 
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                    >
                                        {[new Date().getFullYear(), new Date().getFullYear()-1].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-3">
                                <button 
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleDownloadReport}
                                    className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Unduh Rapor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PortalLayout>
    );
}
