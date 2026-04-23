import PortalLayout from '@/Layouts/PortalLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { PlusIcon, PhotoIcon, TrashIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Index({ permissions }: any) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        type: 'izin',
        start_date: '',
        end_date: '',
        reason: '',
        attachment: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('portal.permissions.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setPreviewImage(null);
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('attachment', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <PortalLayout header="Permohonan Izin / Sakit">
            <Head title="Izin & Sakit" />

            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-700">
                    <div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white italic">Riwayat Izin</h3>
                        <p className="text-xs text-slate-500">Pantau status pengajuan izin dan sakit Anda.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Buat Izin
                    </button>
                </div>

                <div className="space-y-4">
                    {permissions.data.map((permission: any) => (
                        <div key={permission.id} className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`p-4 rounded-2xl ${
                                        permission.type === 'sakit' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        <ClockIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                permission.type === 'sakit' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {permission.type}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {permission.start_date} s/d {permission.end_date}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-white">{permission.reason}</h4>
                                        {permission.rejection_reason && (
                                            <p className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-xl">
                                                Alasan Tolak: {permission.rejection_reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                        permission.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                        permission.status === 'rejected' ? 'bg-rose-100 text-rose-600' :
                                        'bg-slate-100 text-slate-500'
                                    }`}>
                                        {permission.status === 'approved' && <CheckCircleIcon className="w-3 h-3" />}
                                        {permission.status === 'rejected' && <XCircleIcon className="w-3 h-3" />}
                                        {permission.status}
                                    </span>
                                    
                                    {permission.status === 'pending' && (
                                        <button 
                                            onClick={() => destroy(route('portal.permissions.destroy', permission.id))}
                                            className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-all"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {permissions.data.length === 0 && (
                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <ClockIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-bold">Belum ada riwayat izin.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={submit} className="p-8">
                    <h2 className="text-xl font-black text-slate-800 mb-6 italic">Buat Permohonan Izin</h2>
                    
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Tipe Izin" />
                                <select 
                                    className="mt-1 block w-full rounded-2xl border-slate-200 text-sm font-bold focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                >
                                    <option value="izin">Izin</option>
                                    <option value="sakit">Sakit</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Mulai Tanggal" />
                                <TextInput 
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Sampai Tanggal" />
                            <TextInput 
                                type="date"
                                className="mt-1 block w-full"
                                value={data.end_date}
                                onChange={e => setData('end_date', e.target.value)}
                                required
                            />
                            <InputError message={errors.end_date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Alasan / Keterangan" />
                            <textarea 
                                className="mt-1 block w-full rounded-2xl border-slate-200 text-sm font-bold focus:border-indigo-500 focus:ring-indigo-500"
                                rows={3}
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                                placeholder="Jelaskan alasan Anda..."
                                required
                            />
                            <InputError message={errors.reason} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value="Foto Bukti (Opsional)" />
                            <div className="mt-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-6 hover:border-indigo-400 transition-all cursor-pointer relative overflow-hidden group">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                                {previewImage ? (
                                    <img src={previewImage} className="max-h-40 rounded-xl" alt="Preview" />
                                ) : (
                                    <div className="text-center">
                                        <PhotoIcon className="w-8 h-8 mx-auto text-slate-300 group-hover:text-indigo-400 mb-2" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klik untuk upload foto</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-400">Batal</button>
                        <PrimaryButton disabled={processing}>Kirim Permohonan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </PortalLayout>
    );
}
