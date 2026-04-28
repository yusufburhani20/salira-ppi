import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState, useEffect, useCallback } from 'react';
import { PhotoIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface Settings {
    school_name: string;
    school_address: string;
    school_phone: string;
    school_email: string;
    report_location: string;
    school_logo: string | null;
    school_favicon: string | null;
    github_username?: string;
    github_token?: string;
    // Payment fee
    midtrans_fee_type: 'none' | 'fixed' | 'percent';
    midtrans_fee_value: string;
    midtrans_fee_label: string;
}

export default function SettingIndex({ auth, settings }: PageProps<{ settings: Settings }>) {
    const userRoles = auth.user.roles || [];
    const isSuperAdmin = userRoles.includes('Super Admin');

    const { data, setData, post, processing, errors } = useForm({
        school_name: settings.school_name,
        school_address: settings.school_address,
        school_phone: settings.school_phone,
        school_email: settings.school_email,
        report_location: settings.report_location,
        school_logo: null as File | null,
        school_favicon: null as File | null,
        github_username: settings.github_username || '',
        github_token: settings.github_token || '',
    });

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateLogs, setUpdateLogs] = useState<string>('');
    const [updateStatus, setUpdateStatus] = useState<'success'|'error'|null>(null);
    const logEndRef = React.useRef<HTMLPreElement>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            forceFormData: true,
        });
    };

    const fetchLogs = useCallback(async (isInitial = false) => {
        try {
            const response = await fetch(route('admin.settings.update-logs'));
            const data = await response.json();
            if (data.logs) {
                setUpdateLogs(data.logs);
                
                const hasCompleted = data.logs.includes('[PROCESS_COMPLETED]');
                const hasFailed = data.logs.includes('[PROCESS_FAILED]');
                
                if (isInitial && (hasCompleted || hasFailed)) {
                    // Jika baru muat halaman dan log lama sudah selesai/gagal, tampilkan layar bersih
                    setUpdateLogs('');
                    setUpdateStatus(null);
                    setIsUpdating(false);
                    return;
                }

                if (hasCompleted) {
                    setIsUpdating(false);
                    // Show success if it just finished
                    setUpdateStatus('success');
                } else if (hasFailed) {
                    setIsUpdating(false);
                    setUpdateStatus('error');
                } else if (isInitial && data.logs.trim() !== '' && data.logs !== 'Belum ada log pembaruan.') {
                    // If we're loading the page and the log is active but not completed/failed, resume monitoring
                    setIsUpdating(true);
                }

                // Auto scroll to bottom in next tick to ensure state is updated
                setTimeout(() => {
                    if (logEndRef.current) {
                        logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    }, []);

    // Check logs on mount to see if an update is already in progress
    useEffect(() => {
        fetchLogs(true);
    }, [fetchLogs]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isUpdating) {
            interval = setInterval(fetchLogs, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isUpdating]);

    const startUpdate = async () => {
        if (!confirm('Anda yakin ingin memulai pembaruan sistem? Ini mungkin membuat website sedikit melambat selama proses build.')) return;
        
        setIsUpdating(true);
        setUpdateStatus(null);
        setUpdateLogs('Memulai perintah sistem...\n');

        try {
            await fetch(route('admin.settings.system-update'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Failed to start update:', error);
            setIsUpdating(false);
            setUpdateStatus('error');
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengaturan Sekolah</h2>}>
            <Head title="Pengaturan" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            <form onSubmit={submit} className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                                        <BuildingOfficeIcon className="w-5 h-5 text-primary" />
                                        Informasi Sekolah
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Sekolah</label>
                                                <input 
                                                    type="text"
                                                    value={data.school_name}
                                                    onChange={e => setData('school_name', e.target.value)}
                                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                    placeholder="Masukkan nama resmi sekolah"
                                                />
                                                {errors.school_name && <p className="text-red-500 text-xs mt-1">{errors.school_name}</p>}
                                            </div>

                                            <div>
                                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">Email Sekolah</label>
                                                <input 
                                                    type="email"
                                                    value={data.school_email}
                                                    onChange={e => setData('school_email', e.target.value)}
                                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                    placeholder="contoh@sekolah.sch.id"
                                                />
                                                {errors.school_email && <p className="text-red-500 text-xs mt-1">{errors.school_email}</p>}
                                            </div>

                                            <div>
                                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">Telepon Sekolah</label>
                                                <input 
                                                    type="text"
                                                    value={data.school_phone}
                                                    onChange={e => setData('school_phone', e.target.value)}
                                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                    placeholder="021-xxxxxxx"
                                                />
                                                {errors.school_phone && <p className="text-red-500 text-xs mt-1">{errors.school_phone}</p>}
                                            </div>

                                            <div>
                                                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">Alamat Titimangsa (Untuk Laporan/PDF)</label>
                                                <input 
                                                    type="text"
                                                    value={data.report_location}
                                                    onChange={e => setData('report_location', e.target.value)}
                                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                    placeholder="Contoh: Tasikmalaya"
                                                />
                                                {errors.report_location && <p className="text-red-500 text-xs mt-1">{errors.report_location}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">Alamat Lengkap Sekolah</label>
                                            <textarea 
                                                value={data.school_address}
                                                onChange={e => setData('school_address', e.target.value)}
                                                className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                                placeholder="Jalan, RT/RW, Desa, Kecamatan, Kota/Kabupaten, Provinsi"
                                                rows={3}
                                            />
                                            {errors.school_address && <p className="text-red-500 text-xs mt-1">{errors.school_address}</p>}
                                        </div>

                                        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                                <PhotoIcon className="w-4 h-4" />
                                                Logo Sekolah
                                            </label>
                                            
                                            <div className="flex items-center gap-6">
                                                {settings.school_logo && (
                                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border bg-white flex items-center justify-center p-2">
                                                        <img src={settings.school_logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <input 
                                                        type="file"
                                                        onChange={e => setData('school_logo', e.target.files ? e.target.files[0] : null)}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                    />
                                                    <p className="text-xs text-gray-400 mt-2">Maksimal 2MB (PNG, JPG, JPEG)</p>
                                                    {errors.school_logo && <p className="text-red-500 text-xs mt-1">{errors.school_logo}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                                <PhotoIcon className="w-4 h-4" />
                                                Favicon Website
                                            </label>
                                            
                                            <div className="flex items-center gap-6">
                                                {settings.school_favicon && (
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border bg-white flex items-center justify-center p-2">
                                                        <img src={settings.school_favicon} alt="Favicon" className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <input 
                                                        type="file"
                                                        onChange={e => setData('school_favicon', e.target.files ? e.target.files[0] : null)}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                    />
                                                    <p className="text-xs text-gray-400 mt-2">Maksimal 1MB (ICO, PNG, SVG) - Rekomendasi 512x512</p>
                                                    {errors.school_favicon && <p className="text-red-500 text-xs mt-1">{errors.school_favicon}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isSuperAdmin && (
                                    <div className="pt-8 mt-8 border-t dark:border-gray-700">
                                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                            Kredensial Repositori (GitHub)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Username GitHub</label>
                                                <input 
                                                    type="text" 
                                                    value={data.github_username} 
                                                    onChange={e => setData('github_username', e.target.value)} 
                                                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:ring-primary focus:border-primary"
                                                    placeholder="Contoh: yusufburhani20"
                                                />
                                                {errors.github_username && <p className="text-red-500 text-xs mt-1">{errors.github_username}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Personal Access Token</label>
                                                <input 
                                                    type="password" 
                                                    value={data.github_token} 
                                                    onChange={e => setData('github_token', e.target.value)} 
                                                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:ring-primary focus:border-primary"
                                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                                />
                                                {errors.github_token && <p className="text-red-500 text-xs mt-1">{errors.github_token}</p>}
                                                <p className="text-xs text-slate-500 mt-2">Dibutuhkan untuk melakukan pembaruan otomatis jika menggunakan repositori privat.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="pt-6 mt-6 border-t dark:border-gray-700 flex justify-end">
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="h-12 px-8 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* System Update Section */}
                    {isSuperAdmin && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mt-8">
                            <div className="p-8">
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-red-600 dark:text-red-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Pembaruan Sistem (System Update)
                                </h3>
                                
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 mb-6">
                                    <p className="text-sm text-red-800 dark:text-red-300">
                                        Fitur ini akan menarik kode terbaru dari server pusat (GitHub) dan melakukan kompilasi ulang (Build). 
                                        Proses ini memakan waktu sekitar 1-2 menit. Silakan pantau log di bawah ini.
                                    </p>
                                </div>

                                <div className="mb-4 flex justify-between items-center">
                                    <button 
                                        onClick={startUpdate}
                                        disabled={isUpdating}
                                        className="h-10 px-6 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-500/20 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Sedang Mengupdate...
                                            </>
                                        ) : 'Mulai Update Sistem'}
                                    </button>

                                    {updateStatus && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${updateStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {updateStatus === 'success' ? 'Update Selesai!' : 'Update Gagal!'}
                                        </span>
                                    )}
                                </div>

                                <div className="bg-gray-900 rounded-xl p-4 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-full h-8 bg-gray-800 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="ml-2 text-xs text-gray-400 font-mono">deploy.log</span>
                                    </div>
                                    <pre 
                                        className="text-green-400 font-mono text-xs mt-8 h-[300px] overflow-y-auto whitespace-pre-wrap"
                                        ref={logEndRef}
                                    >
                                        {updateLogs || 'Belum ada proses update yang berjalan. Klik tombol di atas untuk memulai.'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
