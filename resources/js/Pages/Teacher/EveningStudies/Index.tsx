import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    PlusIcon,
    CalendarIcon,
    UserIcon,
    BookOpenIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

export default function Index({ eveningStudies }: any) {
    const handleDelete = (item: any) => {
        if (confirm(`Hapus Jurnal Belajar Malam tanggal ${item.date} untuk kelas ${item.academic_class?.name}?`)) {
            router.delete(route('teacher.evening-studies.destroy', item.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                            Kegiatan Belajar Malam
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Pantau absensi santri, agenda belajar malam, dan dokumentasi foto harian
                        </p>
                    </div>
                    <a
                        href={route('teacher.evening-studies.create')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4" /> Catat Belajar Malam
                    </a>
                </div>
            }
        >
            <Head title="Kegiatan Belajar Malam" />

            <div className="space-y-6">
                {eveningStudies.data.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-700/50 shadow-sm">
                        <BookOpenIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada jurnal belajar malam dicatat</p>
                        <a
                            href={route('teacher.evening-studies.create')}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                            Buat Catatan Pertama
                        </a>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/30">
                                        <th className="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Kelas</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Pengawas</th>
                                        <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Kegiatan Belajar</th>
                                        <th className="text-center px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                                    {eveningStudies.data.map((item: any) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                                        >
                                            <td className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                {new Date(item.date).toLocaleDateString('id-ID', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-4 py-4 font-bold text-slate-800 dark:text-slate-200">
                                                {item.academic_class?.name || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-2">
                                                <UserIcon className="w-4 h-4 text-slate-400" />
                                                {item.supervisor?.name || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-400 max-w-sm">
                                                <p className="font-bold text-slate-700 dark:text-slate-300">{item.activity_name}</p>
                                                <p className="line-clamp-2 mt-0.5 text-slate-400">{item.notes || '-'}</p>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <a
                                                        href={route('teacher.evening-studies.show', item.id)}
                                                        className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 transition-colors"
                                                        title="Detail"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                    </a>
                                                    <a
                                                        href={route('teacher.evening-studies.edit', item.id)}
                                                        className="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors cursor-pointer"
                                                        title="Hapus"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {eveningStudies.last_page > 1 && (
                            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                                <span>
                                    Menampilkan {eveningStudies.from}–{eveningStudies.to} dari {eveningStudies.total}
                                </span>
                                <div className="flex gap-1">
                                    {eveningStudies.links.map((link: any, i: number) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 rounded-lg font-bold transition-all ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
