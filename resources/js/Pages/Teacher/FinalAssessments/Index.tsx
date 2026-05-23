import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React from 'react';
import {
    PlusIcon, PencilSquareIcon, TrashIcon, ArrowDownTrayIcon,
    ClipboardDocumentCheckIcon, FunnelIcon, LockClosedIcon
} from '@heroicons/react/24/outline';

interface Semester { id: number; name: string; is_active: boolean; }
interface AcademicYear { id: number; name: string; semesters: Semester[]; }
interface AcademicClass { id: number; name: string; }
interface Subject { id: number; name: string; }
interface FinalAssessment {
    id: number;
    type: 'ASAS' | 'ASAT';
    academic_class: AcademicClass;
    subject: Subject;
    semester: Semester & { academic_year: AcademicYear };
    scores_count?: number;
    is_editable: boolean;
}
interface PaginationLinks { url: string | null; label: string; active: boolean; }
interface PaginatedData<T> { data: T[]; links: PaginationLinks[]; }

export default function FinalAssessmentIndex({ auth, assessments, academicYears, activeSemester, classes, subjects, filters }: PageProps<{
    assessments: PaginatedData<FinalAssessment>;
    academicYears: AcademicYear[];
    activeSemester: (Semester & { academic_year: AcademicYear }) | null;
    classes: AcademicClass[];
    subjects: Subject[];
    filters: any;
}>) {
    const updateFilter = (key: string, value: string) => {
        router.get(route('teacher.final-assessments.index'), { ...filters, [key]: value }, {
            preserveState: true, preserveScroll: true, replace: true,
        });
    };

    const resetFilters = () => {
        router.get(route('teacher.final-assessments.index'), {}, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus data asesmen ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('teacher.final-assessments.destroy', id));
        }
    };

    const handleExport = (type: 'excel' | 'pdf') => {
        const params = new URLSearchParams(filters);
        window.open(route(`teacher.final-assessments.export.${type}`) + '?' + params.toString(), '_blank');
    };

    // Find selected semester from filter
    const selectedSemesterId = filters.semester_id ? Number(filters.semester_id) : activeSemester?.id;

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Asesmen Akhir (ASAS/ASAT)</h2>}>
            <Head title="Asesmen Akhir" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Kelola nilai <span className="font-bold text-indigo-600 dark:text-indigo-400">ASAS</span> (Asesmen Sumatif Akhir Semester Ganjil) dan
                                <span className="font-bold text-purple-600 dark:text-purple-400"> ASAT</span> (Asesmen Sumatif Akhir Tahun).
                            </p>
                            {activeSemester && (
                                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    ✓ Semester aktif: <strong>{activeSemester.name}</strong> — {activeSemester.academic_year?.name}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleExport('excel')} className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                                <ArrowDownTrayIcon className="w-5 h-5 mr-1.5" /> Excel
                            </button>
                            <button onClick={() => handleExport('pdf')} className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20">
                                <ArrowDownTrayIcon className="w-5 h-5 mr-1.5" /> PDF
                            </button>
                            {activeSemester && (
                                <Link
                                    href={route('teacher.final-assessments.create')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <PlusIcon className="w-5 h-5 mr-1.5" />
                                    Tambah Asesmen
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                            <FunnelIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Filter Data</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">

                            {/* Semester filter: group by academic year */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tahun/Semester</label>
                                <select
                                    value={selectedSemesterId || ''}
                                    onChange={(e) => updateFilter('semester_id', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-indigo-500"
                                >
                                    <option value="">Semua Semester</option>
                                    {academicYears.map((year) => (
                                        <optgroup key={year.id} label={year.name}>
                                            {year.semesters.map((sem) => (
                                                <option key={sem.id} value={sem.id}>
                                                    {sem.name}{sem.is_active ? ' (Aktif)' : ''}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kelas</label>
                                <select
                                    value={filters.academic_class_id || ''}
                                    onChange={(e) => updateFilter('academic_class_id', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-indigo-500"
                                >
                                    <option value="">Semua Kelas</option>
                                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipe</label>
                                <select
                                    value={filters.type || ''}
                                    onChange={(e) => updateFilter('type', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-indigo-500"
                                >
                                    <option value="">ASAS & ASAT</option>
                                    <option value="ASAS">ASAS (Akhir Semester Ganjil)</option>
                                    <option value="ASAT">ASAT (Akhir Tahun)</option>
                                </select>
                            </div>

                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider">Tipe</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider">Mata Pelajaran</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider">Kelas</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider">Semester</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-medium text-gray-900 dark:text-white text-xs uppercase tracking-wider text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {assessments.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                <p>Belum ada data asesmen akhir.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        assessments.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                                        item.type === 'ASAS'
                                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                            : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                    }`}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-sm">
                                                    {item.subject?.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                        {item.academic_class?.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                    {item.semester?.name} — {item.semester?.academic_year?.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.semester?.is_active ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                                                            <LockClosedIcon className="w-3 h-3" /> Arsip
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                                                    {item.semester?.is_active ? (
                                                        <>
                                                            <Link
                                                                href={route('teacher.final-assessments.edit', item.id)}
                                                                className="inline-flex p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
                                                                title="Edit"
                                                            >
                                                                <PencilSquareIcon className="w-5 h-5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="inline-flex p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                                                title="Hapus"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic px-2">Read-only</span>
                                                    )}
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
