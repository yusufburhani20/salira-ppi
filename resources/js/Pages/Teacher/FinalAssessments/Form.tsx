import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface Semester { id: number; name: string; is_active: boolean; }
interface AcademicYear { id: number; name: string; }
interface AcademicClass { id: number; name: string; }
interface Subject { id: number; name: string; academic_classes?: { id: number }[]; }
interface Student { id: number; name: string; nisn?: string; score?: number; notes?: string; }

interface FinalAssessment {
    id: number;
    type: 'ASAS' | 'ASAT';
    academic_class_id: number;
    subject_id: number;
    description: string | null;
    scores: { student_id: number; score: number; notes?: string }[];
}

interface ScoreRow {
    student_id: number;
    name: string;
    nisn?: string;
    score: string;
    notes: string;
    attendance_percentage: number;
    attitude_score: string;
    interest_score: string;
    character_score?: number;
}

export default function FinalAssessmentForm({ auth, assessment, activeSemester, allowedTypes, classes, subjects, students, selectedClassId }: PageProps<{
    assessment?: FinalAssessment;
    activeSemester: Semester & { academic_year: AcademicYear };
    allowedTypes: string[];
    classes: AcademicClass[];
    subjects: Subject[];
    students: Student[];
    selectedClassId?: string;
}>) {
    const isEditing = !!assessment;

    const { data, setData, post, put, processing, errors } = useForm({
        academic_class_id: assessment?.academic_class_id?.toString() ?? selectedClassId ?? '',
        subject_id: assessment?.subject_id?.toString() ?? '',
        type: assessment?.type ?? (allowedTypes[0] ?? 'ASAS'),
        description: assessment?.description ?? '',
        scores: [] as ScoreRow[],
    });

    const [loadingStudents, setLoadingStudents] = useState(false);

    // Initialize score rows from students prop
    useEffect(() => {
        if (students && students.length > 0) {
            const rows: ScoreRow[] = students.map((s) => ({
                student_id: s.id,
                name: s.name,
                nisn: s.nisn,
                score: s.score !== undefined ? String(s.score) : '',
                notes: s.notes ?? '',
                attendance_percentage: (s as any).attendance_percentage ?? 100,
                attitude_score: (s as any).attitude_score !== undefined ? String((s as any).attitude_score) : '',
                interest_score: (s as any).interest_score !== undefined ? String((s as any).interest_score) : '',
                character_score: (s as any).character_score,
            }));
            setData('scores', rows);
        }
    }, []);

    const fetchStudents = async (classId: string, subjectId: string) => {
        if (!classId || !subjectId) {
            setData('scores', []);
            return;
        }
        setLoadingStudents(true);
        try {
            const resp = await fetch(route('teacher.final-assessments.students', classId) + `?subject_id=${subjectId}`);
            const data: Student[] = await resp.json();
            const rows: ScoreRow[] = data.map((s) => ({
                student_id: s.id,
                name: s.name,
                nisn: s.nisn,
                score: '',
                notes: '',
                attendance_percentage: (s as any).attendance_percentage ?? 100,
                attitude_score: '',
                interest_score: '',
            }));
            setData('scores', rows);
        } catch {
            console.error('Failed to fetch students');
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleClassChange = (classId: string) => {
        setData('academic_class_id', classId);
        if (!isEditing) fetchStudents(classId, data.subject_id);
    };

    const handleSubjectChange = (subjectId: string) => {
        setData('subject_id', subjectId);
        if (!isEditing) fetchStudents(data.academic_class_id, subjectId);
    };

    const updateScore = (index: number, field: keyof ScoreRow, value: string) => {
        const updated = [...data.scores];
        updated[index] = { ...updated[index], [field]: value } as ScoreRow;
        setData('scores', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            scores: data.scores.map((s) => ({
                student_id: s.student_id,
                score: s.score,
                notes: s.notes,
                attendance_percentage: s.attendance_percentage,
                attitude_score: s.attitude_score,
                interest_score: s.interest_score,
            })),
        };
        if (isEditing) {
            router.put(route('teacher.final-assessments.update', assessment!.id), payload);
        } else {
            router.post(route('teacher.final-assessments.store'), payload);
        }
    };

    const typeLabel = {
        ASAS: 'ASAS — Asesmen Sumatif Akhir Semester',
        ASAT: 'ASAT — Asesmen Sumatif Akhir Tahun',
    };

    const allFilled = data.scores.length > 0 && data.scores.every(
        (s) => s.score !== '' && s.attitude_score !== '' && s.interest_score !== ''
    );

    return (
        <AuthenticatedLayout header={
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {isEditing ? 'Edit' : 'Tambah'} Asesmen Akhir
            </h2>
        }>
            <Head title={`${isEditing ? 'Edit' : 'Tambah'} Asesmen Akhir`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Semester Badge */}
                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-2xl px-5 py-3">
                        <AcademicCapIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                Semester Aktif: {activeSemester.name} — {activeSemester.academic_year?.name}
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-500">
                                Data yang diinput akan tersimpan untuk semester ini.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">

                            {/* Type selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                    Tipe Asesmen <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {allowedTypes.map((t) => (
                                        <label key={t} className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                                            data.type === t
                                                ? t === 'ASAS'
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="type"
                                                value={t}
                                                checked={data.type === t}
                                                onChange={() => setData('type', t as any)}
                                                disabled={isEditing}
                                                className="hidden"
                                            />
                                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                data.type === t
                                                    ? t === 'ASAS' ? 'border-indigo-500' : 'border-purple-500'
                                                    : 'border-gray-300'
                                            }`}>
                                                {data.type === t && (
                                                    <span className={`w-2 h-2 rounded-full ${t === 'ASAS' ? 'bg-indigo-500' : 'bg-purple-500'}`} />
                                                )}
                                            </span>
                                            <div>
                                                <p className={`font-bold text-sm ${
                                                    data.type === t
                                                        ? t === 'ASAS' ? 'text-indigo-700 dark:text-indigo-400' : 'text-purple-700 dark:text-purple-400'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                }`}>{t}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {t === 'ASAS' ? 'Akhir Semester Ganjil' : 'Akhir Tahun Ajaran'}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Class */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Kelas <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.academic_class_id}
                                        onChange={(e) => handleClassChange(e.target.value)}
                                        disabled={isEditing}
                                        className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-indigo-500 disabled:opacity-60"
                                    >
                                        <option value="">— Pilih Kelas —</option>
                                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    {errors.academic_class_id && <p className="mt-1 text-sm text-red-600">{errors.academic_class_id}</p>}
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Mata Pelajaran <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) => handleSubjectChange(e.target.value)}
                                        disabled={isEditing}
                                        className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-indigo-500 disabled:opacity-60"
                                    >
                                        <option value="">— Pilih Mata Pelajaran —</option>
                                        {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {errors.subject_id && <p className="mt-1 text-sm text-red-600">{errors.subject_id}</p>}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Catatan (opsional)</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={2}
                                    placeholder="Catatan atau keterangan asesmen..."
                                    className="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Score Input Table */}
                        {(data.scores.length > 0 || loadingStudents) && (
                            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="w-5 h-5 text-indigo-500" />
                                        <h3 className="font-bold text-gray-900 dark:text-white">Input Nilai Siswa</h3>
                                        <span className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-0.5 rounded-full font-bold">
                                            {data.scores.length} siswa
                                        </span>
                                    </div>
                                    {data.scores.length > 0 && (
                                        <span className={`text-xs font-semibold ${allFilled ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {data.scores.filter(s => s.score !== '').length}/{data.scores.length} terisi
                                        </span>
                                    )}
                                </div>

                                {loadingStudents ? (
                                    <div className="py-10 text-center text-gray-400">
                                        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
                                        <p className="text-sm">Memuat data siswa...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                                    <th className="px-4 py-3 text-center w-12">#</th>
                                                    <th className="px-4 py-3 w-48">Nama Siswa</th>
                                                    <th className="px-4 py-3 text-center w-32 font-black text-indigo-600 dark:text-indigo-400">Kehadiran (60%)</th>
                                                    <th className="px-4 py-3 text-center w-28">ASAS/ASAT <span className="text-red-500">*</span></th>
                                                    <th className="px-4 py-3 text-center w-28">Sikap (20%) <span className="text-red-500">*</span></th>
                                                    <th className="px-4 py-3 text-center w-28">Minat (20%) <span className="text-red-500">*</span></th>
                                                    <th className="px-4 py-3 text-center w-24 text-indigo-600 dark:text-indigo-400">Nilai Akhlak</th>
                                                    <th className="px-4 py-3">Catatan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {data.scores.map((s, i) => {
                                                    const attPct = s.attendance_percentage ?? 100;
                                                    const attitude = s.attitude_score !== '' ? Number(s.attitude_score) : null;
                                                    const interest = s.interest_score !== '' ? Number(s.interest_score) : null;
                                                    
                                                    const calculatedAkhlak = (attitude !== null && interest !== null)
                                                        ? Math.round((attPct * 0.60) + (attitude * 0.20) + (interest * 0.20))
                                                        : '—';

                                                    let attBadgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
                                                    if (attPct < 75) {
                                                        attBadgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20';
                                                    } else if (attPct < 90) {
                                                        attBadgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
                                                    }

                                                    return (
                                                        <tr key={s.student_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                                            <td className="px-4 py-3 text-center text-xs text-gray-400">{i + 1}</td>
                                                            <td className="px-4 py-3">
                                                                <p className="font-bold text-gray-900 dark:text-white leading-tight">{s.name}</p>
                                                                <p className="text-[10px] text-gray-400">NISN: {s.nisn || '—'}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${attBadgeColor}`}>
                                                                    {attPct}%
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={s.score}
                                                                    onChange={(e) => updateScore(i, 'score', e.target.value)}
                                                                    className={`w-20 rounded-xl border text-sm text-center font-bold focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 ${
                                                                        s.score === ''
                                                                            ? 'border-amber-300 dark:border-amber-600'
                                                                            : 'border-gray-300 dark:border-gray-700'
                                                                    }`}
                                                                    placeholder="—"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={s.attitude_score}
                                                                    onChange={(e) => updateScore(i, 'attitude_score', e.target.value)}
                                                                    className={`w-20 rounded-xl border text-sm text-center font-bold focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 ${
                                                                        s.attitude_score === ''
                                                                            ? 'border-amber-300 dark:border-amber-600'
                                                                            : 'border-gray-300 dark:border-gray-700'
                                                                    }`}
                                                                    placeholder="—"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={s.interest_score}
                                                                    onChange={(e) => updateScore(i, 'interest_score', e.target.value)}
                                                                    className={`w-20 rounded-xl border text-sm text-center font-bold focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 ${
                                                                        s.interest_score === ''
                                                                            ? 'border-amber-300 dark:border-amber-600'
                                                                            : 'border-gray-300 dark:border-gray-700'
                                                                    }`}
                                                                    placeholder="—"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`text-sm font-black ${calculatedAkhlak !== '—' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                                                                    {calculatedAkhlak}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    value={s.notes}
                                                                    onChange={(e) => updateScore(i, 'notes', e.target.value)}
                                                                    className="w-full rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                                                                    placeholder="Catatan..."
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* No class selected hint */}
                        {!isEditing && data.scores.length === 0 && !loadingStudents && data.academic_class_id === '' && (
                            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-2xl px-5 py-4 text-sm text-blue-700 dark:text-blue-300">
                                👆 Pilih kelas terlebih dahulu untuk menampilkan daftar siswa.
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-3">
                            <a
                                href={route('teacher.final-assessments.index')}
                                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Batal
                            </a>
                            <button
                                type="submit"
                                disabled={processing || data.scores.length === 0 || !allFilled}
                                className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Menyimpan...' : isEditing ? 'Perbarui Asesmen' : 'Simpan Asesmen'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
