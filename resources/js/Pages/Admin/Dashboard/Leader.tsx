import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import { 
    DocumentChartBarIcon, 
    UserIcon, 
    AcademicCapIcon, 
    BanknotesIcon, 
    UserGroupIcon,
    ArrowUpRightIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import SystemClock from '@/Components/SystemClock';

export default function LeaderDashboard({ stats, activeUsers, lastLogins, inventoryStats, filters }: any) {
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const handleFilterChange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
        router.get(route('admin.dashboard.leader'), { start_date: start, end_date: end }, { 
            preserveState: true,
            preserveScroll: true,
            only: ['stats', 'filters']
        });
    };
    const studentPresentRate = Math.round((stats.students.present / (stats.students.total || 1)) * 100);
    const teacherPresentRate = Math.round((stats.teachers.present / (stats.teachers.total || 1)) * 100);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="text-xl font-black leading-tight text-slate-800 dark:text-slate-200 tracking-tight">
                            Dashboard Eksekutif
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Pantau kesehatan sekolah dan statistik utama</p>
                    </div>
                </div>
            }
        >
            <Head title="Leader Dashboard" />

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
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-300 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    Live Data
                                </span>
                            </div>
                            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
                                Ringkasan<br />
                                <span className="text-amber-400">Kesehatan Sekolah</span>
                            </h3>
                            <p className="text-indigo-100/80 text-sm sm:text-base leading-relaxed max-w-lg">
                                Tinjau statistik kehadiran, laporan keuangan, dan metrik penting lainnya secara real-time.
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
                                    <p className="text-sm font-bold text-white">Laporan Sekolah</p>
                                    <p className="text-[10px] text-indigo-200/70 font-medium">Lihat Semua Laporan</p>
                                </div>
                                <ArrowUpRightIcon className="w-4 h-4 text-white/50 group-hover:text-white shrink-0 transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 2: Stats Grid ── */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="Kehadiran Siswa" 
                        value={`${studentPresentRate}%`}
                        trend={{ value: stats.students.present, isPositive: true, label: `dari ${stats.students.total} Siswa`, suffix: '' }}
                        icon={<AcademicCapIcon className="w-5 h-5" />}
                        colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                    />
                    <StatCard 
                        title="Kehadiran Guru" 
                        value={`${teacherPresentRate}%`} 
                        trend={{ value: stats.teachers.present, isPositive: true, label: `dari ${stats.teachers.total} Guru`, suffix: '' }}
                        icon={<UserGroupIcon className="w-5 h-5" />}
                        colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                    />
                    <StatCard 
                        title="Siswa Alpha" 
                        value={stats.students.absent} 
                        trend={{ value: stats.students.absent, isPositive: stats.students.absent === 0, label: "Tanpa Keterangan", suffix: '' }}
                        icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                        colorClass="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                    />
                    <StatCard 
                        title="Keuangan (Bulan Ini)" 
                        value={`Rp ${(stats.finance.paid / 1000000).toFixed(1)}jt`} 
                        trend={{ value: (stats.finance.unpaid / 1000000).toFixed(1), isPositive: false, label: "jt Tunggakan", suffix: '' }}
                        icon={<BanknotesIcon className="w-5 h-5" />}
                        colorClass="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                    />
                </div>

                {/* ── SECTION 3: Chart + Active Users + Last Logins ── */}
                <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
                    
                    {/* Chart — takes 58% on desktop */}
                    <div className="w-full lg:w-[58%] bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col">
                        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    Tren Kehadiran Siswa
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Grafik kehadiran berdasarkan rentang waktu yang dipilih</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => handleFilterChange(e.target.value, endDate)}
                                    className="text-xs rounded-md border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1"
                                />
                                <span className="text-slate-400 text-xs">-</span>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => handleFilterChange(startDate, e.target.value)}
                                    className="text-xs rounded-md border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1"
                                />
                            </div>
                        </div>
                        <div className="flex-1 p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="w-full overflow-x-auto custom-scrollbar">
                                <div className="relative" style={{ height: '260px', minWidth: Math.max(480, (stats.weeklyTrend?.length || 0) * 40) + 'px' }}>
                                    {/* Y-axis labels + grid lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12 pt-12">
                                        {[100, 75, 50, 25, 0].map(v => (
                                            <div key={v} className="relative flex items-center">
                                                <span className="text-[9px] font-bold text-slate-400 w-7 text-right shrink-0 pr-2">{v}</span>
                                                <div className="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700/60"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chart bars area */}
                                    <div className="absolute left-7 right-0 top-12 bottom-12 flex items-end gap-2 sm:gap-3">
                                        {stats.weeklyTrend?.map((item: any, i: number) => {
                                            const height = Math.round((item.count / (stats.students.total || 1)) * 100);
                                            return (
                                                <div key={i} className="flex-1 h-full flex items-end group relative cursor-pointer">
                                                    {/* Tooltip — rendered ABOVE the bar */}
                                                    <div 
                                                        className="absolute inset-x-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20"
                                                        style={{ bottom: `${height || 0}%` }}
                                                    >
                                                        <div className="bg-slate-900/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap text-center mb-1">
                                                            {item.date} · {height}%<br/>
                                                            <span className="text-[8px] text-slate-300 font-medium">{item.count ?? 0} dari {stats.students.total ?? 0} siswa</span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110 shadow-md shadow-indigo-500/20 min-h-[3px] relative overflow-hidden"
                                                        style={{ height: `${height || 0}%` }}
                                                    >
                                                        {/* Shine on top */}
                                                        <div className="absolute inset-x-2 top-1 h-0.5 bg-white/30 rounded-full"></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Labels row */}
                                    <div className="absolute left-7 right-0 bottom-0 h-12 flex items-start pt-2 gap-2 sm:gap-3 border-t border-slate-200 dark:border-slate-700">
                                        {stats.weeklyTrend?.map((item: any, i: number) => {
                                            const height = Math.round((item.count / (stats.students.total || 1)) * 100);
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center text-center">
                                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-none">{item.date}</span>
                                                    <span className="text-[9px] font-semibold text-indigo-500 mt-1">{height}%</span>
                                                    <span className="text-[8px] font-medium text-slate-400 mt-0.5">{item.count ?? 0} dari {stats.students.total ?? 0} siswa</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column: User Aktif + Log Login — stacked, takes 42% */}
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

                {/* ── SECTION 4: Breakdown Stats & Inventory Summary ── */}
                <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
                    {/* Breakdown Stats */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rincian Kehadiran Hari Ini</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Status kehadiran siswa</p>
                            </div>
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-center gap-4">
                            <BreakdownItem label="Hadir/Tap" value={stats.students.present} colorClass="bg-emerald-500" />
                            <BreakdownItem label="Sakit" value={stats.students.sick} colorClass="bg-rose-400" />
                            <BreakdownItem label="Izin" value={stats.students.permission} colorClass="bg-amber-400" />
                            <BreakdownItem label="Alpha" value={stats.students.absent} colorClass="bg-slate-400" />

                            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-700/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Siswa</span>
                                    <span className="text-xl font-black text-slate-800 dark:text-slate-200">{stats.students.total}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex gap-0.5 shadow-inner">
                                    <div className="bg-emerald-500" style={{ width: `${studentPresentRate}%` }} />
                                    <div className="bg-slate-300 dark:bg-slate-600" style={{ width: `${100 - studentPresentRate}%` }} />
                                </div>
                            </div>
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

function BreakdownItem({ label, value, colorClass }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">{value}</span>
        </div>
    );
}
