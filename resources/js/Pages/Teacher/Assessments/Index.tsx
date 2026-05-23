import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React from 'react';
import { PlusIcon, PencilSquareIcon, TrashIcon, ClipboardDocumentCheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface AcademicClass {
    id: number;
    name: string;
}

interface Subject {
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

export default function AssessmentIndex({ auth, assessments, classes, subjects, filters }: PageProps<{ 
    assessments: PaginatedData<DailyAssessment>,
    classes: AcademicClass[],
    subjects: Subject[],
    filters: any
}>) {
    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data asesmen ini?')) {
            destroy(route('teacher.assessments.destroy', id));
        }
    };

    const handleExport = (type: 'excel' | 'pdf') => {
        const params = new URLSearchParams(filters);
        window.open(route(`teacher.assessments.export.${type}`) + '?' + params.toString(), '_blank');
    };

    const updateFilter = (key: string, value: string) => {
        router.get(route('teacher.assessments.index'), {
            ...filters,
            [key]: value
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const resetFilters = () => {
        router.get(route('teacher.assessments.index'), {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Asesmen Harian</h2>}>
            <Head title="Asesmen Harian" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                        <p className="text-gray-600 dark:text-gray-400">Kelola nilai harian siswa per mata pelajaran dan kelas.</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleExport('excel')}
                                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5 mr-1.5" />
                                Excel
                            </button>
                            <button
                                onClick={() => handleExport('pdf')}
                                className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5 mr-1.5" />
                                PDF
                            </button>
                            <Link 
                                href={route('teacher.assessments.create')}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <PlusIcon className="w-5 h-5 mr-1.5" />
                                <span>Tambah Asesmen</span>
                            </Link>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kelas</label>
                                <select 
                                    value={filters.academic_class_id || ''}
                                    onChange={(e) => updateFilter('academic_class_id', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-indigo-500"
                                >
                                    <option value="">Semua Kelas</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mata Pelajaran</label>
                                <select 
                                    value={filters.subject_id || ''}
                                    onChange={(e) => updateFilter('subject_id', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-indigo-500"
                                >
                                    <option value="">Semua Mapel</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dari</label>
                                <input 
                                    type="date"
                                    value={filters.start_date || ''}
                                    onChange={(e) => updateFilter('start_date', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sampai</label>
                                <input 
                                    type="date"
                                    value={filters.end_date || ''}
                                    onChange={(e) => updateFilter('end_date', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-indigo-500"
                                />
                            </div>
                            <button 
                                onClick={resetFilters}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider">Mata Pelajaran</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider">Judul / Topik</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider">Kelas</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {assessments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p>Belum ada data asesmen.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        assessments.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-sm">
                                                    {item.date.split('T')[0]}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white capitalize text-sm">
                                                    {item.subject}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                                                    {item.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                        {item.academic_class.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                                                    <Link 
                                                        href={route('teacher.assessments.edit', item.id)}
                                                        className="inline-flex p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(item.id)}
                                                        className="inline-flex p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
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
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        link.active 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
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
