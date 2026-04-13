import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { UserPlusIcon, PencilSquareIcon, TrashIcon, UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface AcademicClass {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
}

interface StudentConsultation {
    id: number;
    student: Student;
    academic_class: AcademicClass;
    category: string;
    consultation_date: string;
    subject: string;
    problem_description: string;
    advice_given: string;
    action_plan: string;
    follow_up_status: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLinks[];
}

export default function ConsultationIndex({ auth, consultations, classes, categories, statuses }: PageProps<{ 
    consultations: PaginatedData<StudentConsultation>,
    classes: AcademicClass[],
    categories: { value: string, label: string }[],
    statuses: { value: string, label: string }[]
}>) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const { data, setData, post, put, delete: destroy, reset, processing, errors } = useForm({
        student_id: '',
        class_id: '',
        category: categories[0]?.value || 'akademik',
        consultation_date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
        subject: '',
        case_description: '',
        discussion_summary: '',
        follow_up_plan: '',
        follow_up_status: statuses[0]?.value || 'pending',
    });

    useEffect(() => {
        if (data.class_id) {
            setLoadingStudents(true);
            axios.get(route('teacher.consultations.students', data.class_id))
                .then(res => {
                    setStudents(res.data);
                    setLoadingStudents(false);
                });
        } else {
            setStudents([]);
        }
    }, [data.class_id]);

    const openCreateModal = () => {
        setIsEdit(false);
        setEditId(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (item: StudentConsultation) => {
        setIsEdit(true);
        setEditId(item.id);
        setData({
            student_id: item.student.id.toString(),
            class_id: item.academic_class.id.toString(),
            category: item.category,
            consultation_date: item.consultation_date.split('T')[0],
            subject: item.subject,
            case_description: item.problem_description,
            discussion_summary: item.advice_given,
            follow_up_plan: item.action_plan,
            follow_up_status: item.follow_up_status,
        });
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && editId) {
            put(route('teacher.consultations.update', editId), {
                onSuccess: () => { setIsModalOpen(false); reset(); }
            });
        } else {
            post(route('teacher.consultations.store'), {
                onSuccess: () => { setIsModalOpen(false); reset(); }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus catatan bimbingan ini?')) {
            destroy(route('teacher.consultations.destroy', id));
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'in_progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Bimbingan Siswa (Guru Wali)</h2>}>
            <Head title="Bimbingan Siswa" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center bg-indigo-600 p-6 rounded-2xl text-white shadow-lg">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Manajemen Bimbingan & Konseling</h3>
                            <p className="opacity-80 text-sm">Catat setiap bimbingan problematika atau prestasi siswa secara berkala.</p>
                        </div>
                        <button 
                            onClick={openCreateModal}
                            className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-md"
                        >
                            <UserPlusIcon className="w-5 h-5" />
                            <span>Input Bimbingan</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
                        {consultations.data.length === 0 ? (
                            <div className="p-20 text-center text-gray-400">
                                <UserGroupIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-lg">Belum ada riwayat bimbingan.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Tanggal</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Siswa / Kelas</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Kategori</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Kasus / Masalah</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Status</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {consultations.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.consultation_date.split('T')[0]}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white">{item.student.name}</div>
                                                    <div className="text-xs text-indigo-500 font-medium">{item.academic_class.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="capitalize px-2 py-0.5 rounded border border-gray-200 text-xs text-gray-600 dark:text-gray-400">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white capitalize">{item.subject}</div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate" title={item.problem_description}>
                                                        {item.problem_description}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(item.follow_up_status)}`}>
                                                        {item.follow_up_status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                                                    <button onClick={() => openEditModal(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><PencilSquareIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="w-5 h-5" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full">
                            <form onSubmit={submit}>
                                <div className="p-6 border-b dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {isEdit ? 'Edit Catatan Bimbingan' : 'Input Catatan Bimbingan Baru'}
                                    </h3>
                                </div>
                                
                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pilih Kelas</label>
                                            <select value={data.class_id} onChange={e => setData('class_id', e.target.value)} disabled={isEdit} required className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm">
                                                <option value="">-- Pilih Kelas --</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pilih Siswa</label>
                                            <select value={data.student_id} onChange={e => setData('student_id', e.target.value)} disabled={isEdit || loadingStudents} required className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm">
                                                <option value="">{loadingStudents ? 'Memuat...' : '-- Pilih Siswa --'}</option>
                                                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal</label>
                                            <input type="date" value={data.consultation_date} onChange={e => setData('consultation_date', e.target.value)} required className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Judul / Perihal Bimbingan</label>
                                        <input type="text" value={data.subject} onChange={e => setData('subject', e.target.value)} required placeholder="Contoh: Kedisiplinan Siswa di Kelas" className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm" />
                                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Kategori Permasalahan</label>
                                            <select value={data.category} onChange={e => setData('category', e.target.value)} required className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm">
                                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status Penanganan</label>
                                            <select value={data.follow_up_status} onChange={e => setData('follow_up_status', e.target.value)} required className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm">
                                                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Deskripsi Kasus / Masalah</label>
                                        <textarea rows={3} value={data.case_description} onChange={e => setData('case_description', e.target.value)} required placeholder="Jelaskan detail permasalahan siswa..." className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"></textarea>
                                        {errors.case_description && <p className="text-red-500 text-xs mt-1">{errors.case_description}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Hasil Konsultasi / Ringkasan</label>
                                        <textarea rows={3} value={data.discussion_summary} onChange={e => setData('discussion_summary', e.target.value)} required placeholder="Tuliskan intisari pembicaraan dengan siswa..." className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rencana Tindak Lanjut</label>
                                        <textarea rows={3} value={data.follow_up_plan} onChange={e => setData('follow_up_plan', e.target.value)} required placeholder="Langkah apa yang akan diambil ke depan?" className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"></textarea>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex flex-row-reverse space-x-reverse space-x-3">
                                    <button type="submit" disabled={processing} className="bg-primary hover:bg-primary-hover text-white px-8 py-2.5 rounded-xl font-bold shadow-sm transition-all">
                                        {processing ? 'Menyimpan...' : 'Simpan Catatan'}
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors">
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
