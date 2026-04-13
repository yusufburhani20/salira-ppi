import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { Cog6ToothIcon, PhotoIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface Settings {
    school_name: string;
    school_logo: string | null;
}

export default function SettingIndex({ auth, settings }: PageProps<{ settings: Settings }>) {
    const { data, setData, post, processing, errors } = useForm({
        school_name: settings.school_name,
        school_logo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            forceFormData: true,
        });
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
                                    </div>
                                </div>

                                <div className="pt-6 border-t dark:border-gray-700 flex justify-end">
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
