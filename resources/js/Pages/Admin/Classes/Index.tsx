import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import { useState, FormEvent, useRef } from 'react';

function Modal({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="px-6 py-5 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

const ic = "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition";

export default function ClassIndex({ classes, filters, academicYears, teachers }: any) {
    const [showForm, setShowForm]         = useState(false);
    const [showDelete, setShowDelete]     = useState(false);
    const [showImport, setShowImport]     = useState(false);
    const [editTarget, setEditTarget]     = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        academic_year_id: '', name: '', homeroom_teacher_id: '',
    });

    const importForm = useForm({ file: null as File | null });

    const openCreate = () => { reset(); setEditTarget(null); setShowForm(true); };
    const openEdit = (cls: any) => {
        setEditTarget(cls);
        setData({
            academic_year_id: cls.academic_year_id ?? '',
            name: cls.name ?? '',
            homeroom_teacher_id: cls.homeroom_teacher_id ?? '',
        });
        setShowForm(true);
    };
    const openDelete = (cls: any) => { setDeleteTarget(cls); setShowDelete(true); };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setShowForm(false); reset(); } };
        editTarget
            ? put(route('admin.classes.update', editTarget.id), opts)
            : post(route('admin.classes.store'), opts);
    };

    const handleDelete = () => {
        router.delete(route('admin.classes.destroy', deleteTarget.id), {
            onSuccess: () => { setShowDelete(false); setDeleteTarget(null); }
        });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(route('admin.classes.index'), { search: e.target.value }, { preserveState: true, replace: true });
    };

    const handleImport = (e: FormEvent) => {
        e.preventDefault();
        importForm.post(route('admin.classes.import'), {
            onSuccess: () => { setShowImport(false); importForm.reset(); }
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Manajemen Kelas</h2>}>
            <Head title="Manajemen Kelas" />

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Cari nama kelas..." defaultValue={filters.search} onChange={handleSearch}
                        className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <a href={route('admin.classes.template')}
                        className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Template
                    </a>
                    <button onClick={() => setShowImport(true)}
                        className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Import
                    </button>
                    <a href={route('admin.classes.export')}
                        className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export
                    </a>
                    <button onClick={openCreate}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Tambah Kelas
                    </button>
                </div>
            </div>

            {/* ── Table ── */}
            <Card noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Kelas</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Tahun Ajaran</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Wali Kelas</th>
                                <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Siswa</th>
                                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                            {classes.data.length === 0 ? (
                                <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                                    <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    Belum ada data kelas.
                                </td></tr>
                            ) : classes.data.map((cls: any) => (
                                <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-100">{cls.name}</td>
                                    <td className="px-5 py-3.5 hidden sm:table-cell text-slate-600 dark:text-slate-400">{cls.academic_year?.name ?? '—'}</td>
                                    <td className="px-5 py-3.5 hidden md:table-cell">
                                        {cls.homeroom_teacher
                                            ? <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">{cls.homeroom_teacher.name.charAt(0)}</div>
                                                <span className="text-slate-600 dark:text-slate-400">{cls.homeroom_teacher.name}</span>
                                              </div>
                                            : <span className="text-slate-400">—</span>}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{cls.students_count ?? 0}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(cls)} className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 transition-colors" title="Edit">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button onClick={() => openDelete(cls)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors" title="Hapus">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {classes.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500">{classes.from}–{classes.to} dari {classes.total} data</p>
                        <div className="flex gap-1">
                            {classes.links.map((link: any, i: number) => (
                                <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${link.active ? 'bg-emerald-600 text-white' : link.url ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* ── Form Modal ── */}
            <Modal show={showForm} onClose={() => setShowForm(false)} title={editTarget ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Tahun Ajaran *" error={errors.academic_year_id}>
                        <select className={ic} value={data.academic_year_id} onChange={e => setData('academic_year_id', e.target.value)} required>
                            <option value="">— Pilih Tahun Ajaran —</option>
                            {academicYears.map((ay: any) => (<option key={ay.id} value={ay.id}>{ay.name} {ay.is_active ? '(Aktif)' : ''}</option>))}
                        </select>
                    </Field>
                    <Field label="Nama Kelas *" error={errors.name}>
                        <input className={ic} value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Contoh: X IPA 1" />
                    </Field>
                    <Field label="Wali Kelas" error={errors.homeroom_teacher_id}>
                        <select className={ic} value={data.homeroom_teacher_id} onChange={e => setData('homeroom_teacher_id', e.target.value)}>
                            <option value="">— Pilih Wali Kelas (opsional) —</option>
                            {teachers.map((t: any) => (<option key={t.id} value={t.id}>{t.name}{t.nip ? ` — ${t.nip}` : ''}</option>))}
                        </select>
                    </Field>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                        <button type="submit" disabled={processing} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                            {processing ? 'Menyimpan...' : (editTarget ? 'Simpan Perubahan' : 'Tambah Kelas')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Import Modal ── */}
            <Modal show={showImport} onClose={() => setShowImport(false)} title="Import Data Kelas">
                <div className="space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 text-sm text-emerald-700 dark:text-emerald-300">
                        <p className="font-semibold mb-1">Petunjuk Import:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-xs">
                            <li>Gunakan file <strong>Excel (.xlsx)</strong> atau <strong>CSV (.csv)</strong></li>
                            <li>Unduh template untuk format yang benar</li>
                            <li>Tahun Ajaran harus sudah ada di sistem (contoh: <strong>2024/2025</strong>)</li>
                            <li>Wali Kelas: isi nama lengkap sesuai data pengguna di sistem</li>
                        </ul>
                    </div>
                    <div className="flex">
                        <a href={route('admin.classes.template')}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Template CSV
                        </a>
                    </div>
                    <form onSubmit={handleImport} className="space-y-4">
                        <Field label="Pilih File" error={importForm.errors.file}>
                            <input type="file" accept=".xlsx,.xls,.csv"
                                onChange={e => importForm.setData('file', e.target.files?.[0] ?? null)}
                                className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-500/10 dark:file:text-emerald-400 hover:file:bg-emerald-100 cursor-pointer" />
                        </Field>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowImport(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                            <button type="submit" disabled={importForm.processing} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                                {importForm.processing ? 'Mengimpor...' : 'Import Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── Delete Modal ── */}
            <Modal show={showDelete} onClose={() => setShowDelete(false)} title="Hapus Data Kelas">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">Hapus kelas ini?</p>
                        <p className="text-sm text-slate-500 mt-1">Kelas <span className="font-medium text-slate-700 dark:text-slate-300">{deleteTarget?.name}</span> akan dihapus permanen.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDelete(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                        <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">Ya, Hapus</button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
