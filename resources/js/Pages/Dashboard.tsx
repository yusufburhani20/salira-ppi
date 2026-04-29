import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import Card, { CardHeader } from '@/Components/Card';
import { 
    DocumentChartBarIcon, 
    UserIcon, 
    AcademicCapIcon, 
    TrophyIcon, 
    FunnelIcon,
    ArrowUpRightIcon,
    QrCodeIcon,
    ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import SystemClock from '@/Components/SystemClock';
import { useState } from 'react';

export default function Dashboard({ 
    stats, 
    chartData, 
    activeUsers, 
    lastLogins, 
    todayAttendance, 
    attendanceRanking, 
    assessmentRanking,
    inventoryStats,
    classes,
    filters 
}: any) {
    const [classId, setClassId] = useState(filters?.academic_class_id || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const handleFilterChange = (id: string, start: string, end: string) => {
        setClassId(id);
        setStartDate(start);
        setEndDate(end);
        router.get(route('dashboard'), { academic_class_id: id, start_date: start, end_date: end }, { 
            preserveState: true,
            preserveScroll: true,
            only: ['stats', 'chartData', 'attendanceRanking', 'assessmentRanking', 'filters']
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="text-xl font-black leading-tight text-slate-800 dark:text-slate-200 tracking-tight">
                            Dashboard Overview
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Pantau seluruh aktivitas akademik secara real-time</p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <FunnelIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <select 
                            value={classId}
                            onChange={(e) => handleFilterChange(e.target.value, startDate, endDate)}
                            className="text-xs font-semibold border-none bg-transparent focus:ring-0 text-slate-600 dark:text-slate-300 cursor-pointer py-0 pl-1 pr-7"
                        >
                            <option value="">Semua Kelas</option>
                            {classes?.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">
                
                {/* ── SECTION 1: Welcome Banner with Quick Actions ── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-500/20 isolate">
                    {/* Decorative blobs */}
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />



                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8 p-6 sm:p-8 lg:p-10">
                        {/* Left: Hero Text */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-5">
                                <span className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                    Sistem Terintegrasi
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-300 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    Live System
                                </span>
                            </div>
                            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
                                Optimalkan<br />
                                <span className="text-amber-400">Pengelolaan Akademik</span>
                            </h3>
                            <p className="text-indigo-100/80 text-sm sm:text-base leading-relaxed max-w-lg">
                                Pantau presensi, penilaian, dan aktivitas bimbingan secara real-time dengan dashboard cerdas SALIRA.
                            </p>
                        </div>

                        {/* Right: Quick Action Cards */}
                        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[220px]">
                            <div className="mb-2 lg:mb-4">
                                <SystemClock light />
                            </div>
                            <a 
                                href={route('admin.reports.index')} 
                                className="group flex items-center gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 hover:border-white/30 rounded-xl p-4 transition-all duration-200 active:scale-95"
                            >
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                                    <DocumentChartBarIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white">Akses Laporan</p>
                                    <p className="text-[10px] text-indigo-200/70 font-medium">Rekap & Rekapitulasi</p>
                                </div>
                                <ArrowUpRightIcon className="w-4 h-4 text-white/50 group-hover:text-white shrink-0 transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>

                            <a 
                                href={route('attendances.scanner')} 
                                className="group flex items-center gap-4 bg-amber-400/15 hover:bg-amber-400/25 backdrop-blur-sm border border-amber-400/25 hover:border-amber-400/50 rounded-xl p-4 transition-all duration-200 active:scale-95"
                            >
                                <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-400/30 transition-colors">
                                    <QrCodeIcon className="w-5 h-5 text-amber-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-amber-200">Presensi Pegawai</p>
                                    <p className="text-[10px] text-amber-300/60 font-medium">Check-in Geolokasi</p>
                                </div>
                                <ArrowUpRightIcon className="w-4 h-4 text-amber-300/50 group-hover:text-amber-300 shrink-0 transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 2: Stats Grid ── */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="Siswa Hadir" 
                        value={stats?.students_present || 0} 
                        trend={{ value: 100, isPositive: true, label: "hari ini" }}
                        icon={<UserIcon className="w-5 h-5" />}
                        colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                    />
                    <StatCard 
                        title="Izin / Sakit" 
                        value={stats?.students_permit || 0} 
                        icon={<AcademicCapIcon className="w-5 h-5" />}
                        colorClass="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                    />
                    <StatCard 
                        title="Konsultasi Tertunda" 
                        value={stats?.consultations_pending || 0} 
                        icon={<DocumentChartBarIcon className="w-5 h-5" />}
                        colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                    />
                    <StatCard 
                        title="Barang Dipinjam" 
                        value={stats?.items_borrowed || 0} 
                        icon={<TrophyIcon className="w-5 h-5" />}
                        colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                    />
                </div>

                {/* ── SECTION 3: Chart + Active Users + Last Logins ── */}
                <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
                    
                    {/* Chart — takes 60% on desktop */}
                    <div className="w-full lg:w-[58%] bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col">
                        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Persentase Kehadiran Siswa</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Grafik kehadiran berdasarkan rentang waktu yang dipilih</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => handleFilterChange(classId, e.target.value, endDate)}
                                    className="text-xs rounded-md border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1"
                                />
                                <span className="text-slate-400 text-xs">-</span>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => handleFilterChange(classId, startDate, e.target.value)}
                                    className="text-xs rounded-md border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1"
                                />
                            </div>
                        </div>
                        <div className="flex-1 p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="w-full overflow-x-auto custom-scrollbar">
                                <div className="relative" style={{ height: '260px', minWidth: Math.max(480, (chartData?.length || 0) * 40) + 'px' }}>
                                    {/* Y-axis labels + grid lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12 pt-12">
                                        {[100, 75, 50, 25, 0].map(v => (
                                            <div key={v} className="relative flex items-center">
                                                <span className="text-[9px] font-bold text-slate-400 w-7 text-right shrink-0 pr-2">{v}</span>
                                                <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700/60"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chart bars area — positioned above labels */}
                                    <div className="absolute left-7 right-0 top-12 bottom-12 flex items-end gap-2 sm:gap-3">
                                        {chartData?.map((item: any, i: number) => (
                                            <div key={i} className="flex-1 h-full flex items-end group relative cursor-pointer">
                                                {/* Tooltip — rendered ABOVE the bar */}
                                                <div 
                                                    className="absolute inset-x-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20"
                                                    style={{ bottom: `${item.height || 0}%` }}
                                                >
                                                    <div className="bg-slate-900/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap text-center mb-1">
                                                        {item.date} · {item.height}%<br/>
                                                        <span className="text-[8px] text-slate-300 font-medium">{item.present ?? 0} dari {item.total ?? 0} siswa</span>
                                                    </div>
                                                </div>

                                                <div
                                                    className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110 shadow-md shadow-indigo-500/20 min-h-[3px] relative overflow-hidden"
                                                    style={{ height: `${item.height || 0}%` }}
                                                >
                                                    {/* Shine on top */}
                                                    <div className="absolute inset-x-2 top-1 h-0.5 bg-white/30 rounded-full"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Labels row — always pinned at bottom */}
                                    <div className="absolute left-7 right-0 bottom-0 h-12 flex items-start pt-2 gap-2 sm:gap-3 border-t border-slate-200 dark:border-slate-700">
                                        {chartData?.map((item: any, i: number) => (
                                            <div key={i} className="flex-1 flex flex-col items-center text-center">
                                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-none">{item.date}</span>
                                                <span className="text-[9px] font-semibold text-indigo-500 mt-1">{item.height}%</span>
                                                <span className="text-[8px] font-medium text-slate-400 mt-0.5">{item.present ?? 0} dari {item.total ?? 0} siswa</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column: User Aktif + Log Login — stacked, takes 40% */}
                    <div className="w-full lg:w-[42%] flex flex-col sm:flex-row lg:flex-col gap-5 lg:h-[420px]">
                        
                        {/* User Aktif */}
                        <div className="w-full sm:w-1/2 lg:w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col flex-1 min-h-0">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">User Aktif</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sedang online sekarang</p>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">LIVE</span>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                                {activeUsers?.length > 0 ? activeUsers.map((user: any) => (
                                    <div key={user.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-default">
                                        <div className="relative shrink-0">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm overflow-hidden border border-indigo-100 dark:border-slate-600">
                                                {user.avatar ? <img src={`/storage/${user.avatar}`} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.name}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-40">
                                        <UserIcon className="w-7 h-7 text-slate-400" />
                                        <p className="text-xs text-slate-500 font-semibold">Belum ada user aktif</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Log Login Terakhir */}
                        <div className="w-full sm:w-1/2 lg:w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col flex-1 min-h-0">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log Login Terakhir</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Audit akses sistem terbaru</p>
                            </div>
                            <div className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                                {lastLogins?.map((user: any) => (
                                    <div key={user.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-default">
                                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm overflow-hidden border border-slate-200 dark:border-slate-600 shrink-0">
                                            {user.avatar ? <img src={`/storage/${user.avatar}`} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                                            <p className="text-[10px] text-indigo-500 font-semibold">{user.time_ago}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── SECTION 4: Ranking Cards & Inventory Summary ── */}
                <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
                    
                    {/* Attendance Ranking */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col h-[420px]">
                        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0">
                                <TrophyIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ranking Kehadiran</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Seluruh data siswa</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                            {attendanceRanking?.length > 0 ? attendanceRanking.map((item: any, i: number) => (
                                <RankingRow key={i} item={item} rank={i+1} unit="Sesi" />
                            )) : <EmptyRanking />}
                        </div>
                    </div>

                    {/* Assessment Ranking */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col h-[420px]">
                        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                            <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
                                <AcademicCapIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ranking Penilaian</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Seluruh data siswa</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                            {assessmentRanking?.length > 0 ? assessmentRanking.map((item: any, i: number) => (
                                <RankingRow key={i} item={item} rank={i+1} unit="AVG" />
                            )) : <EmptyRanking />}
                        </div>
                    </div>

                    {/* Inventory Summary */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col">
                        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center shrink-0">
                                    <ArchiveBoxIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Status Inventaris</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rekapitulasi {inventoryStats?.total || 0} unit fisik</p>
                                </div>
                            </div>
                            <a href={route('admin.inventory.index')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg self-start xl:self-auto transition-colors whitespace-nowrap">Detail &rarr;</a>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-center gap-6">
                            {/* Visual Progress Bar */}
                            <div className="w-full h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex gap-0.5 shadow-inner">
                                <div className="bg-emerald-500 transition-all duration-1000" style={{ width: `${((inventoryStats?.tersedia || 0) / (inventoryStats?.total || 1)) * 100}%` }} title={`Tersedia: ${inventoryStats?.tersedia || 0}`} />
                                <div className="bg-blue-500 transition-all duration-1000" style={{ width: `${((inventoryStats?.dipinjam || 0) / (inventoryStats?.total || 1)) * 100}%` }} title={`Dipinjam: ${inventoryStats?.dipinjam || 0}`} />
                                <div className="bg-amber-500 transition-all duration-1000" style={{ width: `${((inventoryStats?.perbaikan || 0) / (inventoryStats?.total || 1)) * 100}%` }} title={`Perbaikan: ${inventoryStats?.perbaikan || 0}`} />
                                <div className="bg-slate-500 transition-all duration-1000" style={{ width: `${((inventoryStats?.dihapus || 0) / (inventoryStats?.total || 1)) * 100}%` }} title={`Dihapus: ${inventoryStats?.dihapus || 0}`} />
                            </div>
                            
                            {/* Legend Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Tersedia</span>
                                    <span className="text-base font-black text-emerald-600">{inventoryStats?.tersedia || 0}</span>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Dipinjam</span>
                                    <span className="text-base font-black text-blue-600">{inventoryStats?.dipinjam || 0}</span>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Perbaikan</span>
                                    <span className="text-base font-black text-amber-600">{inventoryStats?.perbaikan || 0}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500"></span>Musnah</span>
                                    <span className="text-base font-black text-slate-500 text-slate-500">{inventoryStats?.dihapus || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ── Sub-components ─────────────────────────────────

function RankingRow({ item, rank, unit }: { item: any; rank: number; unit: string }) {
    const medals = ['🥇', '🥈', '🥉'];
    const barWidth = unit === 'AVG' 
        ? Math.min(100, (item.value / 100) * 100) 
        : Math.min(100, item.value * 8);

    return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50">
            <div className="w-7 text-center shrink-0">
                {rank <= 3 
                    ? <span className="text-base leading-none">{medals[rank-1]}</span>
                    : <span className="text-xs font-black text-slate-400 dark:text-slate-500">{rank}</span>
                }
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0">
                {item.avatar ? <img src={`/storage/${item.avatar}`} className="w-full h-full object-cover" /> : item.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 mt-1.5 rounded-full overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${barWidth}%` }}
                    />
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{item.value}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{unit}</p>
            </div>
        </div>
    );
}

function EmptyRanking() {
    return (
        <div className="py-10 flex flex-col items-center justify-center gap-2 opacity-40">
            <TrophyIcon className="w-8 h-8 text-slate-400" />
            <p className="text-xs text-slate-500 font-semibold text-center">Belum ada data ranking<br/>untuk kelas ini</p>
        </div>
    );
}
