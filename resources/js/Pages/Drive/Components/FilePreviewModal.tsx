import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

interface DriveFile {
    id: number;
    original_name: string;
    mime_type: string;
    file_size: number;
    is_public?: boolean;
    public_token?: string;
    owner?: {
        name: string;
    };
}

export default function FilePreviewModal({ show, onClose, file, downloadUrl }: { show: boolean, onClose: () => void, file: DriveFile | null, downloadUrl?: string }) {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!show || !file) return;

        setContent(null);
        setError(null);
        setLoading(true);

        const mime = file.mime_type.toLowerCase();
        const ext = file.original_name.split('.').pop()?.toLowerCase();
        const url = downloadUrl || route('drive.download', file.id);

        if (mime.includes('image')) {
            setContent('image');
            setLoading(false);
        } else if (mime.includes('pdf') || mime.includes('text/plain') || ext === 'pdf') {
            // Can be previewed natively in iframe
            setContent('native');
            setLoading(false);
        } else if (ext === 'docx') {
            // Use mammoth
            fetch(url)
                .then(res => res.arrayBuffer())
                .then(buffer => {
                    mammoth.convertToHtml({ arrayBuffer: buffer })
                        .then(result => {
                            setContent(result.value);
                            setLoading(false);
                        })
                        .catch(err => {
                            setError('Gagal memproses file Word.');
                            setLoading(false);
                        });
                })
                .catch(err => {
                    setError('Gagal mengunduh file untuk preview.');
                    setLoading(false);
                });
        } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
            // Use xlsx
            fetch(url)
                .then(res => res.arrayBuffer())
                .then(buffer => {
                    try {
                        const workbook = XLSX.read(buffer, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const html = XLSX.utils.sheet_to_html(worksheet);
                        setContent(html);
                        setLoading(false);
                    } catch (err) {
                        setError('Gagal memproses file Excel.');
                        setLoading(false);
                    }
                })
                .catch(err => {
                    setError('Gagal mengunduh file untuk preview.');
                    setLoading(false);
                });
        } else {
            setError('Format file tidak didukung untuk preview.');
            setLoading(false);
        }
    }, [show, file]);

    if (!show || !file) return null;

    return (
        <Transition show={show} leave="duration-200">
            <Dialog as="div" className="fixed inset-0 z-50 flex transform items-center justify-center overflow-y-auto sm:px-4 py-0 sm:py-8 transition-all" onClose={onClose}>
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-slate-900/90 sm:bg-slate-500/75 sm:dark:bg-slate-900/75" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-full sm:translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-full sm:translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel className="transform overflow-hidden bg-white dark:bg-slate-800 shadow-xl transition-all w-full h-[100dvh] sm:h-[90vh] sm:mx-auto sm:rounded-lg sm:max-w-5xl flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky top-0 z-10 shrink-0">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <button onClick={onClose} className="sm:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-200 rounded-full">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate pr-4">
                                    {file.original_name}
                                </h2>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <a href={(downloadUrl || route('drive.download', file.id)) + '&download=1'} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Unduh
                                </a>
                                <button onClick={onClose} className="hidden sm:block px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200">
                                    Tutup
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 relative">
                            {loading && (
                                <div className="absolute inset-0 flex justify-center items-center">
                                    <span className="text-slate-500 font-medium animate-pulse">Memuat pratinjau...</span>
                                </div>
                            )}
                            {error && (
                                <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 p-6 text-center">
                                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{error}</span>
                                    <a href={(downloadUrl || route('drive.download', file.id)) + '&download=1'} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium shadow hover:bg-indigo-700">Unduh File</a>
                                </div>
                            )}
                            {content === 'image' && !loading && !error && (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <img src={downloadUrl || route('drive.download', file.id)} alt={file.original_name} className="max-w-full max-h-full object-contain drop-shadow-md" />
                                </div>
                            )}
                            {content === 'native' && !loading && !error && (
                                <div className="w-full h-full flex flex-col">
                                    {/* Mobile Fallback */}
                                    <div className="sm:hidden flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
                                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Pratinjau dokumen ini mungkin tidak didukung di browser HP.</p>
                                        <a href={downloadUrl || route('drive.download', file.id)} target="_blank" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md transition-transform active:scale-95">
                                            Buka di Tab Baru
                                        </a>
                                    </div>
                                    {/* Desktop Iframe */}
                                    <iframe 
                                        src={downloadUrl || route('drive.download', file.id)} 
                                        className="hidden sm:block w-full h-full border-0 bg-white" 
                                        title="Preview"
                                    />
                                </div>
                            )}
                            {content && content !== 'native' && content !== 'image' && !loading && !error && (
                                <div 
                                    className="bg-white p-4 sm:p-8 shadow-sm min-h-full overflow-auto text-slate-800 prose max-w-none text-sm sm:text-base w-full"
                                    dangerouslySetInnerHTML={{ __html: content }}
                                />
                            )}
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
