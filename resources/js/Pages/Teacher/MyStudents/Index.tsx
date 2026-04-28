import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import Card from '@/Components/Card';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function MyStudentsIndex({ classes }: any) {
    const { flash } = usePage<any>().props;
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<number[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    const today = new Date();

    // Gunakan tanggal lokal (bukan UTC) agar tidak bergeser karena perbedaan timezone
    const formatLocal = (d: Date) => {
        const y   = d.getFullYear();
        const m   = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const defaultStart = `${today.getFullYear()}-01-01`;
    const defaultEnd   = formatLocal(today);

    const { data, setData, post, processing } = useForm({
        student_ids: [] as number[],
        start_date:  defaultStart,
        end_date:    defaultEnd,
    });

    // Sync selected → form data
    const toggleStudent = (id: number) => {
        setSelected(prev => {
            const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
            setData('student_ids', next);
            return next;
        });
    };

    const toggleClass = (students: any[]) => {
        const ids = students.map((s: any) => s.id);
        const allSelected = ids.every(id => selected.includes(id));
        const next = allSelected
            ? selected.filter(id => !ids.includes(id))
            : [...new Set([...selected, ...ids])];
        setSelected(next);
        setData('student_ids', next);
    };

    const handleMonthChange = (month: string) => {
        setSelectedMonth(month);
        if (month) {
            const m  = parseInt(month) - 1;
            const yr = today.getFullYear();
            const s  = formatLocal(new Date(yr, m, 1));
            const e  = formatLocal(new Date(yr, m + 1, 0)); // hari terakhir bulan
            setData(d => ({ ...d, start_date: s, end_date: e }));
        }
    };

    const handleBulkSend = () => {
        if (selected.length === 0) return;
        if (!confirm(`Kirim laporan ke ${selected.length} siswa terpilih?\n\nPeriode: ${data.start_date} s/d ${data.end_date}`)) return;
        post(route('teacher.my-students.send-bulk-report'), {
            preserveScroll: true,
            onSuccess: () => { setSelected([]); setData('student_ids', []); },
        });
    };

    const allStudents = classes.flatMap((c: any) => c.students);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Siswa Wali Kelas</h2>}>
            <Head title="Daftar Siswa Saya" />

            {/* Flash message */}
            {flash?.success && (
                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium">
                    {flash.error}
                </div>
            )}

            <div className="mb-6 bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1">Daftar Siswa Perwalian</h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    Centang siswa untuk kirim laporan massal, atau klik <strong>Lihat Resume</strong> untuk laporan individu.
                </p>
            </div>

            {/* ── BULK ACTION BAR ── */}
            {selected.length > 0 && (
                <div className="sticky top-4 z-30 mb-4 bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <PaperAirplaneIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm">{selected.length} siswa dipilih</span>
                    </div>

                    {/* Pilih Bulan */}
                    <select
                        value={selectedMonth}
                        onChange={e => handleMonthChange(e.target.value)}
                        className="h-9 px-3 rounded-xl text-xs font-bold bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                    >
                        <option value="" className="text-slate-800">-- Bulan --</option>
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i + 1} className="text-slate-800">{m}</option>
                        ))}
                    </select>

                    {/* Custom range */}
                    <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-xl px-3 h-9">
                        <input
                            type="date" value={data.start_date}
                            onChange={e => { setSelectedMonth(''); setData('start_date', e.target.value); }}
                            className="bg-transparent text-white text-xs border-none focus:ring-0 p-0 w-28"
                        />
                        <span className="text-white/50">–</span>
                        <input
                            type="date" value={data.end_date}
                            onChange={e => { setSelectedMonth(''); setData('end_date', e.target.value); }}
                            className="bg-transparent text-white text-xs border-none focus:ring-0 p-0 w-28"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => { setSelected([]); setData('student_ids', []); }}
                            className="h-9 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleBulkSend}
                            disabled={processing}
                            className="h-9 px-4 rounded-xl text-xs font-black bg-white text-indigo-700 hover:bg-indigo-50 transition-colors disabled:opacity-60 flex items-center gap-2"
                        >
                            <PaperAirplaneIcon className="w-3.5 h-3.5" />
                            {processing ? 'Mengirim...' : `Kirim ke ${selected.length} Siswa`}
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="mb-5">
                <div className="relative max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                        type="text" placeholder="Cari nama atau NIS siswa..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>
            </div>

            <div className="space-y-6">
                {classes.length === 0 ? (
                    <Card>
                        <div className="text-center py-10">
                            <svg className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            <p className="text-slate-500 font-medium">Anda belum ditugaskan sebagai Wali Kelas</p>
                            <p className="text-sm text-slate-400 mt-1">Silakan hubungi administrator jika ini adalah kesalahan.</p>
                        </div>
                    </Card>
                ) : (
                    classes.map((cls: any) => {
                        const filteredStudents = cls.students.filter((s: any) =>
                            s.name.toLowerCase().includes(search.toLowerCase()) ||
                            (s.nis && s.nis.includes(search))
                        );
                        if (search && filteredStudents.length === 0) return null;

                        const clsIds     = filteredStudents.map((s: any) => s.id);
                        const allChecked = clsIds.length > 0 && clsIds.every((id: number) => selected.includes(id));
                        const someChecked = clsIds.some((id: number) => selected.includes(id));

                        return (
                            <Card key={cls.id} noPadding>
                                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {/* Select all per kelas */}
                                        <input
                                            type="checkbox"
                                            checked={allChecked}
                                            ref={el => { if (el) el.indeterminate = !allChecked && someChecked; }}
                                            onChange={() => toggleClass(filteredStudents)}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            title="Pilih semua siswa di kelas ini"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Kelas {cls.name}</h3>
                                            <p className="text-sm text-slate-500">{cls.academic_year?.name} • {cls.students.length} Siswa Aktif</p>
                                        </div>
                                    </div>
                                    {someChecked && (
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                            {clsIds.filter((id: number) => selected.includes(id)).length} dipilih
                                        </span>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                                                <th className="px-5 py-3 w-10"></th>
                                                <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                                                <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">NISN/NIS</th>
                                                <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Kontak Ortu</th>
                                                <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                            {filteredStudents.length === 0 ? (
                                                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Tidak ada siswa.</td></tr>
                                            ) : (
                                                filteredStudents.map((student: any) => (
                                                    <tr key={student.id} className={`transition-colors ${selected.includes(student.id) ? 'bg-indigo-50/60 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                                                        <td className="px-5 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selected.includes(student.id)}
                                                                onChange={() => toggleStudent(student.id)}
                                                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs flex-shrink-0">
                                                                    {student.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{student.name}</p>
                                                                    <p className="text-xs text-slate-500">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 hidden sm:table-cell">
                                                            <p className="font-mono text-slate-700 dark:text-slate-300">{student.nisn}</p>
                                                            <p className="font-mono text-slate-400 text-xs">{student.nis || '-'}</p>
                                                        </td>
                                                        <td className="px-5 py-3 hidden md:table-cell">
                                                            <div className="text-xs">
                                                                {student.parent_email ? (
                                                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mb-0.5">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                                        {student.parent_email}
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 text-slate-400 mb-0.5">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                                        Belum diset
                                                                    </span>
                                                                )}
                                                                {student.parent_telegram_id && (
                                                                    <span className="flex items-center gap-1 text-blue-500">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                                                        ID: {student.parent_telegram_id}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <Link
                                                                href={route('teacher.my-students.resume', student.id)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 rounded-lg text-xs font-medium transition-colors"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                                Lihat Resume
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </AuthenticatedLayout>
    );
}
