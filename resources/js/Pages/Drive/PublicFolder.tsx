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
                    
                    <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg flex flex-col">
                        
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
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b flex items-center gap-2 overflow-x-auto whitespace-nowrap hidden md:flex">
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

                        {/* Mobile Breadcrumb */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b flex flex-col gap-2 md:hidden">
                            {breadcrumbs.length > 1 ? (
                                <>
                                    <a 
                                        href={`/drive/f/${token}?folder_id=${breadcrumbs[breadcrumbs.length - 2].id}`}
                                        className="text-indigo-600 font-medium hover:underline self-start flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                        Kembali
                                    </a>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{breadcrumbs[breadcrumbs.length - 1].name}</h2>
                                </>
                            ) : (
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{sharedFolder.name}</h2>
                            )}
                        </div>

                        <div className="overflow-x-auto hidden md:block">
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

                        {/* Mobile List View */}
                        <div className="flex flex-col md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                            {(subfolders?.length === 0 || !subfolders) && (files?.length === 0 || !files) && (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-slate-500 font-medium">Folder ini kosong</p>
                                </div>
                            )}

                            {/* Mobile Folders */}
                            {subfolders?.map((folder: any) => (
                                <a 
                                    key={`m-folder-${folder.id}`} 
                                    href={`/drive/f/${token}?folder_id=${folder.id}`}
                                    className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100"
                                >
                                    <div className="w-10 h-10 shrink-0 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{folder.name}</span>
                                        <span className="text-xs text-slate-500 mt-0.5">Folder</span>
                                    </div>
                                </a>
                            ))}

                            {/* Mobile Files */}
                            {files?.map((file: any) => {
                                const mime = file.mime_type?.toLowerCase() || '';
                                const ext = file.original_name.split('.').pop()?.toLowerCase();
                                let Icon = <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
                                let iconBg = 'bg-slate-100 text-slate-500';
                                
                                if (mime.includes('pdf') || ext === 'pdf') { iconBg = 'bg-red-50 text-red-500'; }
                                else if (mime.includes('word') || ext === 'doc' || ext === 'docx') { iconBg = 'bg-blue-50 text-blue-600'; }
                                else if (mime.includes('excel') || mime.includes('spreadsheet') || ext === 'xls' || ext === 'xlsx' || ext === 'csv') { iconBg = 'bg-emerald-50 text-emerald-600'; }
                                else if (mime.includes('image')) { iconBg = 'bg-amber-50 text-amber-500'; }

                                return (
                                    <div 
                                        key={`m-file-${file.id}`} 
                                        onClick={() => openPreview(file)}
                                        className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 cursor-pointer"
                                    >
                                        <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${iconBg}`}>
                                            {Icon}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{file.original_name}</span>
                                            <span className="text-xs text-slate-500 mt-0.5">{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <div className="shrink-0">
                                            <a 
                                                href={`/drive/p/${file.public_token ?? ''}?folder_token=${token}&file_id=${file.id}&download=1`} 
                                                onClick={e => e.stopPropagation()}
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
