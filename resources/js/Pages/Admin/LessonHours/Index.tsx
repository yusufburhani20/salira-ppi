import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { ClockIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface LessonHourSlot {
    label: string;
    start: string;
    end: string;
}

interface LessonHoursMap {
    [key: string]: LessonHourSlot[];
}

interface PageProps {
    auth: any;
    lesson_hours: LessonHoursMap;
}

const DAYS = [
    { key: 'monday', label: 'Senin' },
    { key: 'tuesday', label: 'Selasa' },
    { key: 'wednesday', label: 'Rabu' },
    { key: 'thursday', label: 'Kamis' },
    { key: 'friday', label: 'Jumat' },
    { key: 'saturday', label: 'Sabtu' },
    { key: 'sunday', label: 'Minggu' },
];

export default function LessonHourIndex({ auth, lesson_hours }: PageProps) {
    const [activeDay, setActiveDay] = useState<string>('monday');
    const [showCopyDropdown, setShowCopyDropdown] = useState<boolean>(false);

    // Initialize map with all days empty if missing
    const initialMap: LessonHoursMap = {};
    DAYS.forEach(d => {
        initialMap[d.key] = lesson_hours[d.key] || [];
    });

    const { data, setData, post, processing, errors } = useForm({
        lesson_hours: initialMap
    });

    const currentSlots = data.lesson_hours[activeDay] || [];

    const updateActiveDaySlots = (updatedSlots: LessonHourSlot[]) => {
        setData('lesson_hours', {
            ...data.lesson_hours,
            [activeDay]: updatedSlots
        });
    };

    const addSlot = () => {
        const slots = [...currentSlots];
        slots.push({
            label: `Jam ke-${slots.length + 1}`,
            start: '07:00',
            end: '07:45'
        });
        updateActiveDaySlots(slots);
    };

    const editSlot = (idx: number, field: keyof LessonHourSlot, value: string) => {
        const slots = [...currentSlots];
        slots[idx] = {
            ...slots[idx],
            [field]: value
        };
        updateActiveDaySlots(slots);
    };

    const deleteSlot = (idx: number) => {
        const slots = currentSlots.filter((_, i) => i !== idx);
        updateActiveDaySlots(slots);
    };

    const copyFromDay = (fromDay: string) => {
        const fromLabel = DAYS.find(d => d.key === fromDay)?.label;
        const activeLabel = DAYS.find(d => d.key === activeDay)?.label;
        
        if (confirm(`Apakah Anda yakin ingin menyalin jadwal dari hari ${fromLabel} ke hari ${activeLabel}? Semua jadwal saat ini di hari ${activeLabel} akan diganti.`)) {
            const slotsToCopy = data.lesson_hours[fromDay] || [];
            const copiedSlots = slotsToCopy.map((s: any) => ({ ...s }));
            updateActiveDaySlots(copiedSlots);
            setShowCopyDropdown(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.lesson-hours.update'));
    };

    const getDayLabel = (key: string) => {
        return DAYS.find(d => d.key === key)?.label || key;
    };

    return (
        <AuthenticatedLayout 
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Master Jam Pelajaran</h2>}
        >
            <Head title="Master Jam Pelajaran" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Days Navigation Tab */}
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-1">
                        {DAYS.map(day => {
                            const count = (data.lesson_hours[day.key] || []).length;
                            return (
                                <button
                                    key={day.key}
                                    type="button"
                                    onClick={() => {
                                        setActiveDay(day.key);
                                        setShowCopyDropdown(false);
                                    }}
                                    className={`flex-1 min-w-[80px] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 ${
                                        activeDay === day.key
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <span>{day.label}</span>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                                        activeDay === day.key 
                                        ? 'bg-white/20 text-white' 
                                        : count > 0 
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' 
                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                                    }`}>
                                        {count > 0 ? `${count} Jam` : 'Libur'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Builder Area */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <form onSubmit={submit}>
                            <div className="p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <ClockIcon className="w-6 h-6 text-indigo-600" />
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Jadwal Hari {getDayLabel(activeDay)}</h3>
                                        <p className="text-xs text-slate-400">Atur rentang jam pelajaran khusus untuk hari {getDayLabel(activeDay)}</p>
                                    </div>
                                </div>

                                {/* Copy Utility */}
                                <div className="relative self-stretch sm:self-auto">
                                    <button
                                        type="button"
                                        onClick={() => setShowCopyDropdown(!showCopyDropdown)}
                                        className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-600 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                        Salin Jadwal
                                    </button>
                                    {showCopyDropdown && (
                                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-700 shadow-xl border border-slate-100 dark:border-slate-600 py-1 z-10 animate-fade-in-down">
                                            <div className="px-4 py-2 border-b dark:border-slate-600 text-[10px] uppercase font-black tracking-wider text-slate-400">Salin Dari Hari:</div>
                                            {DAYS.filter(d => d.key !== activeDay).map(day => (
                                                <button
                                                    key={day.key}
                                                    type="button"
                                                    onClick={() => copyFromDay(day.key)}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                >
                                                    {day.label} ({ (data.lesson_hours[day.key] || []).length } Jam)
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {currentSlots.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <ClockIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Hari {getDayLabel(activeDay)} Libur</p>
                                        <p className="text-xs text-slate-400 mt-1">Tidak ada jam pelajaran dikonfigurasi pada hari ini.</p>
                                        <button
                                            type="button"
                                            onClick={addSlot}
                                            className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 border border-dashed border-indigo-200 dark:border-indigo-800"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Aktifkan Hari Kerja
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {currentSlots.map((hour, idx) => (
                                            <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50/50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:border-slate-200 dark:hover:border-slate-700">
                                                <div className="flex-1 space-y-1 w-full">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Nama / Label Slot</label>
                                                    <input 
                                                        type="text" 
                                                        value={hour.label} 
                                                        onChange={e => editSlot(idx, 'label', e.target.value)}
                                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                                        placeholder="Contoh: Jam ke-1 / Istirahat"
                                                        required
                                                    />
                                                </div>
                                                <div className="w-full md:w-40 space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Mulai</label>
                                                    <input 
                                                        type="time" 
                                                        value={hour.start} 
                                                        onChange={e => editSlot(idx, 'start', e.target.value)}
                                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                                        required
                                                    />
                                                </div>
                                                <div className="w-full md:w-40 space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Selesai</label>
                                                    <input 
                                                        type="time" 
                                                        value={hour.end} 
                                                        onChange={e => editSlot(idx, 'end', e.target.value)}
                                                        className="w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                                        required
                                                    />
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => deleteSlot(idx)}
                                                    className="p-3 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 rounded-xl transition-colors md:self-end w-full md:w-auto flex items-center justify-center"
                                                    title="Hapus Slot"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}

                                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                            <button 
                                                type="button"
                                                onClick={addSlot}
                                                className="w-full py-3.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-dashed border-indigo-200 dark:border-indigo-800 transition-colors"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                Tambah Slot Pelajaran
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-900/10 border-t dark:border-gray-700 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Semua Jadwal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
