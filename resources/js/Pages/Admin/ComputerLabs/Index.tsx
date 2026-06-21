import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    MapPinIcon,
    CpuChipIcon,
} from '@heroicons/react/24/outline';

export default function Index({ labs }: any) {
    const [showForm, setShowForm] = useState(false);
    const [editLab, setEditLab] = useState<any>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        location: '',
        description: '',
    });

    const openAdd = () => {
        reset();
        setEditLab(null);
        setShowForm(true);
    };

    const openEdit = (lab: any) => {
        setEditLab(lab);
        setData({
            name: lab.name,
            location: lab.location || '',
            description: lab.description || '',
        });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editLab) {
            put(route('admin.computer-labs.update', editLab.id), {
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                },
            });
        } else {
            post(route('admin.computer-labs.store'), {
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (lab: any) => {
        if (confirm(`Hapus Ruang Lab "${lab.name}"? Semua data PC di dalamnya akan ikut terhapus.`)) {
            router.delete(route('admin.computer-labs.destroy', lab.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                        Lab Komputer & PC
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola ruangan lab komputer, unit PC, spesifikasi, dan QR code pelaporan
                    </p>
                </div>
            }
        >
            <Head title="Lab Komputer & PC" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                        Daftar Ruangan Lab
                    </h3>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4" /> Tambah Ruang Lab
                    </button>
                </div>

                {labs.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center border border-slate-100 dark:border-slate-700/50 shadow-sm">
                        <CpuChipIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada ruangan lab komputer</p>
                        <button
                            onClick={openAdd}
                            className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                            Buat Lab Pertama
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {labs.map((lab: any) => (
                            <div
                                key={lab.id}
                                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">
                                            {lab.name}
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEdit(lab)}
                                                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 hover:text-amber-500 transition-colors"
                                                title="Edit"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lab)}
                                                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 hover:text-red-500 transition-colors"
                                                title="Hapus"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {lab.location && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                                            <MapPinIcon className="w-3.5 h-3.5" /> {lab.location}
                                        </p>
                                    )}

                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 italic line-clamp-2">
                                        {lab.description || 'Tidak ada deskripsi lab.'}
                                    </p>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4 mt-4 flex justify-between items-center">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                                            {lab.units_count}
                                        </span>{' '}
                                        Unit PC Terdaftar
                                    </div>
                                    <a
                                        href={route('admin.computer-labs.show', lab.id)}
                                        className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                                    >
                                        Kelola Lab &rarr;
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lab Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white">
                                {editLab ? 'Edit Ruang Lab' : 'Tambah Ruang Lab'}
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                    Nama Lab *
                                </label>
                                <input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder="mis: Lab Komputer 1 / Lab Multimedia"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                    Lokasi / Gedung
                                </label>
                                <input
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder="mis: Gedung B Lt. 2"
                                />
                                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    rows={3}
                                    placeholder="Keterangan mengenai fasilitas/penggunaan lab..."
                                />
                                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
