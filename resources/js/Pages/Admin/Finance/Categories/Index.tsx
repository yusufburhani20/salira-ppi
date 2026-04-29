import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function CategoryIndex({ categories }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        type: 'income',
        description: ''
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (category: any) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            type: category.type,
            description: category.description || ''
        });
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('admin.finance.categories.update', editingCategory.id), {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            post(route('admin.finance.categories.store'), {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const deleteCategory = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            destroy(route('admin.finance.categories.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Kategori Keuangan</h2>}
        >
            <Head title="Kategori Keuangan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">Daftar Kategori</h1>
                            <p className="text-sm text-slate-500">Kelola kategori untuk klasifikasi pendapatan dan pengeluaran.</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                            Tambah Kategori
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Nama Kategori</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Tipe</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Keterangan</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categories.map((category: any) => (
                                    <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${category.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" /></svg>
                                                </div>
                                                <span className="font-bold text-slate-700">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${
                                                category.type === 'income' 
                                                ? 'bg-emerald-100 text-emerald-700' 
                                                : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {category.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(category)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </button>
                                                <button
                                                    onClick={() => deleteCategory(category.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                            Belum ada kategori yang ditambahkan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={submit} className="p-8">
                    <h2 className="text-2xl font-black text-slate-800 mb-6">
                        {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                    </h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nama Kategori</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Contoh: SPP, Gaji Guru, dll"
                            />
                            {errors.name && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tipe Kategori</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'income')}
                                    className={`py-3 rounded-2xl font-bold border-2 transition-all ${
                                        data.type === 'income' 
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                    }`}
                                >
                                    Pendapatan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'expense')}
                                    className={`py-3 rounded-2xl font-bold border-2 transition-all ${
                                        data.type === 'expense' 
                                        ? 'bg-rose-50 border-rose-500 text-rose-700' 
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                    }`}
                                >
                                    Pengeluaran
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Keterangan (Opsional)</label>
                            <textarea
                                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 transition-all h-24"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Jelaskan penggunaan kategori ini..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Kategori'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
