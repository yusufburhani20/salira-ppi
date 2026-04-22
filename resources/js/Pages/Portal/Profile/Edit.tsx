import { Head, useForm, usePage } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';
import { FormEventHandler } from 'react';

export default function EditProfile() {
    const { student } = usePage<any>().props;

    const { data, setData, put, errors, processing, recentlySuccessful } = useForm({
        address: student.address || '',
        phone: student.phone || '',
        parent_name: student.parent_name || '',
        parent_phone: student.parent_phone || '',
        parent_email: student.parent_email || '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('portal.profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <PortalLayout
            header={<h2 className="font-semibold text-2xl text-slate-800 leading-tight">Pengaturan Profil</h2>}
        >
            <Head title="Profil Siswa" />

            <div className="max-w-4xl max-auto space-y-6">
                
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800">Informasi Pribadi & Wali</h3>
                        <p className="text-sm text-slate-500 mt-1">Perbarui nomor kontak aktif, alamat terbaru, serta kontak wali siswa Anda.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Kontak Siswa Session */}
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                                    <h4 className="font-semibold text-sm text-slate-700 uppercase tracking-wider">Kontak Siswa</h4>
                                </div>
                                
                                <div>
                                    <label className="block font-medium text-sm text-slate-700 mb-1">Nomor Telepon/WA Aktif</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-colors text-sm"
                                        placeholder="Misal: 08123456789"
                                    />
                                    {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block font-medium text-sm text-slate-700 mb-1">Alamat Domisili Siswa</label>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-colors text-sm"
                                        rows={3}
                                        placeholder="Alamat lengkap tinggal saat ini"
                                    />
                                    {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                                </div>
                            </div>

                            {/* Kontak Wali Session */}
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                                    <h4 className="font-semibold text-sm text-slate-700 uppercase tracking-wider">Kontak Wali/Orang Tua</h4>
                                </div>

                                <div>
                                    <label className="block font-medium text-sm text-slate-700 mb-1">Nama Walimurid / Orang Tua</label>
                                    <input
                                        type="text"
                                        value={data.parent_name}
                                        onChange={(e) => setData('parent_name', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-colors text-sm"
                                        placeholder="Nama yang dapat dihubungi"
                                    />
                                    {errors.parent_name && <p className="text-sm text-red-600 mt-1">{errors.parent_name}</p>}
                                </div>

                                <div>
                                    <label className="block font-medium text-sm text-slate-700 mb-1">Nomor Telepon Walimurid</label>
                                    <input
                                        type="text"
                                        value={data.parent_phone}
                                        onChange={(e) => setData('parent_phone', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-colors text-sm"
                                        placeholder="Nomor Telepon/WA Orang Tua"
                                    />
                                    {errors.parent_phone && <p className="text-sm text-red-600 mt-1">{errors.parent_phone}</p>}
                                </div>

                                <div>
                                    <label className="block font-medium text-sm text-slate-700 mb-1">Email Walimurid (Opsional)</label>
                                    <input
                                        type="email"
                                        value={data.parent_email}
                                        onChange={(e) => setData('parent_email', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-colors text-sm"
                                        placeholder="Untuk notifikasi administratif"
                                    />
                                    {errors.parent_email && <p className="text-sm text-red-600 mt-1">{errors.parent_email}</p>}
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100 my-8" />

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Ganti Kata Sandi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium text-sm text-slate-700 mb-1">Kata Sandi Baru</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-colors text-sm"
                                        placeholder="Kosongkan jika tidak ingin diubah"
                                    />
                                    {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block font-medium text-sm text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition-colors text-sm"
                                        placeholder="Ulangi kata sandi baru"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-8 pt-4 border-t border-slate-100">
                            <button
                                disabled={processing}
                                type="submit"
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                Simpan Perubahan
                            </button>

                            {recentlySuccessful && (
                                <span className="text-emerald-600 text-sm font-medium animate-pulse">
                                    Tersimpan!
                                </span>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </PortalLayout>
    );
}
