import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, useForm } from '@inertiajs/react';

export default function BillCreate() {
    const { classes, students } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        target_type: 'class', // 'class' or 'student'
        class_id: '',
        student_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: 150000,
        title: 'Pembayaran SPP Bulanan',
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route('admin.bills.store'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Buat Tagihan Pembayaran</h2>}
        >
            <Head title="Buat Tagihan" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* TARGET TYPE SELECTOR */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Mode Tagihan</label>
                                <div className="flex items-center space-x-4">
                                    <label className="inline-flex items-center">
                                        <input 
                                            type="radio" 
                                            name="target_type" 
                                            value="class"
                                            checked={data.target_type === 'class'}
                                            onChange={() => setData('target_type', 'class')}
                                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Massal (Per Kelas)</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input 
                                            type="radio" 
                                            name="target_type" 
                                            value="student"
                                            checked={data.target_type === 'student'}
                                            onChange={() => setData('target_type', 'student')}
                                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Individu (Per Siswa)</span>
                                    </label>
                                </div>
                            </div>

                            {/* CLASS SELECT */}
                            {data.target_type === 'class' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pilih Kelas</label>
                                    <select 
                                        value={data.class_id}
                                        onChange={e => setData('class_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required={data.target_type === 'class'}
                                    >
                                        <option value="">-- Pilih Kelas --</option>
                                        {classes?.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {errors.class_id && <p className="mt-1 text-sm text-red-600">{errors.class_id}</p>}
                                    <p className="mt-1 text-xs text-gray-500">Sistem akan otomatis membuat tagihan untuk semua murid aktif di kelas ini.</p>
                                </div>
                            )}

                            {/* STUDENT SELECT */}
                            {data.target_type === 'student' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pilih Siswa</label>
                                    <select 
                                        value={data.student_id}
                                        onChange={e => setData('student_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required={data.target_type === 'student'}
                                    >
                                        <option value="">-- Pilih Siswa --</option>
                                        {students?.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.nis ?? '-'})</option>
                                        ))}
                                    </select>
                                    {errors.student_id && <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bulan</label>
                                    <input 
                                        type="number" min="1" max="12"
                                        value={data.month}
                                        onChange={e => setData('month', parseInt(e.target.value))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tahun</label>
                                    <input 
                                        type="number"
                                        value={data.year}
                                        onChange={e => setData('year', parseInt(e.target.value))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul Tagihan</label>
                                <input 
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nominal (Rp)</label>
                                <input 
                                    type="number" min="1"
                                    value={data.amount}
                                    onChange={e => setData('amount', parseInt(e.target.value))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs tracking-widest active:bg-indigo-900 transition ease-in-out duration-150"
                                >
                                    {processing ? 'Memproses...' : 'Generate Tagihan'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
