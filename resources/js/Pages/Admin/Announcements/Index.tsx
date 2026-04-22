import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AnnouncementIndex({ announcements }: any) {
    const [isAdding, setIsAdding] = useState(false);
    
    const { data, setData, post, reset, processing, errors } = useForm({
        title: '',
        content: '',
        type: 'info',
        target: 'students',
        expires_at: '',
        is_active: true,
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route('admin.announcements.store'), {
            onSuccess: () => {
                reset();
                setIsAdding(false);
            }
        });
    };

    const toggleStatus = (ann: any) => {
        router.put(route('admin.announcements.update', ann.id), {
            ...ann,
            is_active: !ann.is_active
        });
    };

    const deleteAnn = (id: number) => {
        if (confirm('Yakin ingin menghapus pengumuman ini?')) {
            router.delete(route('admin.announcements.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Pengumuman</h2>}
        >
            <Head title="Pengumuman" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Daftar Pengumuman Sekolah</h3>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
                        >
                            {isAdding ? 'Batal' : '+ Tambah Pengumuman'}
                        </button>
                    </div>

                    {isAdding && (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Judul Pengumuman</label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                            placeholder="Masukkan judul menarik..."
                                        />
                                        {errors.title && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.title}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Konten / Isi</label>
                                        <textarea
                                            value={data.content}
                                            onChange={e => setData('content', e.target.value)}
                                            className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                            rows={4}
                                            placeholder="Tuliskan detail pengumuman di sini..."
                                        ></textarea>
                                        {errors.content && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.content}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Tipe</label>
                                        <select
                                            value={data.type}
                                            onChange={e => setData('type', e.target.value)}
                                            className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        >
                                            <option value="info">Informasi (Biru)</option>
                                            <option value="important">Penting (Merah)</option>
                                            <option value="warning">Peringatan (Kuning)</option>
                                            <option value="success">Berhasil (Hijau)</option>
                                        </select>
                                        {data.type === 'important' && (
                                            <p className="mt-2 text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                Otomatis kirim Email ke seluruh siswa
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Berlaku Sampai</label>
                                        <input
                                            type="date"
                                            value={data.expires_at}
                                            onChange={e => setData('expires_at', e.target.value)}
                                            className="w-full rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all"
                                    >
                                        {processing ? 'Menerbitkan...' : 'Terbitkan Sekarang'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Pengumuman</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Target</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Berakhir</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {announcements.data.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">Belum ada pengumuman yang dibuat.</td></tr>
                                ) : (
                                    announcements.data.map((ann: any) => (
                                        <tr key={ann.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        ann.type === 'important' ? 'bg-rose-500' :
                                                        ann.type === 'warning' ? 'bg-amber-500' :
                                                        ann.type === 'success' ? 'bg-emerald-500' :
                                                        'bg-blue-500'
                                                    }`}></div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{ann.title}</div>
                                                        <div className="text-xs text-gray-500 line-clamp-1">{ann.content}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                                    {ann.target}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => toggleStatus(ann)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        ann.is_active 
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {ann.is_active ? 'Aktif' : 'Non-Aktif'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-gray-500">
                                                {ann.expires_at ? new Date(ann.expires_at).toLocaleDateString('id-ID') : 'Selamanya'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => deleteAnn(ann.id)}
                                                    className="text-rose-600 hover:text-rose-800 p-2 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
