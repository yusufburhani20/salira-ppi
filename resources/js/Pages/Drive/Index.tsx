import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PortalLayout from '@/Layouts/PortalLayout';
import { useState, FormEvent } from 'react';
import Modal from '@/Components/Modal';

export default function DriveIndex({ auth, myFiles, sharedFiles, shareableUsers }: any) {
    const isStudent = !auth.user.roles;
    const Layout = isStudent ? PortalLayout : AuthenticatedLayout as any;

    const [activeTab, setActiveTab] = useState('my-files');
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<any>(null);

    const { data, setData, post, progress, reset, errors } = useForm({
        file: null as File | null,
    });

    const handleUpload = (e: FormEvent) => {
        e.preventDefault();
        setUploading(true);
        post(route('drive.store'), {
            onSuccess: () => {
                reset();
                setUploading(false);
            },
            onError: () => setUploading(false)
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus file ini?')) {
            router.delete(route('drive.destroy', id));
        }
    };

    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareForm, setShareForm] = useState({ shared_to_type: '', shared_to_id: '' });

    const handleShare = (e: FormEvent) => {
        e.preventDefault();
        router.post(route('drive.share.store', selectedFile.id), shareForm, {
            onSuccess: () => {
                setShareModalOpen(false);
                setShareForm({ shared_to_type: '', shared_to_id: '' });
            }
        });
    };

    const handleRevokeShare = (fileId: number, shareId: number) => {
        router.delete(route('drive.share.destroy', { id: fileId, shareId }));
    };

    const handleGenerateLink = (id: number) => {
        router.post(route('drive.public-link.generate', id));
    };

    const handleRevokeLink = (id: number) => {
        router.delete(route('drive.public-link.revoke', id));
    };

    const copyToClipboard = (token: string) => {
        const url = `${window.location.origin}/drive/p/${token}`;
        navigator.clipboard.writeText(url);
        alert('Tautan disalin ke clipboard!');
    };

    return (
        <Layout header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200">Drive Saya</h2>}>
            <Head title="Drive Saya" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Upload Section */}
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6">
                        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-center">
                            <input 
                                type="file" 
                                onChange={e => setData('file', e.target.files ? e.target.files[0] : null)}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            <button 
                                type="submit" 
                                disabled={uploading || !data.file}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 font-semibold"
                            >
                                {uploading ? 'Mengunggah...' : 'Unggah File'}
                            </button>
                        </form>
                        {progress && (
                            <div className="w-full bg-slate-200 rounded-full h-2.5 mt-4">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                            </div>
                        )}
                        {errors.file && <p className="text-red-500 text-sm mt-2">{errors.file}</p>}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 mb-6">
                        <button 
                            className={`py-2 px-4 border-b-2 font-semibold ${activeTab === 'my-files' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('my-files')}
                        >
                            File Saya
                        </button>
                        <button 
                            className={`py-2 px-4 border-b-2 font-semibold ${activeTab === 'shared' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('shared')}
                        >
                            Dibagikan dengan Saya
                        </button>
                    </div>

                    {/* Tab Content: My Files */}
                    {activeTab === 'my-files' && (
                        <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama File</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ukuran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Berbagi</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {myFiles.map((file: any) => (
                                        <tr key={file.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{file.original_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(file.file_size / 1024 / 1024).toFixed(2)} MB</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {file.is_public ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Publik</span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">Privat</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <a href={route('drive.download', file.id)} className="text-indigo-600 hover:text-indigo-900">Unduh</a>
                                                <button onClick={() => { setSelectedFile(file); setShareModalOpen(true); }} className="text-blue-600 hover:text-blue-900">Bagikan</button>
                                                
                                                {file.is_public ? (
                                                    <button onClick={() => copyToClipboard(file.public_token)} className="text-green-600 hover:text-green-900">Salin Link</button>
                                                ) : (
                                                    <button onClick={() => handleGenerateLink(file.id)} className="text-green-600 hover:text-green-900">Buat Link</button>
                                                )}
                                                
                                                <button onClick={() => handleDelete(file.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {myFiles.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-slate-500">Belum ada file di drive Anda.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab Content: Shared with Me */}
                    {activeTab === 'shared' && (
                        <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama File</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pemilik</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ukuran</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {sharedFiles.map((file: any) => (
                                        <tr key={file.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{file.original_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{file.owner?.name || 'User'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(file.file_size / 1024 / 1024).toFixed(2)} MB</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <a href={route('drive.download', file.id)} className="text-indigo-600 hover:text-indigo-900">Unduh</a>
                                            </td>
                                        </tr>
                                    ))}
                                    {sharedFiles.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-slate-500">Belum ada file yang dibagikan kepada Anda.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Share Modal */}
            <Modal show={shareModalOpen} onClose={() => setShareModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">Bagikan File: {selectedFile?.original_name}</h2>
                    
                    <form onSubmit={handleShare} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pilih Pengguna</label>
                            <select 
                                required
                                value={`${shareForm.shared_to_type}|${shareForm.shared_to_id}`}
                                onChange={e => {
                                    const [type, id] = e.target.value.split('|');
                                    setShareForm({ shared_to_type: type, shared_to_id: id });
                                }}
                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm"
                            >
                                <option value="|">-- Pilih Pengguna --</option>
                                {shareableUsers?.map((user: any) => (
                                    <option key={`${user.type}|${user.id}`} value={`${user.type}|${user.id}`}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShareModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Bagikan</button>
                        </div>
                    </form>

                    {selectedFile?.is_public && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Tautan Publik</h3>
                            <div className="flex gap-2">
                                <input type="text" readOnly value={`${window.location.origin}/drive/p/${selectedFile.public_token}`} className="flex-1 border-slate-300 rounded-md shadow-sm text-sm" />
                                <button onClick={() => copyToClipboard(selectedFile.public_token)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-md">Salin</button>
                                <button onClick={() => handleRevokeLink(selectedFile.id)} className="px-3 py-2 bg-red-100 text-red-700 rounded-md">Cabut Link</button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

        </Layout>
    );
}
