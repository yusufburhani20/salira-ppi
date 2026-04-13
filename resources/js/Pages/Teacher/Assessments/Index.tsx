import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface AcademicClass {
    id: number;
    name: string;
}

interface DailyAssessment {
    id: number;
    academic_class: AcademicClass;
    subject: string;
    title: string;
    date: string;
    max_score: number;
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

export default function AssessmentIndex({ auth, assessments }: PageProps<{ assessments: PaginatedData<DailyAssessment> }>) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data penilaian ini?')) {
            destroy(route('teacher.assessments.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Penilaian Harian</h2>}>
            <Head title="Penilaian Harian" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600 dark:text-gray-400">Kelola nilai harian siswa per mata pelajaran dan kelas.</p>
                        <Link 
                            href={route('teacher.assessments.create')}
                            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>Tambah Penilaian</span>
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Tanggal</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Mata Pelajaran</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Judul / Topik</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Kelas</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {assessments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p>Belum ada data penilaian.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        assessments.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                    {item.date.split('T')[0]}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white capitalize">
                                                    {item.subject}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                                    {item.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-md text-xs font-bold">
                                                        {item.academic_class.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                                    <Link 
                                                        href={route('teacher.assessments.edit', item.id)}
                                                        className="inline-flex p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(item.id)}
                                                        className="inline-flex p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {assessments.links.length > 3 && (
                        <div className="flex justify-center mt-6 space-x-1">
                            {assessments.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        link.active 
                                            ? 'bg-primary text-white' 
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
