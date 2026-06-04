import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import { useState, FormEvent, useRef } from 'react';

// ─── Modal ───────────────────────────────────────────────────────────────────
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

const ic = "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";

// ─── Main ────────────────────────────────────────────────────────────────────
export default function StudentIndex({ students, filters, classes, canManage }: any) {
    const [showForm, setShowForm]         = useState(false);
    const [showDelete, setShowDelete]     = useState(false);
    const [showImport, setShowImport]     = useState(false);
    const [showImportPhotos, setShowImportPhotos] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printSelectedClass, setPrintSelectedClass] = useState<string>('');
    const [editTarget, setEditTarget]     = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const importRef = useRef<HTMLInputElement>(null);
    const importPhotosRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        _method: 'POST' as string,
        nisn: '', nis: '', name: '', gender: 'L' as string, status: 'active' as string,
        birth_place: '', birth_date: '', parent_name: '', parent_phone: '',
        parent_email: '', parent_telegram_id: '',
        academic_class_id: '' as string,
        photo: null as File | null,
        delete_photo: false as boolean,
    });

    const importForm = useForm({ file: null as File | null });
    const importPhotosForm = useForm({ file: null as File | null });

    const handleImportPhotos = (e: FormEvent) => {
        e.preventDefault();
        importPhotosForm.post(route('admin.students.import-photos'), {
            onSuccess: () => {
                setShowImportPhotos(false);
                importPhotosForm.reset();
                if (importPhotosRef.current) importPhotosRef.current.value = '';
            }
        });
    };

    const openCreate = () => {
        reset();
        setEditTarget(null);
        setData(d => ({
            ...d,
            _method: 'POST',
            photo: null,
            delete_photo: false,
        }));
        setShowForm(true);
    };
    const openEdit = (s: any) => {
        setEditTarget(s);
        setData({
            _method: 'PUT',
            nisn: s.nisn ?? '', nis: s.nis ?? '', name: s.name ?? '',
            gender: s.gender ?? 'L', status: s.status ?? 'active',
            birth_place: s.birth_place ?? '', birth_date: s.birth_date ? String(s.birth_date).split('T')[0] : '',
            parent_name: s.parent_name ?? '', parent_phone: s.parent_phone ?? '',
            parent_email: s.parent_email ?? '', parent_telegram_id: s.parent_telegram_id ?? '',
            academic_class_id: s.academic_class_id ? String(s.academic_class_id) : '',
            photo: null,
            delete_photo: false,
        });
        setShowForm(true);
    };
    const openDelete = (s: any) => { setDeleteTarget(s); setShowDelete(true); };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setShowForm(false); reset(); } };
        editTarget
            ? post(route('admin.students.update', editTarget.id), opts)
            : post(route('admin.students.store'), opts);
    };

    const handleDelete = () => {
        router.delete(route('admin.students.destroy', deleteTarget.id), {
            onSuccess: () => { setShowDelete(false); setDeleteTarget(null); }
        });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(route('admin.students.index'), { search: e.target.value }, { preserveState: true, replace: true });
    };

    const handleImport = (e: FormEvent) => {
        e.preventDefault();
        importForm.post(route('admin.students.import'), {
            onSuccess: () => { setShowImport(false); importForm.reset(); }
        });
    };

    const statusLabel: Record<string, string> = {
        active: 'Aktif', graduated: 'Lulus', transferred: 'Pindah', dropped_out: 'DO',
    };
    const statusColor: Record<string, string> = {
        active:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
        graduated:   'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
        transferred: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
        dropped_out: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Manajemen Siswa</h2>}>
            <Head title="Manajemen Siswa" />

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Cari nama, NISN, NIS..." defaultValue={filters.search} onChange={handleSearch}
                        className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* Template */}
                    {canManage && (
                        <a href={route('admin.students.template')}
                            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Template
                        </a>
                    )}
                    {/* Import */}
                    {canManage && (
                        <button onClick={() => setShowImport(true)}
                            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Import
                        </button>
                    )}
                    {/* Import Foto */}
                    {canManage && (
                        <button onClick={() => setShowImportPhotos(true)}
                            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Import Foto
                        </button>
                    )}
                    {/* Export */}
                    <a href={route('admin.students.export')}
                        className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export
                    </a>
                    {/* Cetak Kartu Masal */}
                    <button onClick={() => setShowPrintModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2.5 bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-500/20 dark:hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-400 rounded-xl text-sm font-medium transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Cetak Kartu
                    </button>
                    {/* Tambah */}
                    {canManage && (
                        <button onClick={openCreate}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Tambah Siswa
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
            <Card noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Siswa</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">NISN / NIS</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Kelas</th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                            {students.data.length === 0 ? (
                                <tr><td colSpan={5} className="py-16 text-center text-slate-400">
                                    <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    Belum ada data siswa.
                                </td></tr>
                            ) : students.data.map((s: any) => (
                                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0 overflow-hidden">
                                                {s.photo_url ? (
                                                    <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    s.name.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-100">{s.name}</p>
                                                <p className="text-xs text-slate-400">{s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 hidden sm:table-cell">
                                        <p className="font-mono text-slate-700 dark:text-slate-300 text-xs">{s.nisn}</p>
                                        <p className="font-mono text-slate-400 text-xs">{s.nis || '-'}</p>
                                    </td>
                                    <td className="px-5 py-3.5 hidden md:table-cell">
                                        {s.academic_class
                                            ? <span className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">{s.academic_class.name}</span>
                                            : <span className="text-slate-400 text-xs">—</span>
                                        }
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColor[s.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {statusLabel[s.status] ?? s.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button 
                                                onClick={() => window.open(route('admin.students.print-single-card', s.id), '_blank')}
                                                className="p-2 rounded-lg text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-500/10 transition-colors" 
                                                title="Cetak Kartu"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                </svg>
                                            </button>
                                            {canManage && (
                                                <>
                                                    <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 transition-colors" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button onClick={() => openDelete(s)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors" title="Hapus">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {students.last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500">{students.from}–{students.to} dari {students.total} data</p>
                        <div className="flex gap-1">
                            {students.links.map((link: any, i: number) => (
                                <button key={i} disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${link.active ? 'bg-indigo-600 text-white' : link.url ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {/* ── Form Modal ── */}
            <Modal show={showForm} onClose={() => setShowForm(false)} title={editTarget ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}>
                <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
                    {/* Upload Foto Siswa */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 flex gap-4 items-center">
                        <div className="shrink-0 relative">
                            {data.photo ? (
                                <img src={URL.createObjectURL(data.photo)} className="w-16 h-16 rounded-xl object-cover border border-slate-300 dark:border-slate-600 shadow-sm" alt="Preview" />
                            ) : (editTarget && editTarget.photo_url && !data.delete_photo) ? (
                                <img src={editTarget.photo_url} className="w-16 h-16 rounded-xl object-cover border border-slate-300 dark:border-slate-600 shadow-sm" alt="Current" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 text-[10px] font-semibold bg-white dark:bg-slate-800">
                                    Tanpa Foto
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Foto Profil Siswa</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={e => {
                                    const file = e.target.files?.[0] || null;
                                    setData(d => ({ ...d, photo: file, delete_photo: false }));
                                }} 
                                className="block w-full text-xs text-slate-500
                                    file:mr-3 file:py-1.5 file:px-3
                                    file:rounded-lg file:border-0
                                    file:text-xs file:font-semibold
                                    file:bg-indigo-50 file:text-indigo-700
                                    dark:file:bg-indigo-950/40 dark:file:text-indigo-300
                                    hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/40 cursor-pointer"
                            />
                            {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
                            <div className="text-[10px] text-slate-400 leading-relaxed">
                                <span className="font-semibold text-slate-500 dark:text-slate-300">Ketentuan:</span> Maksimal 1 MB (PNG, JPG, JPEG, WebP). Gambar akan di-crop 1:1, di-resize ke 300x300px, dan dikompresi otomatis.
                            </div>
                            {((data.photo) || (editTarget && editTarget.photo_url && !data.delete_photo)) && (
                                <button 
                                    type="button" 
                                    onClick={() => setData(d => ({ ...d, photo: null, delete_photo: true }))}
                                    className="text-[10px] font-semibold text-red-500 hover:text-red-600 hover:underline pt-1 flex items-center gap-0.5"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Hapus Foto
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label="NISN *" error={errors.nisn}>
                            <input className={ic} value={data.nisn} onChange={e => setData('nisn', e.target.value)} placeholder="Nomor NISN" />
                        </Field>
                        <Field label="NIS" error={errors.nis}>
                            <input className={ic} value={data.nis} onChange={e => setData('nis', e.target.value)} placeholder="NIS lokal" />
                        </Field>
                    </div>
                    <Field label="Nama Lengkap *" error={errors.name}>
                        <input className={ic} value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nama lengkap siswa" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Jenis Kelamin *" error={errors.gender}>
                            <select className={ic} value={data.gender} onChange={e => setData('gender', e.target.value)}>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </Field>
                        <Field label="Status *" error={errors.status}>
                            <select className={ic} value={data.status} onChange={e => setData('status', e.target.value)}>
                                <option value="active">Aktif</option>
                                <option value="graduated">Lulus</option>
                                <option value="transferred">Pindah</option>
                                <option value="dropped_out">DO (Keluar)</option>
                            </select>
                        </Field>
                    </div>
                    <Field label="Kelas" error={errors.academic_class_id}>
                        <select className={ic} value={data.academic_class_id} onChange={e => setData('academic_class_id', e.target.value)}>
                            <option value="">— Pilih Kelas (opsional) —</option>
                            {classes.map((cls: any) => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Tempat Lahir" error={errors.birth_place}>
                            <input className={ic} value={data.birth_place} onChange={e => setData('birth_place', e.target.value)} placeholder="Kota kelahiran" />
                        </Field>
                        <Field label="Tanggal Lahir" error={errors.birth_date}>
                            <input type="date" className={ic} value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Nama Orang Tua" error={errors.parent_name}>
                            <input className={ic} value={data.parent_name} onChange={e => setData('parent_name', e.target.value)} placeholder="Nama ayah/ibu" />
                        </Field>
                        <Field label="No. HP Orang Tua" error={errors.parent_phone}>
                            <input className={ic} value={data.parent_phone} onChange={e => setData('parent_phone', e.target.value)} placeholder="08xxxxxxxxxx" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Email Orang Tua" error={errors.parent_email}>
                            <input type="email" className={ic} value={data.parent_email} onChange={e => setData('parent_email', e.target.value)} placeholder="email@contoh.com" />
                        </Field>
                        <Field label="ID/No. Telegram Ortu" error={errors.parent_telegram_id}>
                            <input className={ic} value={data.parent_telegram_id} onChange={e => setData('parent_telegram_id', e.target.value)} placeholder="@username / ID" />
                        </Field>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                        <button type="submit" disabled={processing} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                            {processing ? 'Menyimpan...' : (editTarget ? 'Simpan Perubahan' : 'Tambah Siswa')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── Import Modal ── */}
            <Modal show={showImport} onClose={() => setShowImport(false)} title="Import Data Siswa">
                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 text-sm text-indigo-700 dark:text-indigo-300">
                        <p className="font-semibold mb-1">Petunjuk Import:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-xs">
                            <li>Gunakan file <strong>Excel (.xlsx)</strong> atau <strong>CSV (.csv)</strong></li>
                            <li>Unduh template terlebih dahulu agar format benar</li>
                            <li>Jenis Kelamin: gunakan <strong>L</strong> atau <strong>P</strong></li>
                            <li>Status: <strong>active</strong>, <strong>graduated</strong>, <strong>transferred</strong>, <strong>dropped_out</strong></li>
                            <li>Nama Kelas harus sama persis dengan data kelas yang ada</li>
                        </ul>
                    </div>
                    <div className="flex gap-2">
                        <a href={route('admin.students.template')}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Template CSV
                        </a>
                    </div>
                    <form onSubmit={handleImport} className="space-y-4">
                        <Field label="Pilih File" error={importForm.errors.file}>
                            <input
                                ref={importRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={e => importForm.setData('file', e.target.files?.[0] ?? null)}
                                className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 hover:file:bg-indigo-100 cursor-pointer"
                            />
                        </Field>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowImport(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                            <button type="submit" disabled={importForm.processing} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                                {importForm.processing ? 'Mengimpor...' : 'Import Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── Import Foto Masal Modal ── */}
            <Modal show={showImportPhotos} onClose={() => setShowImportPhotos(false)} title="Upload Foto Masal (ZIP)">
                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 text-sm text-indigo-700 dark:text-indigo-300">
                        <p className="font-semibold mb-1">Petunjuk Upload Foto Masal:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs leading-relaxed">
                            <li>Kumpulkan semua foto siswa ke dalam satu folder lalu kompres menjadi file <strong>ZIP (.zip)</strong>.</li>
                            <li>Ubah nama file foto masing-masing siswa menjadi <strong>NISN</strong> atau <strong>NIS</strong> mereka (contoh: <code className="font-mono bg-indigo-100 dark:bg-indigo-900/60 px-1 rounded">1234567890.jpg</code> atau <code className="font-mono bg-indigo-100 dark:bg-indigo-900/60 px-1 rounded">2122001.png</code>).</li>
                            <li>Format file foto yang didukung di dalam ZIP: <strong>PNG, JPG, JPEG, WebP</strong>.</li>
                            <li>Sistem akan otomatis mencocokkan nama file dengan NISN/NIS siswa di database, memotong (crop) 1:1, mengecilkan ukuran ke 300x300px, dan melakukan kompresi otomatis untuk menghemat ruang server.</li>
                            <li>Batas ukuran file ZIP maksimal adalah <strong>20 MB</strong>.</li>
                        </ul>
                    </div>
                    <form onSubmit={handleImportPhotos} className="space-y-4">
                        <Field label="Pilih File ZIP" error={importPhotosForm.errors.file}>
                            <input
                                ref={importPhotosRef}
                                type="file"
                                accept=".zip"
                                onChange={e => importPhotosForm.setData('file', e.target.files?.[0] ?? null)}
                                className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 hover:file:bg-indigo-100 cursor-pointer"
                            />
                        </Field>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowImportPhotos(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                            <button type="submit" disabled={importPhotosForm.processing} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                                {importPhotosForm.processing ? 'Memproses ZIP...' : 'Upload Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── Delete Modal ── */}
            <Modal show={showDelete} onClose={() => setShowDelete(false)} title="Hapus Data Siswa">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">Hapus siswa ini?</p>
                        <p className="text-sm text-slate-500 mt-1"><span className="font-medium text-slate-700 dark:text-slate-300">{deleteTarget?.name}</span> akan dihapus permanen.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDelete(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                        <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">Ya, Hapus</button>
                    </div>
                </div>
            </Modal>
            {/* ── Print Cards Modal ── */}
            <Modal show={showPrintModal} onClose={() => setShowPrintModal(false)} title="Cetak Kartu Pelajar Masal">
                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 text-sm text-indigo-700 dark:text-indigo-300">
                        <p className="font-semibold mb-1">Cetak Berdasarkan Kelas:</p>
                        <p className="text-xs">Sistem akan men-generate kartu pengenal digital untuk semua siswa berstatus aktif di kelas yang Anda pilih. Anda dapat mencetaknya langsung menggunakan kertas A4.</p>
                    </div>
                    
                    <Field label="Pilih Kelas">
                        <select 
                            className={ic} 
                            value={printSelectedClass} 
                            onChange={e => setPrintSelectedClass(e.target.value)}
                        >
                            <option value="">— Pilih Kelas —</option>
                            {classes.map((cls: any) => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </Field>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowPrintModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                        <button 
                            disabled={!printSelectedClass}
                            onClick={() => {
                                setShowPrintModal(false);
                                window.open(route('admin.students.print-cards', printSelectedClass), '_blank');
                            }}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Cetak Sekarang
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
