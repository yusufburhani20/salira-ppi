import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card from '@/Components/Card';

export default function MyStudentsIndex({ classes }: any) {
    const [search, setSearch] = useState('');

    const statusLabel: Record<string, string> = {
        active: 'Aktif', graduated: 'Lulus', transferred: 'Pindah', dropped_out: 'DO',
    };
    const statusColor: Record<string, string> = {
        active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        graduated: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
        transferred: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        dropped_out: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Siswa Wali Kelas</h2>}>
            <Head title="Daftar Siswa Saya" />

            <div className="mb-6 bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1">Daftar Siswa Perwalian</h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    Pilih siswa untuk melihat resume akademik, kehadiran, bimbingan, dan mengirimkan laporan perkembangan ke orang tua.
                </p>
            </div>

            <div className="mb-5">
                <div className="relative max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                        type="text" 
                        placeholder="Cari nama atau NIS siswa..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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

                        return (
                            <Card key={cls.id} noPadding>
                                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                                            Kelas {cls.name}
                                        </h3>
                                        <p className="text-sm text-slate-500">{cls.academic_year?.name} • {cls.students.length} Siswa Aktif</p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                                                <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Siswa</th>
                                                <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">NISN/NIS</th>
                                                <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Kontak Ortu</th>
                                                <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                            {filteredStudents.length === 0 ? (
                                                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">Tidak ada siswa.</td></tr>
                                            ) : (
                                                filteredStudents.map((student: any) => (
                                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
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
