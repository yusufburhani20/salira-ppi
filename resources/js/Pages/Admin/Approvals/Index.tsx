import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { InboxIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface User {
    name: string;
    email: string;
}

interface PermissionRequest {
    id: number;
    user: User;
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

export default function ApprovalIndex({ auth, permissions }: PageProps<{ permissions: PermissionRequest[] }>) {
    const [actionDialog, setActionDialog] = useState<{ isOpen: boolean, type: 'approve' | 'reject', requestId: number | null }>({
        isOpen: false,
        type: 'approve',
        requestId: null
    });

    const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data, setData, put, reset, processing, errors } = useForm({
        status: 'approved',
        rejection_reason: '',
    });

    const openDialog = (requestId: number, type: 'approve' | 'reject') => {
        setActionDialog({ isOpen: true, type, requestId });
        setData({
            status: type === 'approve' ? 'approved' : 'rejected',
            rejection_reason: '',
        });
    };

    const closeDialog = () => {
        setActionDialog({ isOpen: false, type: 'approve', requestId: null });
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (actionDialog.requestId) {
            put(route('admin.approvals.update', actionDialog.requestId), {
                onSuccess: () => closeDialog(),
            });
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
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manajemen Approval Izin</h2>}>
            <Head title="Approvals" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <p className="text-gray-600 dark:text-gray-400">Tinjau dan ambil keputusan terhadap permohonan izin staf dan guru.</p>

                    <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Pemohon</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Jenis</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Jadwal Izin</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Alasan & Lampiran</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Status</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-right">Aksi Pimpinan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {permissions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <InboxIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                                Kotak masuk perizinan masih kosong.
                                            </td>
                                        </tr>
                                    )}
                                    {permissions.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900 dark:text-white">{req.user.name}</div>
                                                <div className="text-xs text-gray-500">{req.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">
                                                {req.type}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                                                <div className="font-semibold">{req.start_date}</div>
                                                <div>s/d {req.end_date}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                                                <p className="max-w-xs">{req.reason}</p>
                                                {req.attachment_path && (
                                                    <a href={`/storage/${req.attachment_path}`} target="_blank" className="inline-flex items-center mt-2 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 transition-colors">
                                                        Buka File Bukti
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(req.status)}`}>
                                                    {getStatusIcon(req.status)}
                                                    {req.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                <button 
                                                    onClick={() => { setSelectedRequest(req); setIsDetailOpen(true); }}
                                                    className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Detail
                                                </button>
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => openDialog(req.id, 'approve')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg text-sm font-medium transition-colors">
                                                            Setujui
                                                        </button>
                                                        <button onClick={() => openDialog(req.id, 'reject')} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-sm font-medium transition-colors">
                                                            Tolak
                                                        </button>
                                                    </>
                                                )}
                                                {req.status !== 'pending' && <span className="text-sm text-gray-400 italic">Telah Diproses</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {actionDialog.isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeDialog}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
                            <form onSubmit={submit}>
                                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b dark:border-gray-700">
                                    <h3 className={`text-xl font-bold mb-2 ${actionDialog.type === 'approve' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {actionDialog.type === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {actionDialog.type === 'approve' 
                                            ? 'Anda yakin ingin menyetujui pengajuan ketidakhadiran ini?' 
                                            : 'Harap berikan alasan logis mengapa permohonan ini ditolak (wajib).'}
                                    </p>
                                    
                                    {actionDialog.type === 'reject' && (
                                        <div>
                                            <textarea 
                                                rows={3} 
                                                value={data.rejection_reason} 
                                                onChange={e => setData('rejection_reason', e.target.value)} 
                                                required 
                                                placeholder="Contoh: Lampiran tidak absah, kuota cuti habis, dll." 
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-red-500 focus:ring-red-500 shadow-sm"
                                            ></textarea>
                                            {errors.rejection_reason && <p className="text-red-500 text-xs mt-1">{errors.rejection_reason}</p>}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button 
                                        type="submit" 
                                        disabled={processing} 
                                        className={`w-full inline-flex justify-center rounded-md px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 ${actionDialog.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                                    >
                                        {processing ? 'Memproses...' : actionDialog.type === 'approve' ? 'Ya, Setujui' : 'Tolak Permohonan'}
                                    </button>
                                    <button type="button" onClick={closeDialog} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 text-base font-medium dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Batal</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {isDetailOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsDetailOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Detail Pengajuan Izin</h3>
                                        <p className="text-sm text-gray-500">ID Pengajuan: #{selectedRequest.id}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusBadge(selectedRequest.status)}`}>
                                        {selectedRequest.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pemohon</label>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{selectedRequest.user.name}</p>
                                            <p className="text-sm text-gray-500">{selectedRequest.user.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Jenis Izin</label>
                                            <p className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{selectedRequest.type}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Periode Ketidakhadiran</label>
                                            <p className="font-bold text-gray-800 dark:text-gray-200">
                                                {selectedRequest.start_date} <span className="mx-2 text-gray-400">s/d</span> {selectedRequest.end_date}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Diajukan Pada</label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRequest.created_at}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Alasan / Keterangan</label>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">"{selectedRequest.reason}"</p>
                                        {selectedRequest.attachment_path && (
                                            <div className="mt-4">
                                                <a href={`/storage/${selectedRequest.attachment_path}`} target="_blank" className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                                                    <InboxIcon className="w-4 h-4 mr-1.5" />
                                                    Lihat Dokumen Lampiran
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {(selectedRequest.task_description || selectedRequest.task_file_path) && (
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                            <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">Informasi Tugas Pengganti (Guru)</label>
                                            <p className="text-gray-800 dark:text-emerald-300 font-medium">{selectedRequest.task_description || "Tidak ada deskripsi tugas."}</p>
                                            {selectedRequest.task_file_path && (
                                                <div className="mt-4">
                                                    <a href={`/storage/${selectedRequest.task_file_path}`} target="_blank" className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                                                        <InboxIcon className="w-4 h-4 mr-1.5" />
                                                        Unduh File Tugas
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                                            <label className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest block mb-1">Alasan Penolakan</label>
                                            <p className="text-red-800 dark:text-red-300">{selectedRequest.rejection_reason}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                                    {selectedRequest.status === 'pending' ? (
                                        <>
                                            <button 
                                                onClick={() => { setIsDetailOpen(false); openDialog(selectedRequest.id, 'approve'); }}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm"
                                            >
                                                Setujui Izin
                                            </button>
                                            <button 
                                                onClick={() => { setIsDetailOpen(false); openDialog(selectedRequest.id, 'reject'); }}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm"
                                            >
                                                Tolak
                                            </button>
                                        </>
                                    ) : (
                                        <p className="text-center text-sm text-gray-500 w-full italic">Pengajuan ini sudah diproses.</p>
                                    )}
                                    <button 
                                        onClick={() => setIsDetailOpen(false)}
                                        className="sm:w-32 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
