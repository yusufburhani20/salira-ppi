import PortalLayout from '@/Layouts/PortalLayout';
import { Head } from '@inertiajs/react';

export default function Attendance({ attendances }: { attendances: any }) {
    const getStatusStyles = (status: string) => {
        switch(status.toLowerCase()) {
            case 'hadir': case 'present': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
            case 'sakit': case 'sick': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
            case 'izin': case 'permission': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
            case 'alpha': case 'absent': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <PortalLayout header="Riwayat Kehadiran">
            <Head title="Kehadiran Siswa" />

            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Log Presensi Detail</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Daftar kehadiran Anda di setiap sesi pembelajaran.</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                                    <th className="px-8 py-4">Tanggal</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50 font-medium">
                                {attendances.data.length > 0 ? (
                                    attendances.data.map((att: any) => (
                                        <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="text-slate-800 dark:text-slate-200">
                                                    {new Date(att.date).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusStyles(att.status?.value || att.status)}`}>
                                                    {att.status?.value || att.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">{att.notes || '-'}</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-12 text-center text-slate-400 italic">Belum ada data kehadiran tersedia.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {attendances.links && attendances.links.length > 3 && (
                        <div className="p-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/10">
                            <div className="flex flex-wrap justify-center gap-2">
                                {attendances.links.map((link: any, k: number) => (
                                    <button
                                        key={k}
                                        disabled={!link.url}
                                        onClick={() => link.url && (window.location.href = link.url)}
                                        className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all ${
                                            link.active 
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                            : link.url 
                                                ? 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600' 
                                                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 border-slate-100 dark:border-slate-800 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PortalLayout>
    );
}
