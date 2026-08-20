import { useState, FormEvent, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';

export default function CreateFolderModal({ show, onClose, parentId, folderToEdit = null }: { show: boolean, onClose: () => void, parentId: number | null, folderToEdit?: any }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        parent_id: parentId
    });

    useEffect(() => {
        if (folderToEdit) {
            setData({ name: folderToEdit.name, parent_id: parentId });
        } else {
            setData({ name: '', parent_id: parentId });
        }
    }, [folderToEdit, parentId, show]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (folderToEdit) {
            put(route('drive.folders.update', folderToEdit.id), {
                onSuccess: () => { reset(); onClose(); },
            });
        } else {
            post(route('drive.folders.store'), {
                onSuccess: () => { reset(); onClose(); },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                    {folderToEdit ? 'Ubah Nama Folder' : 'Buat Folder Baru'}
                </h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Folder</label>
                        <input 
                            type="text" 
                            required
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm"
                            placeholder="Nama Folder..."
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                            {folderToEdit ? 'Simpan' : 'Buat'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
