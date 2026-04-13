import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { ChevronLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

interface AcademicClass {
    id: number;
    name: string;
}

interface Student {
    id: number;
    name: string;
    nisn: string;
    score?: number;
    notes?: string;
}

interface Assessment {
    id: number;
    academic_class_id: number;
    subject: string;
    subject_id: number;
    title: string;
    learning_objective: string | null;
    date: string;
    description: string | null;
}

interface Subject {
    id: number;
    name: string;
}

export default function AssessmentForm({ auth, classes, students: initialStudents, assessment, selectedClassId, subjects = [] }: PageProps<{ 
    classes: AcademicClass[], 
    subjects: Subject[],
    students: Student[], 
    assessment?: Assessment,
    selectedClassId?: number 
}>) {
    const isEdit = !!assessment;

    const { data, setData, post, put, processing, errors } = useForm({
        academic_class_id: assessment?.academic_class_id || selectedClassId || '',
        subject_id: assessment?.subject_id || '',
        title: assessment?.title || '',
        learning_objective: assessment?.learning_objective || '',
        date: assessment?.date ? (() => {
            const d = new Date(assessment.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })() : new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
        description: assessment?.description || '',
        scores: initialStudents.map(s => ({
            student_id: s.id,
            name: s.name,
            nisn: s.nisn,
            score: s.score || 0,
            notes: s.notes || ''
        }))
    });

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setData('academic_class_id', id);
        if (!isEdit && id) {
            // Redirect to the same create page with class_id param to fetch students
            window.location.href = route('teacher.assessments.create', { class_id: id });
        }
    };

    const handleScoreChange = (index: number, value: string) => {
        const newScores = [...data.scores];
        newScores[index].score = parseFloat(value) || 0;
        setData('scores', newScores);
    };

    const handleNoteChange = (index: number, value: string) => {
        const newScores = [...data.scores];
        newScores[index].notes = value;
        setData('scores', newScores);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('teacher.assessments.update', assessment.id));
        } else {
            post(route('teacher.assessments.store'));
        }
    };

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center space-x-4">
                <Link href={route('teacher.assessments.index')} className="text-gray-500 hover:text-gray-700">
                    <ChevronLeftIcon className="w-5 h-5" />
                </Link>
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {isEdit ? 'Edit Penilaian' : 'Tambah Penilaian Baru'}
                </h2>
            </div>
        }>
            <Head title={isEdit ? 'Edit Penilaian' : 'Tambah Penilaian'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Informasi Penilaian</h3>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Kelas</label>
                                    <select 
                                        value={data.academic_class_id} 
                                        onChange={handleClassChange}
                                        disabled={isEdit}
                                        required
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">-- Pilih Kelas --</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.academic_class_id && <p className="text-red-500 text-xs mt-1">{errors.academic_class_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mata Pelajaran</label>
                                    <select 
                                        value={data.subject_id} 
                                        onChange={e => setData('subject_id', e.target.value)}
                                        required
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"
                                    >
                                        <option value="">Pilih Mata Pelajaran</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>{subject.name}</option>
                                        ))}
                                    </select>
                                    {errors.subject_id && <p className="text-red-500 text-xs mt-1">{errors.subject_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul / Topik Penilaian</label>
                                    <input 
                                        type="text" 
                                        value={data.title} 
                                        onChange={e => setData('title', e.target.value)} 
                                        required 
                                        placeholder="Contoh: Ulangan Harian Bab 1"
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                                    <input 
                                        type="date" 
                                        value={data.date} 
                                        onChange={e => setData('date', e.target.value)} 
                                        required 
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"
                                    />
                                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                                </div>
                            </div>
                            <div className="px-6 pb-6 pt-0">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tujuan Pembelajaran</label>
                                <textarea 
                                    rows={2} 
                                    value={data.learning_objective} 
                                    onChange={e => setData('learning_objective', e.target.value)} 
                                    placeholder="Contoh: Siswa mampu menganalisis struktur sosial masyarakat..."
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"
                                ></textarea>
                                {errors.learning_objective && <p className="text-red-500 text-xs mt-1">{errors.learning_objective}</p>}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Input Nilai Siswa (Skala 0-100)</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white w-16">No</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Nama Siswa</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">NISN</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white w-32">Nilai</th>
                                            <th className="px-6 py-4 font-medium text-gray-900 dark:text-white">Catatan (Opsional)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {data.scores.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                                    Silakan pilih kelas terlebih dahulu untuk memuat daftar siswa.
                                                </td>
                                            </tr>
                                        ) : (
                                            data.scores.map((score, index) => (
                                                <tr key={score.student_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                                                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{score.name}</td>
                                                    <td className="px-6 py-4 text-xs text-gray-500 font-mono italic">{score.nisn}</td>
                                                    <td className="px-6 py-4">
                                                        <input 
                                                            type="number" 
                                                            min="0" 
                                                            max="100" 
                                                            step="0.01"
                                                            value={score.score} 
                                                            onChange={e => handleScoreChange(index, e.target.value)}
                                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input 
                                                            type="text" 
                                                            value={score.notes} 
                                                            onChange={e => handleNoteChange(index, e.target.value)}
                                                            placeholder="Misal: Remedial, Juara 1, dll."
                                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-primary focus:ring-primary shadow-sm"
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Link href={route('teacher.assessments.index')} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                                Batal
                            </Link>
                            <button 
                                type="submit" 
                                disabled={processing || data.scores.length === 0}
                                className="bg-primary hover:bg-primary-hover text-white px-8 py-2 rounded-lg font-bold shadow-sm transition-all disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Penilaian'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
