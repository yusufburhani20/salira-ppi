import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useState } from 'react';
import FilePreviewModal from './Components/FilePreviewModal';

export default function PublicFolder({ sharedFolder, currentFolder, subfolders, files, breadcrumbs, ownerName, token }: any) {
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [fileToPreview, setFileToPreview] = useState<any>(null);

    const openPreview = (file: any) => {
        if (file.file_size > 10 * 1024 * 1024 && !file.mime_type.includes('pdf') && !file.mime_type.includes('image')) {
            alert('File ini terlalu besar untuk di-preview (>10MB). Silakan unduh file untuk melihat isinya.');
            return;
        }
        setFileToPreview(file);
        setPreviewModalOpen(true);
    };

    return (
        <GuestLayout>
            <Head title={`Folder: ${sharedFolder.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg overflow-hidden flex flex-col">
                        
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                                    Folder Publik: {sharedFolder.name}
                                </h2>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                    Dibagikan oleh: {ownerName}
                                </p>
                            </div>
                        </div>

                        {/* Breadcrumbs */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                            {breadcrumbs.map((bc: any, idx: number) => (
                                <div key={bc.id} className="flex items-center gap-2">
                                    {idx > 0 && <span className="text-slate-400">/</span>}
                                    <a 
                                        href={`/drive/f/${token}?folder_id=${bc.id}`}
                                        className={`font-medium hover:underline ${idx === breadcrumbs.length - 1 ? 'text-slate-900 dark:text-slate-100 pointer-events-none' : 'text-indigo-600'}`}
                                    >
                                        {bc.name}
                                    </a>
                                </div>
                            ))}
                        </div>

                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ukuran</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                
                                {/* Render Folders */}
                                {subfolders?.map((folder: any) => (
                                    <tr key={`folder-${folder.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <a href={`/drive/f/${token}?folder_id=${folder.id}`} className="flex items-center gap-2 hover:underline">
                                                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                                                {folder.name}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">-</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <a href={`/drive/f/${token}?folder_id=${folder.id}`} className="text-indigo-600 hover:text-indigo-900">Buka</a>
                                        </td>
                                    </tr>
                                ))}

                                {/* Render Files */}
                                {files?.map((file: any) => (
                                    <tr key={`file-${file.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 cursor-pointer" onClick={() => openPreview(file)}>
                                            <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                            {file.original_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(file.file_size / 1024 / 1024).toFixed(2)} MB</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {/* Note: File preview modal inside GuestLayout needs to point to correct download route. */}
                                            {/* If file itself is not public, we need a special download link for files inside public folders. */}
                                            {/* But wait, DriveController@download checks ownership OR if file is in a public folder? No it doesn't! */}
                                            {/* Let's fix this! We should use a public file download endpoint OR modify DriveController@download. */}
                                            <a href={`/drive/p/${file.public_token ?? ''}?folder_token=${token}&file_id=${file.id}&download=1`} className="text-indigo-600 hover:text-indigo-900">Unduh</a>
                                        </td>
                                    </tr>
                                ))}

                                {(subfolders?.length === 0 || !subfolders) && (files?.length === 0 || !files) && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-slate-500">Folder ini kosong.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <FilePreviewModal
                show={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                file={fileToPreview}
                downloadUrl={fileToPreview ? `/drive/f/${token}/download/${fileToPreview.id}?` : undefined}
            />
        </GuestLayout>
    );
}
