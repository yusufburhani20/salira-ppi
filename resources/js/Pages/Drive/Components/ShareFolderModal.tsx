import { useState, FormEvent } from 'react';
import Modal from '@/Components/Modal';
import { router } from '@inertiajs/react';

export default function ShareFolderModal({ show, onClose, folder, shareableUsers }: { show: boolean, onClose: () => void, folder: any, shareableUsers: any[] }) {
    const [shareForm, setShareForm] = useState({ shared_to_type: '', shared_to_id: '' });
    const [processing, setProcessing] = useState(false);

    const handleShare = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('drive.folders.share.store', folder.id), shareForm, {
            onSuccess: () => {
                onClose();
                setShareForm({ shared_to_type: '', shared_to_id: '' });
                setProcessing(false);
            },
            onError: () => setProcessing(false)
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                    Bagikan Folder: {folder?.name}
                </h2>
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
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                        <button type="submit" disabled={processing || !shareForm.shared_to_id} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                            Bagikan
                        </button>
                    </div>
                </form>
                    <div className="mt-4 text-sm text-slate-500">
                        *Membagikan folder ini akan otomatis memberikan akses ke seluruh isi file dan sub-folder di dalamnya.
                    </div>

                    {folder?.is_public && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Tautan Publik</h3>
                            <div className="flex gap-2">
                                <input type="text" readOnly value={`${window.location.origin}/drive/f/${folder.public_token}`} className="flex-1 border-slate-300 rounded-md shadow-sm text-sm" />
                                <button type="button" onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/drive/f/${folder.public_token}`);
                                    alert('Tautan publik folder disalin ke clipboard!');
                                }} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200">Salin</button>
                                <button type="button" onClick={() => {
                                    router.delete(route('drive.folders.public-link.revoke', folder.id), {
                                        onSuccess: () => onClose()
                                    });
                                }} className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">Cabut Link</button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        );
    }
