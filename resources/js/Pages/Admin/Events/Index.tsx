import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import axios from 'axios';

interface Event {
    id: number;
    name: string;
    description: string | null;
    date: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
    created_at: string;
    attendances_count: number;
    creator?: {
        name: string;
    };
}

interface Attendance {
    id: number;
    user_name: string;
    user_nip: string;
    check_in_time: string;
    proof_url: string;
}

export default function EventIndex({ events }: { events: { data: Event[]; current_page: number; last_page: number; total: number; from: number; to: number; links: any[] } }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Event | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [loadingAttendances, setLoadingAttendances] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [activePhoto, setActivePhoto] = useState<string | null>(null);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        is_active: true,
    });

    // Populate form for editing
    useEffect(() => {
        if (editTarget) {
            setData({
                name: editTarget.name,
                description: editTarget.description || '',
                date: editTarget.date,
                start_time: editTarget.start_time,
                end_time: editTarget.end_time,
                is_active: editTarget.is_active,
            });
        } else {
            reset();
        }
    }, [editTarget]);

    const openAddModal = () => {
        setEditTarget(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (event: Event) => {
        setEditTarget(event);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editTarget) {
            put(route('admin.events.update', editTarget.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        } else {
            post(route('admin.events.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const toggleStatus = (event: Event) => {
        const actionText = event.is_active ? 'menutup' : 'mengaktifkan kembali';
        if (confirm(`Apakah Anda yakin ingin ${actionText} event "${event.name}"?`)) {
            router.patch(route('admin.events.toggle-status', event.id), {}, {
                preserveScroll: true
            });
        }
    };

    const deleteEvent = (id: number) => {
        if (confirm('Yakin ingin menghapus event ini beserta seluruh data absensinya?')) {
            router.delete(route('admin.events.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const viewAttendances = (event: Event) => {
        setSelectedEvent(event);
        setIsAttendanceModalOpen(true);
        setLoadingAttendances(true);
        setAttendances([]);
        
        axios.get(route('admin.events.attendances', event.id))
            .then(res => {
                setAttendances(res.data);
            })
            .catch(err => {
                console.error("Gagal mengambil data kehadiran", err);
                alert("Gagal mengambil data kehadiran");
            })
            .finally(() => {
                setLoadingAttendances(false);
            });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-xl text-slate-800 dark:text-white leading-tight">Manajemen Event Rapat / Kegiatan</h2>}
        >
            <Head title="Manajemen Event" />

            <div className="py-6 sm:py-8 font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Daftar Event / Rapat</h3>
                            <p className="text-xs text-slate-500">Kelola event sekolah serta rekap kehadiran guru & karyawan.</p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-500/10 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                            Tambah Event Baru
                        </button>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden transition-colors">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-900/30">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nama Event</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tanggal & Waktu</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Peserta</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {events.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">
                                                Belum ada event yang dibuat. Silakan tambahkan event baru.
                                            </td>
                                        </tr>
                                    ) : (
                                        events.data.map((event) => (
                                            <tr key={event.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{event.name}</div>
                                                    {event.description && (
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{event.description}</div>
                                                    )}
                                                    <div className="text-[10px] text-slate-400 mt-1">Dibuat oleh: {event.creator?.name ?? 'Admin'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                        {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)} WIB
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => toggleStatus(event)}
                                                        title={event.is_active ? 'Klik untuk menutup event' : 'Klik untuk mengaktifkan event'}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                                                            event.is_active
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30 hover:bg-emerald-100'
                                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-100'
                                                        }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${event.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                        {event.is_active ? 'Aktif' : 'Ditutup'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => viewAttendances(event)}
                                                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl text-xs font-bold transition-all hover:bg-indigo-100 hover:scale-105 active:scale-95"
                                                    >
                                                        {event.attendances_count} Hadir
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1.5 items-center">
                                                        <a
                                                            href={route('admin.events.export-excel', event.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all"
                                                            title="Export Laporan Excel"
                                                        >
                                                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                        </a>
                                                        <a
                                                            href={route('admin.events.export-pdf', event.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                                                            title="Export Laporan PDF"
                                                        >
                                                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h1.5m1.5 0H15m-6 4h6m-6 4h4" /></svg>
                                                        </a>
                                                        <button
                                                            onClick={() => toggleStatus(event)}
                                                            className={`p-2 rounded-xl transition-all ${
                                                                event.is_active
                                                                    ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                                                    : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                                            }`}
                                                            title={event.is_active ? 'Tutup Event' : 'Buka Event'}
                                                        >
                                                            {event.is_active ? (
                                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                            ) : (
                                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(event)}
                                                            className="text-slate-500 hover:text-indigo-600 dark:text-slate-450 dark:hover:text-indigo-400 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all"
                                                            title="Edit Event"
                                                        >
                                                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => deleteEvent(event.id)}
                                                            className="text-rose-600 hover:text-rose-800 p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                                                            title="Hapus Event"
                                                        >
                                                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {events.last_page > 1 && (
                            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500">{events.from}–{events.to} dari {events.total} data</p>
                                <div className="flex gap-1">
                                    {events.links.map((link: any, i: number) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : link.url
                                                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Add/Edit Event Modal ── */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6 sm:p-8 dark:bg-slate-800 dark:text-white">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                        {editTarget ? 'Edit Detail Event' : 'Buat Event / Rapat Baru'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nama Event *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                                placeholder="Contoh: Rapat Koordinasi MGMP"
                                required
                            />
                            {errors.name && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deskripsi (Opsional)</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                                placeholder="Detail atau agenda pembahasan..."
                                rows={3}
                            ></textarea>
                            {errors.description && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tanggal *</label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                                    required
                                />
                                {errors.date && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.date}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jam Mulai *</label>
                                <input
                                    type="time"
                                    value={data.start_time}
                                    onChange={e => setData('start_time', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                                    required
                                />
                                {errors.start_time && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.start_time}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jam Selesai *</label>
                                <input
                                    type="time"
                                    value={data.end_time}
                                    onChange={e => setData('end_time', e.target.value)}
                                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-sm"
                                    required
                                />
                                {errors.end_time && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.end_time}</p>}
                            </div>
                        </div>

                        {editTarget && (
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-350 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                    Aktifkan Event (Hanya event aktif yang tampil pada halaman login)
                                </label>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-750">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-500/10 transition-colors disabled:opacity-50"
                            >
                                {editTarget ? 'Simpan Perubahan' : 'Buat Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── Attendance List Modal ── */}
            <Modal show={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} maxWidth="4xl">
                <div className="p-6 sm:p-8 dark:bg-slate-800 dark:text-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daftar Kehadiran</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{selectedEvent?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedEvent && (
                                <>
                                    <a
                                        href={route('admin.events.export-excel', selectedEvent.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Export Excel
                                    </a>
                                    <a
                                        href={route('admin.events.export-pdf', selectedEvent.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h1.5m1.5 0H15m-6 4h6m-6 4h4" /></svg>
                                        Export PDF
                                    </a>
                                </>
                            )}
                            <button
                                onClick={() => setIsAttendanceModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 hover:bg-slate-150 dark:hover:bg-slate-700 rounded-lg transition-colors ml-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>

                    {loadingAttendances ? (
                        <div className="py-12 flex flex-col justify-center items-center gap-3 text-slate-400">
                            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" /></svg>
                            <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Memuat Kehadiran...</span>
                        </div>
                    ) : attendances.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 dark:text-slate-500 italic">
                            Belum ada guru atau karyawan yang melakukan absensi untuk event ini.
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[450px] border border-slate-100 dark:border-slate-700 rounded-2xl">
                            <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-900/30 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nama Guru / Staf</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">NIP</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Waktu Hadir</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bukti Hadir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-slate-800">
                                    {attendances.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                                {att.user_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                {att.user_nip}
                                            </td>
                                            <td className="px-6 py-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                {att.check_in_time} WIB
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setActivePhoto(att.proof_url)}
                                                    className="inline-block relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group hover:scale-105 active:scale-95 transition-all shadow-sm"
                                                >
                                                    <img
                                                        src={att.proof_url}
                                                        alt="Bukti Kehadiran"
                                                        className="w-12 h-12 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </div>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Modal>

            {/* ── Photo Lightbox Modal ── */}
            {activePhoto && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all duration-300"
                    onClick={() => setActivePhoto(null)}
                >
                    <div className="relative max-w-3xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setActivePhoto(null)}
                            className="absolute top-4 right-4 bg-slate-900/60 text-white hover:bg-slate-900 p-2 rounded-full transition-colors z-10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <img
                            src={activePhoto}
                            alt="Bukti Kehadiran Pembesaran"
                            className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/10"
                        />
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
