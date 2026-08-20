import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
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

        if (mime.includes('pdf') || mime.includes('image') || mime.includes('text/plain') || ext === 'pdf') {
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
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="flex flex-col h-[80vh]">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate pr-4">
                        Preview: {file.original_name}
                    </h2>
                    <div className="flex gap-2">
                        <a href={(downloadUrl || route('drive.download', file.id)) + '&download=1'} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200">
                            Unduh Asli
                        </a>
                        <button onClick={onClose} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200">
                            Tutup
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-4">
                    {loading && (
                        <div className="flex justify-center items-center h-full">
                            <span className="text-slate-500">Memuat preview...</span>
                        </div>
                    )}
                    {error && (
                        <div className="flex justify-center items-center h-full flex-col gap-2">
                            <span className="text-red-500">{error}</span>
                            <a href={(downloadUrl || route('drive.download', file.id)) + '&download=1'} className="text-indigo-600 underline">Unduh File Saja</a>
                        </div>
                    )}
                    {content === 'native' && !loading && !error && (
                        <iframe 
                            src={downloadUrl || route('drive.download', file.id)} 
                            className="w-full h-full border-0 bg-white" 
                            title="Preview"
                        />
                    )}
                    {content && content !== 'native' && !loading && !error && (
                        <div 
                            className="bg-white p-8 shadow-sm min-h-full overflow-auto text-slate-800 prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
}
