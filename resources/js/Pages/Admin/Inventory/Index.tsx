import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArchiveBoxIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    QrCodeIcon,
    PencilIcon,
    TrashIcon,
    ClipboardDocumentListIcon,
    FunnelIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const conditionLabel: Record<string, { label: string; color: string }> = {
    baik:         { label: 'Baik',         color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    rusak_ringan: { label: 'Rusak Ringan', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    rusak_berat:  { label: 'Rusak Berat',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};
const statusLabel: Record<string, { label: string; color: string }> = {
    tersedia:  { label: 'Tersedia',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    dipinjam:  { label: 'Dipinjam',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    perbaikan: { label: 'Perbaikan', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    dihapus:   { label: 'Dihapus',   color: 'bg-slate-100 text-slate-500' },
};

export default function InventoryIndex({ items, categories, stats, filters }: any) {
    const [showForm, setShowForm] = useState(false);
    const [showCatForm, setShowCatForm] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        category_id: '', code: '', name: '', description: '', brand: '',
        total_quantity: 1, unit_price: '', condition: 'baik', status: 'tersedia', location: '',
    });

    const catForm = useForm({ code: '', name: '', description: '' });

    const applyFilter = () => {
        router.get(route('admin.inventory.index'), { search, category_id: categoryFilter, status: statusFilter }, { preserveState: true });
    };

    const openAdd = () => { reset(); setEditItem(null); setShowForm(true); };
    const openEdit = (item: any) => {
        setEditItem(item);
        setData({
            category_id: item.category_id, code: item.code, name: item.name,
            description: item.description || '', brand: item.brand || '',
            total_quantity: item.total_quantity, unit_price: item.unit_price || '',
            condition: item.condition, status: item.status, location: item.location || '',
        });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editItem) {
            put(route('admin.inventory.update', editItem.id), { onSuccess: () => { setShowForm(false); reset(); } });
        } else {
            post(route('admin.inventory.store'), { onSuccess: () => { setShowForm(false); reset(); } });
        }
    };

    const handleDelete = (item: any) => {
        if (confirm(`Hapus barang "${item.name}"?`)) {
            router.delete(route('admin.inventory.destroy', item.id));
        }
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">Manajemen Inventaris</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola barang, barcode, dan log transaksi</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <a href={route('admin.inventory.scanner')} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-95">
                        <QrCodeIcon className="w-4 h-4" /> Scanner
                    </a>
                    <a href={route('admin.inventory.logs')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all active:scale-95">
                        <ClipboardDocumentListIcon className="w-4 h-4" /> Log Transaksi
                    </a>
                    <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95">
                        <PlusIcon className="w-4 h-4" /> Tambah Barang
                    </button>
                </div>
            </div>
        }>
            <Head title="Inventaris" />

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Unit', value: stats.total, icon: ArchiveBoxIcon, color: 'indigo' },
                        { label: 'Tersedia', value: stats.tersedia, icon: CheckCircleIcon, color: 'emerald' },
                        { label: 'Dipinjam', value: stats.dipinjam, icon: QrCodeIcon, color: 'blue' },
                        { label: 'Perbaikan', value: stats.perbaikan, icon: ExclamationCircleIcon, color: 'amber' },
                    ].map((s) => (
                        <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-${s.color}-100 dark:bg-${s.color}-900/30 flex items-center justify-center shrink-0`}>
                                <s.icon className={`w-5 h-5 text-${s.color}-600 dark:text-${s.color}-400`} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Cari Barang</label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilter()} type="text" placeholder="Nama atau kode..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        </div>
                    </div>
                    <div className="min-w-[150px]">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kategori</label>
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500">
                            <option value="">Semua</option>
                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="min-w-[150px]">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Status</label>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500">
                            <option value="">Semua</option>
                            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>
                    <button onClick={applyFilter} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all">
                        <FunnelIcon className="w-4 h-4" /> Filter
                    </button>
                    <button onClick={() => setShowCatForm(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                        <PlusIcon className="w-4 h-4" /> Kategori
                    </button>
                    <div className="flex-1 min-w-[10px]"></div>
                    <div className="flex gap-2">
                        <a href={route('admin.inventory.export.excel')} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm">
                            Excel
                        </a>
                        <a href={route('admin.inventory.export.pdf')} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all shadow-sm">
                            PDF
                        </a>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/30">
                                    <th className="text-left px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Barang</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Kategori</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status Unit Barcode</th>
                                    <th className="text-left px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Lokasi</th>
                                    <th className="text-center px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                                {items.data.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-16 text-slate-400 text-sm">Tidak ada data barang</td></tr>
                                ) : items.data.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{item.code}{item.brand ? ` · ${item.brand}` : ''}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{item.category?.name || '-'}</td>
                                        <td className="px-4 py-3.5">
                                            {item.barcodes_count > 0 ? (
                                                <div className="flex flex-col gap-1 min-w-[160px]">
                                                    {/* Progress bar */}
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{item.barcodes_count}</span>
                                                        <span className="text-[10px] text-slate-400">unit terdaftar</span>
                                                    </div>
                                                    <div className="flex h-2 rounded-full overflow-hidden gap-px w-full max-w-[180px]">
                                                        {item.barcodes_tersedia_count > 0 && <div className="bg-emerald-500" style={{ width: `${(item.barcodes_tersedia_count / item.barcodes_count) * 100}%` }} title={`${item.barcodes_tersedia_count} tersedia`} />}
                                                        {item.barcodes_dipinjam_count > 0 && <div className="bg-blue-500" style={{ width: `${(item.barcodes_dipinjam_count / item.barcodes_count) * 100}%` }} title={`${item.barcodes_dipinjam_count} dipinjam`} />}
                                                        {item.barcodes_perbaikan_count > 0 && <div className="bg-amber-500" style={{ width: `${(item.barcodes_perbaikan_count / item.barcodes_count) * 100}%` }} title={`${item.barcodes_perbaikan_count} perbaikan`} />}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.barcodes_tersedia_count > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{item.barcodes_tersedia_count} Tersedia
                                                            </span>
                                                        )}
                                                        {item.barcodes_dipinjam_count > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{item.barcodes_dipinjam_count} Dipinjam
                                                            </span>
                                                        )}
                                                        {item.barcodes_perbaikan_count > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{item.barcodes_perbaikan_count} Perbaikan
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic">Belum ada barcode</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-slate-500">{item.location || '-'}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <a href={route('admin.inventory.show', item.id)} className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 transition-colors" title="Kelola Barcode">
                                                    <QrCodeIcon className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => openEdit(item)} className="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(item)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors" title="Hapus"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {items.last_page > 1 && (
                        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
                            <span>Menampilkan {items.from}–{items.to} dari {items.total}</span>
                            <div className="flex gap-1">
                                {items.links.map((link: any, i: number) => (
                                    <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 rounded-lg font-bold transition-all ${link.active ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40'}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Item Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white">{editItem ? 'Edit Barang' : 'Tambah Barang'}</h3>
                            <button onClick={() => setShowForm(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label-form">Kategori *</label>
                                    <select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="input-form">
                                        <option value="">Pilih Kategori</option>
                                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.category_id && <p className="error-text">{errors.category_id}</p>}
                                </div>
                                <div>
                                    <label className="label-form">Kode Barang *</label>
                                    <input value={data.code} onChange={e => setData('code', e.target.value)} className="input-form" placeholder="mis: LPTOP-001" />
                                    {errors.code && <p className="error-text">{errors.code}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="label-form">Nama Barang *</label>
                                    <input value={data.name} onChange={e => setData('name', e.target.value)} className="input-form" placeholder="Nama lengkap barang" />
                                    {errors.name && <p className="error-text">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="label-form">Merek / Brand</label>
                                    <input value={data.brand} onChange={e => setData('brand', e.target.value)} className="input-form" placeholder="Asus, Dell, dll." />
                                </div>
                                <div>
                                    <label className="label-form">Lokasi Penyimpanan</label>
                                    <input value={data.location} onChange={e => setData('location', e.target.value)} className="input-form" placeholder="Ruang A, Rak 2, dll." />
                                </div>
                                <div>
                                    <label className="label-form">Jumlah Unit *</label>
                                    <input type="number" min={1} value={data.total_quantity} onChange={e => setData('total_quantity', parseInt(e.target.value))} className="input-form" />
                                    {errors.total_quantity && <p className="error-text">{errors.total_quantity}</p>}
                                </div>
                                <div>
                                    <label className="label-form">Harga Satuan (Rp)</label>
                                    <input type="number" min={0} value={data.unit_price} onChange={e => setData('unit_price', e.target.value)} className="input-form" placeholder="0" />
                                </div>
                                <div>
                                    <label className="label-form">Kondisi *</label>
                                    <select value={data.condition} onChange={e => setData('condition', e.target.value)} className="input-form">
                                        <option value="baik">Baik</option>
                                        <option value="rusak_ringan">Rusak Ringan</option>
                                        <option value="rusak_berat">Rusak Berat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-form">Status *</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="input-form">
                                        <option value="tersedia">Tersedia</option>
                                        <option value="dipinjam">Dipinjam</option>
                                        <option value="perbaikan">Perbaikan</option>
                                        <option value="dihapus">Dihapus</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="label-form">Deskripsi</label>
                                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="input-form" rows={3} placeholder="Deskripsi singkat barang..." />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Batal</button>
                                <button type="submit" disabled={processing} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all">
                                    {processing ? 'Menyimpan...' : (editItem ? 'Perbarui' : 'Simpan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCatForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 dark:text-white">Tambah Kategori</h3>
                            <button onClick={() => setShowCatForm(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); catForm.post(route('admin.inventory.categories.store'), { onSuccess: () => { setShowCatForm(false); catForm.reset(); } }); }} className="p-6 space-y-4">
                            <div>
                                <label className="label-form">Kode Kategori *</label>
                                <input value={catForm.data.code} onChange={e => catForm.setData('code', e.target.value)} className="input-form" placeholder="mis: ELK" />
                            </div>
                            <div>
                                <label className="label-form">Nama Kategori *</label>
                                <input value={catForm.data.name} onChange={e => catForm.setData('name', e.target.value)} className="input-form" placeholder="Elektronik, Furnitur, dll." />
                            </div>
                            <div>
                                <label className="label-form">Deskripsi</label>
                                <input value={catForm.data.description} onChange={e => catForm.setData('description', e.target.value)} className="input-form" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCatForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Batal</button>
                                <button type="submit" disabled={catForm.processing} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
