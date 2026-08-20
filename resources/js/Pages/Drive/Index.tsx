import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PortalLayout from '@/Layouts/PortalLayout';
import { useState, FormEvent, useEffect } from 'react';
import Modal from '@/Components/Modal';
import axios from 'axios';
import CreateFolderModal from './Components/CreateFolderModal';
import ShareFolderModal from './Components/ShareFolderModal';
import FilePreviewModal from './Components/FilePreviewModal';

export default function DriveIndex({ auth, initialFolders, initialFiles, sharedFiles, shareableUsers }: any) {
    const isStudent = !auth.user.roles;
    const Layout = isStudent ? PortalLayout : AuthenticatedLayout as any;

    const [activeTab, setActiveTab] = useState('my-files');
    const [uploading, setUploading] = useState(false);
    
    // Folder State
    const [currentFolder, setCurrentFolder] = useState<any>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>(initialFolders || []);
    const [files, setFiles] = useState<any[]>(initialFiles || []);
    const [isLoadingFolder, setIsLoadingFolder] = useState(false);

    // Modal States
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [selectedFolder, setSelectedFolder] = useState<any>(null);
    
    const [shareFileModalOpen, setShareFileModalOpen] = useState(false);
    const [shareFolderModalOpen, setShareFolderModalOpen] = useState(false);
    const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
    const [folderToEdit, setFolderToEdit] = useState<any>(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [fileToPreview, setFileToPreview] = useState<any>(null);
    
    // Move Folder State
    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [folderToMove, setFolderToMove] = useState<any>(null);
    const [moveTargetId, setMoveTargetId] = useState<number | ''>('');

    const { data, setData, post, progress, reset, errors } = useForm({
        file: null as File | null,
        folder_id: currentFolder?.id || null
    });

    useEffect(() => {
        setData('folder_id', currentFolder?.id || null);
    }, [currentFolder]);

    const loadFolder = async (folderId: number | null) => {
        setIsLoadingFolder(true);
        try {
            if (folderId === null) {
                // Back to root
                setCurrentFolder(null);
                setBreadcrumbs([]);
                setFolders(initialFolders);
                setFiles(initialFiles);
            } else {
                const res = await axios.get(route('drive.folders.index', folderId), {
                    headers: { 'Accept': 'application/json' }
                });
                setCurrentFolder(res.data.currentFolder);
                setBreadcrumbs(res.data.breadcrumbs);
                setFolders(res.data.folders);
                setFiles(res.data.files);
            }
        } catch (error) {
            alert('Gagal memuat folder.');
            // Reload page if error (e.g. 403)
            window.location.reload();
        } finally {
            setIsLoadingFolder(false);
        }
    };

    const handleUpload = (e: FormEvent) => {
        e.preventDefault();
        setUploading(true);
        post(route('drive.store'), {
            onSuccess: () => {
                reset('file');
                setUploading(false);
                if (currentFolder) loadFolder(currentFolder.id);
            },
            onError: () => setUploading(false)
        });
    };

    const handleDeleteFile = (id: number) => {
        if (confirm('Yakin ingin menghapus file ini?')) {
            router.delete(route('drive.destroy', id), {
                onSuccess: () => {
                    if (currentFolder) loadFolder(currentFolder.id);
                }
            });
        }
    };

    const handleDeleteFolder = (id: number) => {
        if (confirm('Yakin ingin menghapus folder ini? File di dalamnya akan dipindah ke root.')) {
            router.delete(route('drive.folders.destroy', id), {
                onSuccess: () => {
                    if (currentFolder) loadFolder(currentFolder.id);
                    else window.location.reload(); // Quick refresh for root
                }
            });
        }
    };

    const handleMoveFolder = (e: FormEvent) => {
        e.preventDefault();
        router.post(route('drive.folders.move', folderToMove.id), {
            target_folder_id: moveTargetId === '' ? null : moveTargetId
        }, {
            onSuccess: () => {
                setMoveModalOpen(false);
                if (currentFolder) loadFolder(currentFolder.id);
                else window.location.reload();
            }
        });
    };

    const [shareForm, setShareForm] = useState({ shared_to_type: '', shared_to_id: '' });
    const handleShareFile = (e: FormEvent) => {
        e.preventDefault();
        router.post(route('drive.share.store', selectedFile.id), shareForm, {
            onSuccess: () => {
                setShareFileModalOpen(false);
                setShareForm({ shared_to_type: '', shared_to_id: '' });
                if (currentFolder) loadFolder(currentFolder.id);
            }
        });
    };

    const handleRevokeLink = (id: number) => {
        router.delete(route('drive.public-link.revoke', id), {
            onSuccess: () => {
                if (currentFolder) loadFolder(currentFolder.id);
            }
        });
    };

    const handleGenerateLink = (id: number) => {
        router.post(route('drive.public-link.generate', id), {}, {
            onSuccess: () => {
                if (currentFolder) loadFolder(currentFolder.id);
            }
        });
    };

    const copyToClipboard = (token: string) => {
        const url = `${window.location.origin}/drive/p/${token}`;
        navigator.clipboard.writeText(url);
        alert('Tautan disalin ke clipboard!');
    };

    const openPreview = (file: any) => {
        if (file.file_size > 10 * 1024 * 1024 && !file.mime_type.includes('pdf') && !file.mime_type.includes('image')) {
            alert('File ini terlalu besar untuk di-preview (>10MB). Silakan unduh file untuk melihat isinya.');
            return;
        }
        setFileToPreview(file);
        setPreviewModalOpen(true);
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
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 font-semibold shrink-0"
                            >
                                {uploading ? 'Mengunggah...' : 'Unggah File'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setFolderToEdit(null); setCreateFolderModalOpen(true); }}
                                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold shrink-0"
                            >
                                + Buat Folder
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
                        <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg overflow-hidden flex flex-col">
                            
                            {/* Breadcrumbs */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                                <button onClick={() => loadFolder(null)} className="text-indigo-600 font-medium hover:underline">
                                    Root
                                </button>
                                {breadcrumbs.map((bc, idx) => (
                                    <div key={bc.id} className="flex items-center gap-2">
                                        <span className="text-slate-400">/</span>
                                        <button 
                                            onClick={() => loadFolder(bc.id)} 
                                            className={`font-medium hover:underline ${idx === breadcrumbs.length - 1 ? 'text-slate-900 dark:text-slate-100' : 'text-indigo-600'}`}
                                        >
                                            {bc.name}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {isLoadingFolder ? (
                                <div className="p-10 text-center text-slate-500">Memuat...</div>
                            ) : (
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ukuran</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Berbagi</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                        
                                        {/* Render Folders */}
                                        {folders?.filter(Boolean).map((folder: any) => (
                                            <tr key={`folder-${folder.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2" onClick={() => loadFolder(folder.id)}>
                                                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                                                    {folder.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500" onClick={() => loadFolder(folder.id)}>-</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500" onClick={() => loadFolder(folder.id)}>
                                                    {/* We can check if folder has shares but for now just label as Folder */}
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">Folder</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedFolder(folder); setShareFolderModalOpen(true); }} className="text-blue-600 hover:text-blue-900">Share</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setFolderToEdit(folder); setCreateFolderModalOpen(true); }} className="text-slate-600 hover:text-slate-900">Rename</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setFolderToMove(folder); setMoveModalOpen(true); }} className="text-slate-600 hover:text-slate-900">Move</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-red-600 hover:text-red-900">Hapus</button>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Render Files */}
                                        {files?.filter(Boolean).map((file: any) => (
                                            <tr key={`file-${file.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 cursor-pointer" onClick={() => openPreview(file)}>
                                                    <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                                    {file.original_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(file.file_size / 1024 / 1024).toFixed(2)} MB</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {file.is_public ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Publik</span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">Privat</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <a href={route('drive.download', file.id) + '?download=1'} className="text-indigo-600 hover:text-indigo-900">Unduh</a>
                                                    <button onClick={() => { setSelectedFile(file); setShareFileModalOpen(true); }} className="text-blue-600 hover:text-blue-900">Bagikan</button>
                                                    
                                                    {file.is_public ? (
                                                        <button onClick={() => copyToClipboard(file.public_token)} className="text-green-600 hover:text-green-900">Salin Link</button>
                                                    ) : (
                                                        <button onClick={() => handleGenerateLink(file.id)} className="text-green-600 hover:text-green-900">Buat Link</button>
                                                    )}
                                                    
                                                    <button onClick={() => handleDeleteFile(file.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                                </td>
                                            </tr>
                                        ))}

                                        {(folders?.length === 0 || !folders) && (files?.length === 0 || !files) && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-slate-500">Folder ini kosong.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Shared with Me */}
                    {activeTab === 'shared' && (
                        <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg overflow-hidden">
                            <div className="p-4 bg-slate-50 text-sm text-slate-500">
                                (Hanya menampilkan file yang dibagikan secara spesifik kepada Anda. Folder yang dibagikan dapat dilihat di tab "File Saya" pada Root).
                            </div>
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
                                    {sharedFiles?.filter(Boolean).map((file: any) => (
                                        <tr key={file.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 cursor-pointer" onClick={() => openPreview(file)}>
                                                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                                {file.original_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{file.owner?.name || 'User'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(file.file_size / 1024 / 1024).toFixed(2)} MB</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <a href={route('drive.download', file.id) + '?download=1'} className="text-indigo-600 hover:text-indigo-900">Unduh</a>
                                            </td>
                                        </tr>
                                    ))}
                                    {(sharedFiles?.length === 0 || !sharedFiles) && (
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

            {/* Modals */}
            <CreateFolderModal 
                show={createFolderModalOpen} 
                onClose={() => { setCreateFolderModalOpen(false); if(currentFolder) loadFolder(currentFolder.id); else window.location.reload(); }} 
                parentId={currentFolder?.id || null} 
                folderToEdit={folderToEdit} 
            />

            <ShareFolderModal 
                show={shareFolderModalOpen} 
                onClose={() => setShareFolderModalOpen(false)} 
                folder={selectedFolder} 
                shareableUsers={shareableUsers} 
            />

            <FilePreviewModal
                show={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                file={fileToPreview}
            />

            {/* Move Folder Modal */}
            <Modal show={moveModalOpen} onClose={() => setMoveModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">Pindahkan Folder: {folderToMove?.name}</h2>
                    <form onSubmit={handleMoveFolder} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">ID Folder Tujuan</label>
                            <input 
                                type="number" 
                                value={moveTargetId}
                                onChange={e => setMoveTargetId(e.target.value === '' ? '' : parseInt(e.target.value))}
                                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm"
                                placeholder="Kosongkan untuk pindah ke Root"
                            />
                            <p className="text-xs text-slate-500 mt-1">Masukkan ID folder tujuan (lihat ID dari URL, atau kosongkan untuk memindah ke root).</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setMoveModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Pindahkan</button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Share File Modal */}
            <Modal show={shareFileModalOpen} onClose={() => setShareFileModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">Bagikan File: {selectedFile?.original_name}</h2>
                    
                    <form onSubmit={handleShareFile} className="space-y-4">
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
                            <button type="button" onClick={() => setShareFileModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
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
