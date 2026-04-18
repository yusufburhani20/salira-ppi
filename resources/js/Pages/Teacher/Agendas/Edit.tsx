import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { 
    BookOpenIcon, 
    ClipboardDocumentCheckIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Student {
    id: number;
    name: string;
    nisn: string;
}

interface Attendance {
    student_id: number;
    status: string;
    notes?: string;
}

export default function AgendaEdit({ agenda, classes, subjects = [] }: { agenda: any, classes: any[], subjects: any[] }) {
    const { data, setData, put, processing, errors } = useForm({
        academic_class_id: agenda.academic_class_id || '',
        subject_id: agenda.subject_id || '',
        subject: agenda.subject || '',
        lesson_period: agenda.lesson_period || '',
        topic: agenda.topic || '',
        date: agenda.date ? (() => {
            const d = new Date(agenda.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })() : '',
        activities: agenda.activities || '',
        student_tasks: agenda.student_tasks || '',
        attendance: agenda.attendances.map((a: any) => ({
            student_id: a.student_id,
            status: a.status,
            notes: a.notes || ''
        })) as Attendance[],
    });

    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        if (data.academic_class_id) {
            setLoadingStudents(true);
            axios.get(route('teacher.agendas.students', data.academic_class_id))
                .then(res => {
                    const currentStudents = res.data;
                    setStudents(currentStudents);
                    
                    // Always ensure data.attendance contains all currently loaded students.
                    // If we have an existing record for a student, use it. Otherwise, default to 'hadir'.
                    const mergedAttendance = currentStudents.map((s: Student) => {
                        const existing = data.attendance.find(a => a.student_id === s.id);
                        return existing || { student_id: s.id, status: 'hadir', notes: '' };
                    });
                    
                    setData('attendance', mergedAttendance);
                    setLoadingStudents(false);
                })
                .catch(err => {
                    console.error("Failed to fetch students", err);
                    setLoadingStudents(false);
                });
        }
    }, [data.academic_class_id]);

    const handleAttendanceChange = (studentId: number, status: string) => {
        const updated = data.attendance.map(a => 
            a.student_id === studentId ? { ...a, status } : a
        );
        setData('attendance', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('teacher.agendas.update', agenda.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Jurnal Mengajar</h2>}
        >
            <Head title="Edit Jurnal" />
            
            <div className="py-12">
                <form onSubmit={submit} className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex items-center gap-3">
                            <BookOpenIcon className="w-6 h-6 text-indigo-600" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Informasi Pembelajaran</h3>
                        </div>
                        
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Class Selection */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Pilih Kelas</label>
                                <select 
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.academic_class_id}
                                    onChange={e => setData('academic_class_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.academic_class_id && <p className="text-red-500 text-xs mt-1">{errors.academic_class_id}</p>}
                            </div>

                            {/* Date */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Tanggal</label>
                                <input 
                                    type="date"
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                    required
                                />
                                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                            </div>

                            {/* Subject */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Mata Pelajaran</label>
                                <select 
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.subject_id}
                                    onChange={e => setData('subject_id', e.target.value)}
                                    required
                                >
                                    <option value="">-- Pilih Mata Pelajaran --</option>
                                    {subjects.filter((s: any) => data.academic_class_id ? s.academic_classes?.some((ac: any) => ac.id.toString() === data.academic_class_id.toString()) : false).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                {errors.subject_id && <p className="text-red-500 text-xs mt-1">{errors.subject_id}</p>}
                            </div>

                            {/* Lesson Period */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Jam Ke-</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: 1-2"
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.lesson_period}
                                    onChange={e => setData('lesson_period', e.target.value)}
                                    required
                                />
                                {errors.lesson_period && <p className="text-red-500 text-xs mt-1">{errors.lesson_period}</p>}
                            </div>

                            {/* Topic */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Topik Pembelajaran</label>
                                <input 
                                    type="text" 
                                    placeholder="Apa yang dipelajari?"
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.topic}
                                    onChange={e => setData('topic', e.target.value)}
                                    required
                                />
                                {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
                            </div>

                            {/* Activities */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Ringkasan Aktivitas Kelas</label>
                                <textarea 
                                    rows={4}
                                    placeholder="Tuliskan apa saja yang dilakukan di dalam kelas..."
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.activities}
                                    onChange={e => setData('activities', e.target.value)}
                                    required
                                />
                                {errors.activities && <p className="text-red-500 text-xs mt-1">{errors.activities}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Student Attendance Section */}
                    {data.academic_class_id && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[200px]">
                            <div className="p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <ClipboardDocumentCheckIcon className="w-6 h-6 text-emerald-600" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Presensi Siswa</h3>
                                </div>
                                <span className="text-xs font-medium text-slate-500">{loadingStudents ? 'Memuat...' : `Jumlah Siswa: ${students.length}`}</span>
                            </div>

                            {loadingStudents ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                                <th className="px-6 py-3">No</th>
                                                <th className="px-6 py-3">Nama Siswa</th>
                                                <th className="px-6 py-3 text-center">Kehadiran</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {students.map((student, idx) => {
                                                const attItem = data.attendance.find(a => a.student_id === student.id);
                                                return (
                                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{student.name}</div>
                                                            <div className="text-[10px] text-slate-400">NISN: {student.nisn}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center items-center space-x-1.5 sm:space-x-2">
                                                                {['hadir', 'sakit', 'izin', 'alpha'].map(status => (
                                                                    <button
                                                                        key={status}
                                                                        type="button"
                                                                        onClick={() => handleAttendanceChange(student.id, status)}
                                                                        className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border shadow-sm ${
                                                                            attItem?.status === status 
                                                                            ? (status === 'hadir' ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 
                                                                               status === 'sakit' ? 'bg-amber-100 border-amber-500 text-amber-800' :
                                                                               status === 'izin' ? 'bg-blue-100 border-blue-500 text-blue-800' :
                                                                               'bg-rose-100 border-rose-500 text-rose-800')
                                                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-slate-400 hover:border-gray-400'
                                                                        }`}
                                                                    >
                                                                        {status}
                                                                    </button>
                                                                ))}
                                                            </div>
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

                    <div className="flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={() => window.history.back()}
                            className="px-6 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing || !data.academic_class_id}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all active:scale-95"
                        >
                            {processing ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                                <CheckCircleIcon className="w-5 h-5" />
                            )}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
