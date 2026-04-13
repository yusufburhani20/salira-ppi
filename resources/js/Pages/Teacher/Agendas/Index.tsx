import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { 
    PlusIcon, 
    BookOpenIcon, 
    CalendarIcon, 
    UsersIcon, 
    ClockIcon, 
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface Agenda {
    id: number;
    subject: string;
    lesson_period: string;
    topic: string;
    activities?: string;
    student_tasks?: string;
    date: string;
    academic_class: {
        name: string;
    };
    attendances?: any[];
}

export default function AgendaIndex({ auth, agendas }: PageProps<{ agendas: Agenda[] }>) {
    const [selectedAgenda, setSelectedAgenda] = useState<Agenda | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const openDetail = async (id: number) => {
        setLoading(true);
        setIsModalOpen(true);
        try {
            const response = await axios.get(route('teacher.agendas.show', id));
            setSelectedAgenda(response.data);
        } catch (error) {
            console.error("Failed to fetch agenda details", error);
            setIsModalOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus jurnal mengajar ini? Semua data absensi terkait juga akan dihapus.')) {
            router.delete(route('teacher.agendas.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const attendanceStats = selectedAgenda?.attendances?.reduce((acc: any, curr: any) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {}) || {};

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Jurnal Mengajar</h2>}
        >
            <Head title="Jurnal Mengajar" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header Action */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Riwayat Jurnal</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Daftar aktivitas mengajar dan absensi yang telah Anda catat.</p>
                        </div>
                        <Link
                            href={route('teacher.agendas.create')}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-xl font-bold text-sm text-white hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 transition ease-in-out duration-150 shadow-lg shadow-indigo-500/30"
                        >
                            <PlusIcon className="w-5 h-5 mr-1.5" />
                            Buat Jurnal Baru
                        </Link>
                    </div>

                    {/* Agenda Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b dark:border-gray-700">
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">Kelas</th>
                                        <th className="px-6 py-4">Mata Pelajaran</th>
                                        <th className="px-6 py-4">Jam Ke</th>
                                        <th className="px-6 py-4">Topik</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {agendas.map((agenda) => (
                                        <tr key={agenda.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-300 text-xs">
                                                {new Date(agenda.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold">
                                                    {agenda.academic_class.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                                {agenda.subject}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                {agenda.lesson_period}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                                                {agenda.topic}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-1">
                                                <button
                                                    onClick={() => openDetail(agenda.id)}
                                                    className="inline-flex items-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <Link
                                                    href={route('teacher.agendas.edit', agenda.id)}
                                                    className="inline-flex items-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
                                                    title="Edit Jurnal"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(agenda.id)}
                                                    className="inline-flex items-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                                                    title="Hapus Jurnal"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {agendas.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center">
                                                <BookOpenIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Belum ada jurnal mengajar</h3>
                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Mulai catat aktivitas kelas Anda dengan tombol "Buat Jurnal Baru".</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAIL MODAL */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="4xl">
                <div className="relative">
                    {/* Header */}
                    <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <BookOpenIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detail Jurnal Mengajar</h3>
                                <p className="text-xs text-slate-500 font-medium">Informasi lengkap kegiatan pembelajaran</p>
                            </div>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <XMarkIcon className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>

                    <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                                <p className="text-sm font-bold text-indigo-500 animate-pulse">Memuat Data...</p>
                            </div>
                        ) : selectedAgenda && (
                            <div className="space-y-8">
                                {/* Top Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Kelas', value: selectedAgenda.academic_class.name, icon: UsersIcon },
                                        { label: 'Mata Pelajaran', value: selectedAgenda.subject, icon: BookOpenIcon },
                                        { label: 'Jam Ke', value: selectedAgenda.lesson_period, icon: ClockIcon },
                                        { label: 'Tanggal', value: new Date(selectedAgenda.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), icon: CalendarIcon },
                                    ].map((item, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <div className="flex items-center gap-3 mb-2">
                                                <item.icon className="w-4 h-4 text-indigo-500 opacity-50" />
                                                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{item.label}</span>
                                            </div>
                                            <p className="font-bold text-gray-800 dark:text-white truncate">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Content */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Topik Pembelajaran</h4>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold text-gray-800 dark:text-white border border-slate-100 dark:border-slate-800">
                                                {selectedAgenda.topic}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Aktivitas Kelas</h4>
                                            <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap border border-slate-100 dark:border-slate-800">
                                                {selectedAgenda.activities}
                                            </div>
                                        </div>
                                        {selectedAgenda.student_tasks && (
                                            <div className="space-y-1">
                                                <h4 className="text-[10px] uppercase font-black text-indigo-500 tracking-widest px-1">Tugas / Catatan Tambahan</h4>
                                                <div className="p-6 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl text-gray-700 dark:text-gray-300 leading-relaxed border border-indigo-100/50 dark:border-indigo-500/10">
                                                    {selectedAgenda.student_tasks}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats Card */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Ringkasan Kehadiran</h4>
                                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                                            {[
                                                { label: 'Hadir', count: attendanceStats.hadir || 0, color: 'emerald', icon: CheckCircleIcon },
                                                { label: 'Sakit', count: attendanceStats.sakit || 0, color: 'amber', icon: InformationCircleIcon },
                                                { label: 'Izin', count: attendanceStats.izin || 0, color: 'blue', icon: InformationCircleIcon },
                                                { label: 'Alpha', count: attendanceStats.alpha || 0, color: 'rose', icon: XCircleIcon },
                                            ].map((stat) => (
                                                <div key={stat.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-2">
                                                        <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{stat.label}</span>
                                                    </div>
                                                    <span className={`text-lg font-black text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                                        {stat.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Attendance Table */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-widest px-1">Daftar Presensi Lengkap</h4>
                                    <div className="rounded-2xl border dark:border-gray-700 overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 font-black text-slate-400 uppercase italic">Nama Siswa</th>
                                                    <th className="px-6 py-3 text-center font-black text-slate-400 uppercase italic">Status</th>
                                                    <th className="px-6 py-3 font-black text-slate-400 uppercase italic">Catatan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y dark:divide-gray-700">
                                                {selectedAgenda.attendances?.map((att: any) => (
                                                    <tr key={att.id} className="hover:bg-slate-50/30">
                                                        <td className="px-6 py-3">
                                                            <p className="font-bold text-gray-800 dark:text-white">{att.student.name}</p>
                                                            <p className="text-[10px] text-slate-400">NISN: {att.student.nisn}</p>
                                                        </td>
                                                        <td className="px-6 py-3 text-center">
                                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                                att.status === 'hadir' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                                att.status === 'sakit' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                                                att.status === 'izin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                                                                'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                                                            }`}>
                                                                {att.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 text-slate-400 italic">
                                                            {att.notes || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t dark:border-gray-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            Tutup
                        </button>
                        {selectedAgenda && (
                            <Link
                                href={route('teacher.agendas.edit', selectedAgenda.id)}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Jurnal
                            </Link>
                        )}
                    </div>
                </div>
            </Modal>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                
                /* Keep tailwind color classes used dynamically */
                .text-emerald-500 { color: #10b981; } .text-amber-500 { color: #f59e0b; } .text-blue-500 { color: #3b82f6; } .text-rose-500 { color: #ef4444; }
                .text-emerald-600 { color: #059669; } .text-amber-600 { color: #d97706; } .text-blue-600 { color: #2563eb; } .text-rose-600 { color: #dc2626; }
                .bg-emerald-100 { background-color: #d1fae5; } .bg-amber-100 { background-color: #fef3c7; } .bg-blue-100 { background-color: #dbeafe; } .bg-rose-100 { background-color: #fee2e2; }
            `}</style>
        </AuthenticatedLayout>
    );
}

