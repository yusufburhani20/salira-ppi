import React, { useState, useEffect, useRef } from 'react';
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

export default function AgendaEdit({ agenda, classes, subjects = [], lesson_hours = [] }: { agenda: any, classes: any[], subjects: any[], lesson_hours: any }) {
    const { data, setData, put, processing, errors } = useForm({
        academic_class_id: agenda.academic_class_id || '',
        subject_id: agenda.subject_id || '',
        subject: agenda.subject || '',
        lesson_period: agenda.lesson_period || '',
        topic: agenda.topic || '',
        date: agenda.date ? agenda.date.substring(0, 10) : '',
        activities: agenda.activities || '',
        learning_model: agenda.learning_model || '',
        learning_media: agenda.learning_media || '',
        student_tasks: agenda.student_tasks || '',
        attendance: agenda.attendances.map((a: any) => ({
            student_id: a.student_id,
            status: a.status,
            notes: a.notes || ''
        })) as Attendance[],
    });

    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const [bookedPeriods, setBookedPeriods] = useState<any[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [slotsForDay, setSlotsForDay] = useState<any[]>([]);
    const [isManualPeriod, setIsManualPeriod] = useState<boolean>(false);

    const daysEng = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (data.date) {
            const dateObj = new Date(data.date + 'T00:00:00');
            const dayName = daysEng[dateObj.getDay()];
            const daySlots = lesson_hours[dayName] || [];
            setSlotsForDay(daySlots);

            if (isFirstRender.current) {
                // Determine if the saved lesson_period is manual or matches the configuration
                const parsedLabels = (() => {
                    if (!agenda.lesson_period) return [];
                    const parts = agenda.lesson_period.split('(');
                    const labelsPart = parts[0];
                    return labelsPart.split(',').map((lbl: string) => lbl.trim()).filter(Boolean);
                })();

                const allLabelsExist = parsedLabels.length > 0 && parsedLabels.every((label: string) => 
                    daySlots.some((s: any) => s.label === label)
                );

                if (allLabelsExist) {
                    setSelectedSlots(parsedLabels);
                    setIsManualPeriod(false);
                } else {
                    setSelectedSlots([]);
                    setIsManualPeriod(true);
                }
                isFirstRender.current = false;
            } else {
                setSelectedSlots([]);
                setIsManualPeriod(false);
            }
        } else {
            setSlotsForDay([]);
            if (!isFirstRender.current) {
                setSelectedSlots([]);
                setIsManualPeriod(false);
            }
        }
    }, [data.date, lesson_hours]);

    useEffect(() => {
        if (data.academic_class_id && data.date) {
            axios.get(route('teacher.agendas.booked-periods'), {
                params: {
                    academic_class_id: data.academic_class_id,
                    date: data.date,
                    exclude_agenda_id: agenda.id
                }
            })
                .then(res => {
                    setBookedPeriods(res.data);
                })
                .catch(err => {
                    console.error("Failed to fetch booked periods", err);
                });
        } else {
            setBookedPeriods([]);
        }
    }, [data.academic_class_id, data.date]);

    useEffect(() => {
        if (isManualPeriod) return;

        if (selectedSlots.length === 0) {
            setData('lesson_period', '');
            return;
        }

        const sortedSlots = [...selectedSlots].sort((a, b) => {
            const idxA = slotsForDay.findIndex((h: any) => h.label === a);
            const idxB = slotsForDay.findIndex((h: any) => h.label === b);
            return idxA - idxB;
        });

        const times = sortedSlots.map(label => {
            const hour = slotsForDay.find((h: any) => h.label === label);
            return hour ? { start: hour.start, end: hour.end } : null;
        }).filter(Boolean);

        let timeRangeStr = '';
        if (times.length > 0) {
            const starts = times.map(t => t!.start).sort();
            const ends = times.map(t => t!.end).sort();
            const startTime = starts[0];
            const endTime = ends[ends.length - 1];
            timeRangeStr = ` (${startTime} - ${endTime})`;
        }

        setData('lesson_period', sortedSlots.join(', ') + timeRangeStr);
    }, [selectedSlots, slotsForDay, isManualPeriod]);

    const getSlotBookingInfo = (label: string) => {
        for (const agendaItem of bookedPeriods) {
            if (!agendaItem.lesson_period) continue;
            const parts = agendaItem.lesson_period.split('(');
            const labelsPart = parts[0];
            const labels = labelsPart.split(',').map((lbl: string) => lbl.trim());
            if (labels.includes(label)) {
                return agendaItem;
            }
        }
        return null;
    };

    useEffect(() => {
        if (data.academic_class_id) {
            setLoadingStudents(true);
            axios.get(route('teacher.agendas.students', data.academic_class_id), {
                params: {
                    date: data.date,
                    agenda_id: agenda.id
                }
            })
                .then(res => {
                    const currentStudents = res.data;
                    setStudents(currentStudents);
                    
                    const initialAttendance = currentStudents.map((s: any) => ({
                        student_id: s.id,
                        status: s.current_status || 'hadir',
                        notes: ''
                    }));
                    
                    setData('attendance', initialAttendance);
                    setLoadingStudents(false);
                })
                .catch(err => {
                    console.error("Failed to fetch students", err);
                    setLoadingStudents(false);
                });
        } else {
            setStudents([]);
            setData('attendance', []);
        }
    }, [data.academic_class_id, data.date]);

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
                             {isManualPeriod ? (
                                 <div className="space-y-1">
                                     <div className="flex justify-between items-center px-1">
                                         <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Jam Ke- (Input Manual)</label>
                                         <button 
                                             type="button" 
                                             onClick={() => setIsManualPeriod(false)}
                                             className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                         >
                                             Kembali ke Pilihan Jam
                                         </button>
                                     </div>
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
                             ) : slotsForDay.length === 0 ? (
                                 <div className="md:col-span-2 p-6 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-center space-y-2">
                                     <svg className="w-8 h-8 text-amber-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                     <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Jadwal Jam Pelajaran Kosong / Hari Libur</h4>
                                     <p className="text-xs text-amber-700 dark:text-amber-500">Hari yang dipilih tidak memiliki konfigurasi jam pelajaran aktif.</p>
                                     <button
                                         type="button"
                                         onClick={() => {
                                             setData('lesson_period', '');
                                             setIsManualPeriod(true);
                                         }}
                                         className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                                     >
                                         Klik di sini untuk menulis jam pelajaran secara manual
                                     </button>
                                 </div>
                             ) : (
                                 <div className="md:col-span-2 space-y-2">
                                     <div className="flex justify-between items-center px-1">
                                         <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Jam Pelajaran</label>
                                         <button 
                                             type="button" 
                                             onClick={() => {
                                                 setData('lesson_period', '');
                                                 setIsManualPeriod(true);
                                             }}
                                             className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                                         >
                                             Input Manual
                                         </button>
                                     </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                         {slotsForDay.map((hour: any, idx: number) => {
                                             const booking = getSlotBookingInfo(hour.label);
                                             const isBooked = !!booking;
                                             const isSelected = selectedSlots.includes(hour.label);
                                             
                                             return (
                                                 <div 
                                                     key={idx}
                                                     onClick={() => {
                                                         if (isBooked) return;
                                                         if (isSelected) {
                                                             setSelectedSlots(selectedSlots.filter(s => s !== hour.label));
                                                         } else {
                                                             setSelectedSlots([...selectedSlots, hour.label]);
                                                         }
                                                     }}
                                                     className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between h-20 ${
                                                         isBooked 
                                                         ? 'bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 cursor-not-allowed opacity-60' 
                                                         : isSelected 
                                                         ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-500/20' 
                                                         : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                                                     }`}
                                                 >
                                                     <div className="flex justify-between items-start">
                                                         <span className="text-xs font-bold">{hour.label}</span>
                                                         {isBooked ? (
                                                             <span className="text-[8px] bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 px-1.5 py-0.5 rounded font-black uppercase">Terisi</span>
                                                         ) : (
                                                             <input 
                                                                 type="checkbox" 
                                                                 checked={isSelected}
                                                                 readOnly
                                                                 className="rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500"
                                                             />
                                                         )}
                                                     </div>
                                                     <div className="flex flex-col mt-1">
                                                         <span className="text-[10px] text-gray-400 font-mono">{hour.start} - {hour.end}</span>
                                                         {isBooked && booking && (
                                                             <span className="text-[9px] text-red-500 truncate mt-0.5" title={`${booking.teacher?.name} - ${booking.subject?.name}`}>
                                                                 {booking.teacher?.name} ({booking.subject?.name})
                                                             </span>
                                                         )}
                                                     </div>
                                                 </div>
                                             );
                                         })}
                                     </div>
                                     {errors.lesson_period && <p className="text-red-500 text-xs mt-1">{errors.lesson_period}</p>}
                                 </div>
                             )}

                            {/* Topic */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Tujuan Pembelajaran</label>
                                <input 
                                    type="text" 
                                    placeholder="Apa tujuan pembelajaran hari ini?"
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.topic}
                                    onChange={e => setData('topic', e.target.value)}
                                    required
                                />
                                {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
                            </div>

                            {/* Model & Media Pembelajaran */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Model &amp; Media Pembelajaran</label>
                                <textarea 
                                    rows={3}
                                    placeholder="Tuliskan model dan media pembelajaran yang digunakan..."
                                    className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                    value={data.learning_model}
                                    onChange={e => setData('learning_model', e.target.value)}
                                />
                                {errors.learning_model && <p className="text-red-500 text-xs mt-1">{errors.learning_model}</p>}
                            </div>

                            {/* Activities */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Laporan Perkembangan Siswa</label>
                                <textarea 
                                    rows={4}
                                    placeholder="Tuliskan laporan perkembangan siswa..."
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
