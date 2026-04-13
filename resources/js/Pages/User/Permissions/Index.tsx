import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { DocumentTextIcon, PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PermissionType {
    value: string;
    label: string;
}

interface PermissionRequest {
    id: number;
    type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    attachment_path: string | null;
    task_description: string | null;
    task_file_path: string | null;
    rejection_reason: string | null;
    created_at: string;
}

export default function PermissionIndex({ auth, permissions, types }: PageProps<{ permissions: PermissionRequest[], types: PermissionType[] }>) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, delete: destroy, reset, processing, errors } = useForm({
        type: types[0]?.value || 'izin',
        start_date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
        end_date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
        reason: '',
        attachment: null as File | null,
        task_description: '',
        task_file: null as File | null,
    });

    const openDialog = () => {
        reset();
        setIsDialogOpen(true);
    };

    const userRoles = auth.user.roles || [];
    const isTeacher = userRoles.includes('Guru') || userRoles.includes('Guru/Dosen');

    const closeDialog = () => {
        setIsDialogOpen(false);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('user.permissions.store'), {
            onSuccess: () => closeDialog(),
            forceFormData: true, // Need this because we might send a file attachment
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to cancel this request?')) {
            destroy(route('user.permissions.destroy', id));
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircleIcon className="w-5 h-5 text-emerald-500" />;
            case 'rejected': return <XCircleIcon className="w-5 h-5 text-red-500" />;
            default: return <ClockIcon className="w-5 h-5 text-amber-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengajuan Izin Pribadi</h2>}>
            <Head title="Pengajuan Izin" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">Ajukan cuti, izin, medis (sakit), atau dispensasi ketidakhadiran.</p>
                        <button onClick={openDialog} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm">
                            <PlusIcon className="w-5 h-5" />
                            <span>Ajukan Permohonan</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-100 dark:border-gray-700">
                        {permissions.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>Belum ada riwayat perizinan.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Jenis / Tipe</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Tanggal Masih Berlaku</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Alasan</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Status</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {permissions.map((req) => (
                                            <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white capitalize">
                                                    {req.type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                    {req.start_date.split('T')[0]} s/d {req.end_date.split('T')[0]}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={req.reason}>
                                                    {req.reason}
                                                    {req.attachment_path && (
                                                        <a href={`/storage/${req.attachment_path}`} target="_blank" className="text-blue-500 hover:underline block text-xs mt-1">Lihat Bukti Lampiran</a>
                                                    )}
                                                    {req.task_description && (
                                                        <div className="mt-2 text-xs border-t border-gray-100 dark:border-gray-700 pt-1">
                                                            <span className="font-bold block uppercase tracking-tighter text-[10px] text-gray-400">Tugas:</span>
                                                            <p className="italic text-gray-500">{req.task_description}</p>
                                                            {req.task_file_path && (
                                                                <a href={`/storage/${req.task_file_path}`} target="_blank" className="text-emerald-500 hover:underline block font-bold mt-0.5">Lihat File Tugas</a>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(req.status)}`}>
                                                        {getStatusIcon(req.status)}
                                                        {req.status}
                                                    </div>
                                                    {req.status === 'rejected' && req.rejection_reason && (
                                                        <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={req.rejection_reason}>
                                                            {req.rejection_reason}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {req.status === 'pending' && (
                                                        <button onClick={() => handleDelete(req.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors">
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isDialogOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeDialog}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={submit}>
                                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Formulir Pengajuan</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Izin</label>
                                            <select value={data.type} onChange={e => setData('type', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm">
                                                {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tgl Mulai</label>
                                                <input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm" />
                                                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tgl Selesai</label>
                                                <input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} required min={data.start_date} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm" />
                                                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Keterangan / Alasan</label>
                                            <textarea rows={3} value={data.reason} onChange={e => setData('reason', e.target.value)} required placeholder="Jelaskan alasan secara singkat..." className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"></textarea>
                                            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bukti Lampiran (Opsional)</label>
                                            <input type="file" onChange={e => setData('attachment', e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400" accept=".jpg,.jpeg,.png,.pdf" />
                                            <p className="text-xs text-gray-500 mt-1">Maks. 2MB (jpg, png, pdf)</p>
                                            {errors.attachment && <p className="text-red-500 text-xs mt-1">{errors.attachment}</p>}
                                        </div>

                                        {isTeacher && (
                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-3">Informasi Tugas (Khusus Guru)</h4>
                                                    
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider mb-1">Tugas Singkat untuk Siswa/Pengganti</label>
                                                            <input 
                                                                type="text" 
                                                                value={data.task_description} 
                                                                onChange={e => setData('task_description', e.target.value)} 
                                                                placeholder="Contoh: Kerjakan LKS Hal 20..." 
                                                                className="block w-full text-sm rounded-md border-emerald-200 dark:border-emerald-900 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
                                                            />
                                                            {errors.task_description && <p className="text-red-500 text-xs mt-1">{errors.task_description}</p>}
                                                        </div>

                                                        <div>
                                                            <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider mb-1">Upload File Tugas (.pdf, .doc, .docx)</label>
                                                            <input 
                                                                type="file" 
                                                                onChange={e => setData('task_file', e.target.files ? e.target.files[0] : null)} 
                                                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200" 
                                                                accept=".pdf,.doc,.docx" 
                                                            />
                                                            {errors.task_file && <p className="text-red-500 text-xs mt-1">{errors.task_file}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-600">
                                    <button type="submit" disabled={processing} className="w-full inline-flex justify-center rounded-md bg-primary hover:bg-primary-hover text-white px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                                        {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                                    </button>
                                    <button type="button" onClick={closeDialog} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 text-base font-medium dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Batal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
