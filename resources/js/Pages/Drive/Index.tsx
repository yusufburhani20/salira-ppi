import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PortalLayout from '@/Layouts/PortalLayout';
import { useState, FormEvent, useEffect } from 'react';
import Modal from '@/Components/Modal';
import Dropdown from '@/Components/Dropdown';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
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

    const handleUpload = (e?: FormEvent) => {
        if(e) e.preventDefault();
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

    useEffect(() => {
        // Auto submit if file is selected via mobile FAB
        const fileInput = document.getElementById('mobile-upload-input') as HTMLInputElement;
        if (data.file && fileInput && fileInput.files && fileInput.files[0] === data.file) {
            handleUpload();
            fileInput.value = ''; // reset input
        }
    }, [data.file]);

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

    const handleRevokeFolderLink = (id: number) => {
        router.delete(route('drive.folders.public-link.revoke', id), {
            onSuccess: () => {
                if (currentFolder) loadFolder(currentFolder.id);
                else loadFolder(null);
            }
        });
    };

    const handleGenerateFolderLink = (id: number) => {
        router.post(route('drive.folders.public-link.generate', id), {}, {
            onSuccess: () => {
                if (currentFolder) loadFolder(currentFolder.id);
                else loadFolder(null);
            }
        });
    };

    const copyFolderToClipboard = (token: string) => {
        const url = `${window.location.origin}/drive/f/${token}`;
        navigator.clipboard.writeText(url);
        alert('Tautan publik folder disalin ke clipboard!');
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
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b flex items-center gap-2 overflow-x-auto whitespace-nowrap hidden md:flex">
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

                            {/* Mobile Breadcrumb & Header */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b flex flex-col gap-2 md:hidden">
                                {currentFolder ? (
                                    <>
                                        <button onClick={() => {
                                            const parent = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2].id : null;
                                            loadFolder(parent);
                                        }} className="text-indigo-600 font-medium hover:underline self-start flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                            Kembali
                                        </button>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{currentFolder.name}</h2>
                                    </>
                                ) : (
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Drive Root</h2>
                                )}
                            </div>

                            {isLoadingFolder ? (
                                <div className="p-10 flex flex-col gap-4">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="animate-pulse flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                {/* Desktop Table View */}
                                <div className="overflow-x-auto hidden md:block">
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
                                                    {folder.is_public ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Publik</span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">Folder</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedFolder(folder); setShareFolderModalOpen(true); }} className="text-blue-600 hover:text-blue-900">Share</button>
                                                    {folder.is_public ? (
                                                        <button onClick={(e) => { e.stopPropagation(); copyFolderToClipboard(folder.public_token); }} className="text-green-600 hover:text-green-900">Salin Link</button>
                                                    ) : (
                                                        <button onClick={(e) => { e.stopPropagation(); handleGenerateFolderLink(folder.id); }} className="text-green-600 hover:text-green-900">Buat Link</button>
                                                    )}
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
                                </div>

                                {/* Mobile List View */}
                                <div className="flex flex-col md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {(folders?.length === 0 || !folders) && (files?.length === 0 || !files) && (
                                        <div className="py-12 flex flex-col items-center justify-center text-center">
                                            <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-slate-500 font-medium">Folder ini masih kosong</p>
                                        </div>
                                    )}

                                    {/* Mobile Folders */}
                                    {folders?.filter(Boolean).map((folder: any) => (
                                        <div key={`m-folder-${folder.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 cursor-pointer" onClick={() => loadFolder(folder.id)}>
                                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                <div className="w-10 h-10 shrink-0 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{folder.name}</span>
                                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                        {folder.is_public ? (
                                                            <span className="text-green-600 font-medium">Publik</span>
                                                        ) : (
                                                            <span>Folder</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                                                <Dropdown>
                                                    <Dropdown.Trigger>
                                                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                                        </button>
                                                    </Dropdown.Trigger>
                                                    <Dropdown.Content align="right" width="48">
                                                        <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" onClick={() => { setSelectedFolder(folder); setShareFolderModalOpen(true); }}>Bagikan</button>
                                                        {folder.is_public ? (
                                                            <button className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-slate-100" onClick={() => copyFolderToClipboard(folder.public_token)}>Salin Link</button>
                                                        ) : (
                                                            <button className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-slate-100" onClick={() => handleGenerateFolderLink(folder.id)}>Buat Link</button>
                                                        )}
                                                        <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" onClick={() => { setFolderToEdit(folder); setCreateFolderModalOpen(true); }}>Ganti Nama</button>
                                                        <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" onClick={() => { setFolderToMove(folder); setMoveModalOpen(true); }}>Pindahkan</button>
                                                        <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100" onClick={() => handleDeleteFolder(folder.id)}>Hapus</button>
                                                    </Dropdown.Content>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Mobile Files */}
                                    {files?.filter(Boolean).map((file: any) => {
                                        const mime = file.mime_type?.toLowerCase() || '';
                                        const ext = file.original_name.split('.').pop()?.toLowerCase();
                                        let Icon = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
                                        let iconBg = 'bg-slate-100 text-slate-500';
                                        
                                        if (mime.includes('pdf') || ext === 'pdf') { iconBg = 'bg-red-50 text-red-500'; }
                                        else if (mime.includes('word') || ext === 'doc' || ext === 'docx') { iconBg = 'bg-blue-50 text-blue-600'; }
                                        else if (mime.includes('excel') || mime.includes('spreadsheet') || ext === 'xls' || ext === 'xlsx' || ext === 'csv') { iconBg = 'bg-emerald-50 text-emerald-600'; }
                                        else if (mime.includes('image')) { iconBg = 'bg-amber-50 text-amber-500'; }

                                        return (
                                            <div key={`m-file-${file.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 cursor-pointer" onClick={() => openPreview(file)}>
                                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${iconBg}`}>
                                                        {Icon}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{file.original_name}</span>
                                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                            <span>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                                            <span>•</span>
                                                            {file.is_public ? (
                                                                <span className="text-green-600 font-medium">Publik</span>
                                                            ) : (
                                                                <span>Privat</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                                                    <Dropdown>
                                                        <Dropdown.Trigger>
                                                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                                                            </button>
                                                        </Dropdown.Trigger>
                                                        <Dropdown.Content align="right" width="48">
                                                            <a href={route('drive.download', file.id) + '?download=1'} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Unduh</a>
                                                            <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" onClick={() => { setSelectedFile(file); setShareFileModalOpen(true); }}>Bagikan</button>
                                                            {file.is_public ? (
                                                                <button className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-slate-100" onClick={() => copyToClipboard(file.public_token)}>Salin Link</button>
                                                            ) : (
                                                                <button className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-slate-100" onClick={() => handleGenerateLink(file.id)}>Buat Link</button>
                                                            )}
                                                            <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100" onClick={() => handleDeleteFile(file.id)}>Hapus</button>
                                                        </Dropdown.Content>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Tab Content: Shared with Me */}
                    {activeTab === 'shared' && (
                        <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg overflow-hidden">
                            <div className="p-4 bg-slate-50 text-sm text-slate-500">
                                (Hanya menampilkan file yang dibagikan secara spesifik kepada Anda. Folder yang dibagikan dapat dilihat di tab "File Saya" pada Root).
                            </div>
                            <div className="overflow-x-auto">
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
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile FAB */}
            <div className="fixed bottom-6 right-6 z-40 md:hidden">
                <Dropdown>
                    <Dropdown.Trigger>
                        <button className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content align="right" width="48" contentClasses="py-2 bg-white rounded-xl shadow-xl border border-slate-100 mb-2 bottom-full right-0 relative origin-bottom-right">
                        <button 
                            className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 active:bg-slate-50 flex items-center gap-2"
                            onClick={() => document.getElementById('mobile-upload-input')?.click()}
                        >
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Unggah File
                        </button>
                        <button 
                            className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-700 active:bg-slate-50 flex items-center gap-2"
                            onClick={() => { setFolderToEdit(null); setCreateFolderModalOpen(true); }}
                        >
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                            Buat Folder
                        </button>
                    </Dropdown.Content>
                </Dropdown>
                <form onSubmit={handleUpload} className="hidden">
                    <input 
                        type="file" 
                        id="mobile-upload-input"
                        onChange={e => {
                            const file = e.target.files ? e.target.files[0] : null;
                            if(file) {
                                setData('file', file);
                                // The form needs to be submitted after state update, but setData is async in inertia useForm.
                                // It's better to manually handle upload or use a ref.
                                // For simplicity, we'll wait for the next render. We added a useEffect below to auto submit if 'file' changes and we are uploading from mobile.
                            }
                        }}
                    />
                </form>
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
            <Transition show={shareFileModalOpen} leave="duration-200">
                <Dialog as="div" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClose={() => setShareFileModalOpen(false)}>
                    <TransitionChild
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/50" />
                    </TransitionChild>

                    <TransitionChild
                        enter="ease-out duration-300"
                        enterFrom="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0 sm:opacity-100"
                        enterTo="translate-y-0 sm:scale-100 opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="translate-y-0 sm:scale-100 opacity-100"
                        leaveTo="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0 sm:opacity-100"
                    >
                        <DialogPanel className="w-full max-w-md bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl transform transition-all pb-safe overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>
                            <div className="p-6 overflow-y-auto">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">Bagikan File: {selectedFile?.original_name}</h2>
                                
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
                                            className="mt-1 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="|">-- Pilih Pengguna --</option>
                                            {shareableUsers?.map((user: any) => (
                                                <option key={`${user.type}|${user.id}`} value={`${user.type}|${user.id}`}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={() => setShareFileModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg w-full sm:w-auto">Batal</button>
                                        <button type="submit" disabled={!shareForm.shared_to_id} className="px-4 py-2 bg-indigo-600 font-medium text-white rounded-lg disabled:opacity-50 w-full sm:w-auto">Bagikan</button>
                                    </div>
                                </form>

                                {selectedFile?.is_public && (
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Tautan Publik</h3>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input type="text" readOnly value={`${window.location.origin}/drive/p/${selectedFile.public_token}`} className="flex-1 border-slate-300 rounded-lg shadow-sm text-sm bg-slate-50" />
                                            <div className="flex gap-2">
                                                <button onClick={() => copyToClipboard(selectedFile.public_token)} className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">Salin</button>
                                                <button onClick={() => handleRevokeLink(selectedFile.id)} className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200">Cabut Link</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>

        </Layout>
    );
}
