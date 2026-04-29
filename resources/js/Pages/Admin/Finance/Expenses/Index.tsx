import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function ExpenseIndex({ expenses, categories }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        category_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        attachment: null as any,
        _method: 'POST' as any // Default to POST
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const openCreateModal = () => {
        setEditingExpense(null);
        reset();
        setData('_method', 'POST');
        setIsModalOpen(true);
    };

    const openEditModal = (expense: any) => {
        setEditingExpense(expense);
        setData({
            category_id: expense.category_id,
            amount: expense.amount,
            date: expense.date,
            description: expense.description,
            attachment: null,
            _method: 'PUT'
        });
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingExpense) {
            post(route('admin.finance.expenses.update', editingExpense.id), {
                forceFormData: true,
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('admin.finance.expenses.store'), {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Pengeluaran Sekolah</h2>}
        >
            <Head title="Pengeluaran Keuangan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">Daftar Pengeluaran</h1>
                            <p className="text-sm text-slate-500">Catat dan pantau seluruh pengeluaran operasional sekolah.</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                            Catat Pengeluaran
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Tanggal & Deskripsi</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Jumlah</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Dicatat Oleh</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expenses.map((expense: any) => (
                                    <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700">{expense.description}</span>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-1 uppercase">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                                    {new Date(expense.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                {expense.category?.name || 'Umum'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-rose-600 font-mono">
                                                -{formatCurrency(expense.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                                    {expense.recorder?.name.substring(0, 1)}
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium">{expense.recorder?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {expense.attachment && (
                                                    <a
                                                        href={`/storage/${expense.attachment}`}
                                                        target="_blank"
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                        title="Lihat Lampiran"
                                                    >
                                                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => openEditModal(expense)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Hapus catatan pengeluaran ini?')) {
                                                            destroy(route('admin.finance.expenses.destroy', expense.id));
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                            Belum ada catatan pengeluaran.
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
                        {editingExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran Baru'}
                    </h2>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Kategori</label>
                                <select
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.category_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tanggal</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                />
                                {errors.date && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.date}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Jumlah (IDR)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-700 font-black text-xl focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                value={data.amount}
                                onChange={e => setData('amount', e.target.value)}
                                placeholder="0"
                            />
                            {errors.amount && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Deskripsi</label>
                            <textarea
                                className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 transition-all h-24"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Contoh: Pembayaran listrik bulan April, Gaji Guru Honorer, dll"
                            ></textarea>
                            {errors.description && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Lampiran / Bukti (Opsional)</label>
                            <input
                                type="file"
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all"
                                onChange={(e: any) => setData('attachment', e.target.files[0])}
                            />
                            {errors.attachment && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.attachment}</p>}
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
                            className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-rose-200 disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
