import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ArrowLeftIcon,
    CameraIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const attendanceStatuses = [
    { value: 'hadir', label: 'Hadir', color: 'bg-emerald-500 text-white' },
    { value: 'izin', label: 'Izin', color: 'bg-blue-500 text-white' },
    { value: 'sakit', label: 'Sakit', color: 'bg-amber-500 text-white' },
    { value: 'alpha', label: 'Alpha', color: 'bg-red-500 text-white' },
    { value: 'terlambat', label: 'Telat', color: 'bg-indigo-500 text-white' },
];

export default function Form({ classes, isEdit, eveningStudy }: any) {
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentsList, setStudentsList] = useState<any[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        eveningStudy?.photo_url || null
    );

    const { data, setData, post, processing, errors } = useForm({
        date: eveningStudy?.date || new Date().toISOString().split('T')[0],
        academic_class_id: eveningStudy?.academic_class_id || '',
        activity_name: eveningStudy?.activity_name || '',
        notes: eveningStudy?.notes || '',
        photo: null as File | null,
        attendance: [] as any[],
        // Simulate PUT method for file uploads in edit mode
        _method: isEdit ? 'PUT' : 'POST',
    });

    // Fetch students list when class changes
    useEffect(() => {
        if (!data.academic_class_id) {
            setStudentsList([]);
            setData('attendance', []);
            return;
        }

        setLoadingStudents(true);
        axios
            .get(
                route('teacher.evening-studies.students', data.academic_class_id) +
                    `?date=${data.date}` +
                    (isEdit ? `&edit_id=${eveningStudy.id}` : '')
            )
            .then((res) => {
                setStudentsList(res.data);
                
                // Initialize form attendance data
                const initialAtt = res.data.map((student: any) => ({
                    student_id: student.id,
                    name: student.name,
                    status: student.current_status || 'hadir',
                    notes: student.notes || '',
                }));
                setData('attendance', initialAtt);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setLoadingStudents(false);
            });
    }, [data.academic_class_id, data.date]);

    const handleStatusChange = (studentId: number, status: string) => {
        const updated = data.attendance.map((item) =>
            item.student_id === studentId ? { ...item, status } : item
        );
        setData('attendance', updated);
    };

    const handleNotesChange = (studentId: number, notes: string) => {
        const updated = data.attendance.map((item) =>
            item.student_id === studentId ? { ...item, notes } : item
        );
        setData('attendance', updated);
    };

    const markAllStatus = (status: string) => {
        const updated = data.attendance.map((item) => ({
            ...item,
            status,
        }));
        setData('attendance', updated);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            // For file uploads in Laravel updates, we do a POST request with _method: PUT
            post(route('teacher.evening-studies.update', eveningStudy.id));
        } else {
            post(route('teacher.evening-studies.store'));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('teacher.evening-studies.index')}
                        className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Link>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                            {isEdit ? 'Edit Catatan Belajar Malam' : 'Catat Belajar Malam'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Isi laporan kegiatan malam dan kelola daftar presensi santri
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={isEdit ? 'Edit Belajar Malam' : 'Catat Belajar Malam'} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Form Details */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-6 space-y-4 h-fit">
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60 pb-2">
                            Detail Kegiatan
                        </h3>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                Tanggal *
                            </label>
                            <input
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                Kelas *
                            </label>
                            <select
                                value={data.academic_class_id}
                                onChange={(e) => setData('academic_class_id', e.target.value)}
                                className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                                disabled={isEdit}
                            >
                                <option value="">Pilih Kelas</option>
                                {classes.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {errors.academic_class_id && <p className="text-xs text-red-500 mt-1">{errors.academic_class_id}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                Nama Kegiatan / Materi *
                            </label>
                            <input
                                value={data.activity_name}
                                onChange={(e) => setData('activity_name', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="mis: Setoran Tahfidz / Kajian Kitab / Tugas"
                                required
                            />
                            {errors.activity_name && <p className="text-xs text-red-500 mt-1">{errors.activity_name}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                Catatan Pengawas
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                rows={3}
                                placeholder="Tuliskan catatan khusus terkait ketertiban santri..."
                            />
                            {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                Foto Dokumentasi {!isEdit && '*'}
                            </label>
                            <div className="mt-1 flex flex-col gap-3">
                                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer">
                                    <CameraIcon className="w-4 h-4" />
                                    <span>Pilih / Ambil Foto</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        required={!isEdit}
                                    />
                                </label>
                                {previewUrl && (
                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 aspect-video">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                            {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
                        </div>
                    </div>

                    {/* Right Column: Student Attendance Checklist */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                                Daftar Absensi Santri
                            </h3>
                            {data.attendance.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    <button
                                        type="button"
                                        onClick={() => markAllStatus('hadir')}
                                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                    >
                                        Hadir Semua
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => markAllStatus('izin')}
                                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                    >
                                        Izin Semua
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => markAllStatus('alpha')}
                                        className="px-2 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                    >
                                        Alpha Semua
                                    </button>
                                </div>
                            )}
                        </div>

                        {loadingStudents ? (
                            <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-2">
                                <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-500" />
                                <p className="text-xs font-bold">Memuat daftar santri...</p>
                            </div>
                        ) : !data.academic_class_id ? (
                            <div className="text-center py-16 text-slate-400 italic text-xs">
                                Pilih kelas terlebih dahulu untuk melihat daftar santri
                            </div>
                        ) : data.attendance.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 italic text-xs">
                                Tidak ada santri terdaftar di kelas ini
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                                {data.attendance.map((att: any) => {
                                    return (
                                        <div
                                            key={att.student_id}
                                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">
                                                    {att.name}
                                                </p>
                                                {att.notes && att.notes.includes('Auto-sync') ? (
                                                    <p className="text-[10px] text-indigo-500 font-semibold flex items-center gap-1 mt-0.5">
                                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                                        {att.notes}
                                                    </p>
                                                ) : att.notes ? (
                                                    <p className="text-[10px] text-slate-400 italic mt-0.5">
                                                        Ket: {att.notes}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="flex flex-wrap sm:flex-nowrap gap-1 items-center shrink-0 w-full sm:w-auto">
                                                <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
                                                    {attendanceStatuses.map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => handleStatusChange(att.student_id, opt.value)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                                att.status === opt.value
                                                                    ? opt.color
                                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={att.notes || ''}
                                                    onChange={(e) => handleNotesChange(att.student_id, e.target.value)}
                                                    placeholder="Keterangan..."
                                                    className="w-full sm:w-32 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4">
                    <Link
                        href={route('teacher.evening-studies.index')}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={processing || loadingStudents || data.attendance.length === 0}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Jurnal & Absensi'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
