import { useState, FormEvent } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
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
        <Transition show={show} leave="duration-200">
            <Dialog as="div" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClose={onClose}>
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
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">
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
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg w-full sm:w-auto">Batal</button>
                                    <button type="submit" disabled={processing || !shareForm.shared_to_id} className="px-4 py-2 bg-indigo-600 font-medium text-white rounded-lg disabled:opacity-50 w-full sm:w-auto">
                                        Bagikan
                                    </button>
                                </div>
                            </form>
                            <div className="mt-4 text-xs text-slate-500">
                                *Membagikan folder ini akan otomatis memberikan akses ke seluruh isi file dan sub-folder di dalamnya.
                            </div>

                            {folder?.is_public && (
                                <div className="mt-6 pt-6 border-t border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Tautan Publik</h3>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input type="text" readOnly value={`${window.location.origin}/drive/f/${folder.public_token}`} className="flex-1 border-slate-300 rounded-lg shadow-sm text-sm bg-slate-50" />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/drive/f/${folder.public_token}`);
                                                alert('Tautan disalin!');
                                            }} className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">Salin</button>
                                            <button type="button" onClick={() => {
                                                router.delete(route('drive.folders.public-link.revoke', folder.id), {
                                                    onSuccess: () => onClose()
                                                });
                                            }} className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200">Cabut Link</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
