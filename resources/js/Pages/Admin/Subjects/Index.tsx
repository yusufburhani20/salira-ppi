import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    ArrowUpTrayIcon, 
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Subject {
    id: number;
    code: string;
    name: string;
    description: string | null;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLinks[];
}

export default function SubjectIndex({ auth, subjects }: PageProps<{ subjects: PaginatedData<Subject> }>) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        code: '',
        name: '',
        description: '',
    });

    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, errors: importErrors, reset: resetImport } = useForm({
        file: null as File | null,
    });

    const openAddModal = () => {
        reset();
        setIsAddModalOpen(true);
    };

    const openEditModal = (subject: Subject) => {
        setSelectedSubject(subject);
        setData({
            code: subject.code,
            name: subject.name,
            description: subject.description || '',
        });
        setIsEditModalOpen(true);
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.subjects.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSubject) {
            put(route('admin.subjects.update', selectedSubject.id), {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedSubject(null);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
            destroy(route('admin.subjects.destroy', id));
        }
    };

    const submitImport = (e: React.FormEvent) => {
        e.preventDefault();
        postImport(route('admin.subjects.import'), {
            onSuccess: () => {
                setIsImportModalOpen(false);
                resetImport();
            },
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Master Data Mata Pelajaran</h2>}>
            <Head title="Mata Pelajaran" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <p className="text-gray-600 dark:text-gray-400">Kelola daftar mata pelajaran yang tersedia di sistem.</p>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => setIsImportModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                                Import Excel
                            </button>
                            <a 
                                href={route('admin.subjects.export')}
                                className="inline-flex items-center px-4 py-2 bg-emerald-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                Export Excel
                            </a>
                            <button 
                                onClick={openAddModal}
                                className="inline-flex items-center px-4 py-2 bg-primary border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-hover transition-all shadow-sm"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Tambah Baru
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Kode</th>
                                        <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Nama Mata Pelajaran</th>
                                        <th className="px-6 py-4 font-bold text-gray-900 dark:text-white">Deskripsi</th>
                                        <th className="px-6 py-4 font-bold text-gray-900 dark:text-white text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {subjects.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">Belum ada data mata pelajaran.</td>
                                        </tr>
                                    ) : (
                                        subjects.data.map((subject) => (
                                            <tr key={subject.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold">{subject.code}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">{subject.name}</td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm max-w-md truncate">{subject.description || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    <button onClick={() => openEditModal(subject)} className="inline-flex p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"><PencilSquareIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDelete(subject.id)} className="inline-flex p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {subjects.links.length > 3 && (
                        <div className="flex justify-center mt-6 space-x-1">
                            {subjects.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        link.active 
                                            ? 'bg-primary text-white' 
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={isAddModalOpen ? submitAdd : submitEdit}>
                                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {isAddModalOpen ? 'Tambah Mata Pelajaran' : 'Edit Mata Pelajaran'}
                                    </h3>
                                    <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-gray-400 hover:text-gray-500">&times;</button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Mata Pelajaran</label>
                                        <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} required placeholder="Contoh: MAT-01" className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm uppercase" />
                                        {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Mata Pelajaran</label>
                                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="Contoh: Matematika" className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm" />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi (Opsional)</label>
                                        <textarea rows={3} value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm" placeholder="Keterangan mata pelajaran..."></textarea>
                                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                    </div>
                                </div>
                                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
                                    <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors">Batal</button>
                                    <button type="submit" disabled={processing} className="px-8 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-md">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsImportModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={submitImport}>
                                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import Mata Pelajaran</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-700 dark:text-indigo-400 text-xs flex justify-between items-center">
                                        <span>Format Excel harus memiliki kolom: **kode**, **nama_mata_pelajaran**, **deskripsi**.</span>
                                        <a href={route('admin.subjects.template')} className="font-bold underline hover:text-indigo-800">Unduh Template</a>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih File Excel (.xlsx, .csv)</label>
                                        <input type="file" onChange={e => setImportData('file', e.target.files?.[0] || null)} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover" />
                                        {importErrors.file && <p className="text-red-500 text-xs mt-1">{importErrors.file}</p>}
                                    </div>
                                </div>
                                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors">Batal</button>
                                    <button type="submit" disabled={importProcessing} className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md">{importProcessing ? 'Mengimport...' : 'Import Sekarang'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
