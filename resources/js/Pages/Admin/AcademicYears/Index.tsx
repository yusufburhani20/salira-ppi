import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { CalendarIcon, CheckCircleIcon, TrashIcon, PencilSquareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Index({ academicYears }: any) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingYear, setEditingYear] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        is_active: false,
    });

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.academic-years.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.academic-years.update', editingYear.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            },
        });
    };

    const toggleYear = (id: number) => {
        if (confirm('Aktifkan tahun ajaran ini dan nonaktifkan yang lain?')) {
            post(route('admin.academic-years.toggle', id));
        }
    };

    const toggleSemester = (id: number) => {
        if (confirm('Aktifkan semester ini?')) {
            post(route('admin.semesters.toggle', id));
        }
    };

    const deleteYear = (id: number) => {
        if (confirm('Anda yakin ingin menghapus tahun ajaran ini?')) {
            destroy(route('admin.academic-years.destroy', id));
        }
    };

    const openEdit = (year: any) => {
        setEditingYear(year);
        setData('name', year.name);
        setIsEditModalOpen(true);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manajemen Tahun Ajaran</h2>}
        >
            <Head title="Tahun Ajaran" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daftar Tahun Ajaran</h3>
                            <p className="text-sm text-gray-500">Kelola periode akademik dan semester aktif.</p>
                        </div>
                        <PrimaryButton onClick={() => { reset(); setIsCreateModalOpen(true); }}>
                            Tambah Tahun Ajaran
                        </PrimaryButton>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {academicYears.map((year: any) => (
                            <div key={year.id} className={`bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-3xl border-2 transition-all ${year.is_active ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-transparent'}`}>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-2xl ${year.is_active ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <CalendarIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-gray-900 dark:text-white">{year.name}</h4>
                                                {year.is_active ? (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                                        <CheckCircleIcon className="w-3 h-3" /> Aktif Sekarang
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Non-Aktif</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(year)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            {!year.is_active && (
                                                <button onClick={() => deleteYear(year.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Semester</p>
                                        <div className="flex gap-2">
                                            {year.semesters.map((sem: any) => (
                                                <button
                                                    key={sem.id}
                                                    onClick={() => year.is_active && !sem.is_active && toggleSemester(sem.id)}
                                                    disabled={!year.is_active || sem.is_active}
                                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                                                        sem.is_active 
                                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                                                        : year.is_active 
                                                            ? 'border-gray-200 hover:border-indigo-300 text-gray-600' 
                                                            : 'border-gray-100 text-gray-300 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {sem.is_active && <CheckCircleIcon className="w-3 h-3" />}
                                                    {sem.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {!year.is_active && (
                                        <button 
                                            onClick={() => toggleYear(year.id)}
                                            className="w-full py-3 bg-gray-100 hover:bg-indigo-600 hover:text-white text-gray-600 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                            Aktifkan Tahun Ajaran
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={submitCreate} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Tambah Tahun Ajaran</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nama Tahun Ajaran" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: 2024/2025"
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                            />
                            <label htmlFor="is_active" className="text-sm text-gray-600 dark:text-gray-400">Set sebagai aktif sekarang</label>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 font-bold px-4 py-2 hover:text-gray-700">Batal</button>
                        <PrimaryButton disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={submitUpdate} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Tahun Ajaran</h2>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Nama Tahun Ajaran" />
                            <TextInput
                                id="edit_name"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-500 font-bold px-4 py-2 hover:text-gray-700">Batal</button>
                        <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
