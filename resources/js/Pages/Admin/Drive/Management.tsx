import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DriveManagement({ auth, files, filters, statistics }: any) {
    const handleDelete = (id: number) => {
        if (confirm('PERINGATAN: File akan dihapus permanen. Lanjutkan?')) {
            router.delete(route('admin.drive.destroy', id));
        }
    };

    const handleRevokeLink = (id: number) => {
        if (confirm('Cabut tautan publik untuk file ini?')) {
            router.post(route('admin.drive.revoke-link', id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200">Manajemen Drive Sistem</h2>}>
            <Head title="Manajemen Drive" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Stats Card */}
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-lg p-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Total Penggunaan Storage</h3>
                            <p className="text-slate-500 text-sm">Keseluruhan file di sistem</p>
                        </div>
                        <div className="text-3xl font-bold text-indigo-600">
                            {(statistics.total_bytes / 1024 / 1024 / 1024).toFixed(2)} GB
                        </div>
                    </div>

                    {/* Files Table */}
                    <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama File</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pemilik</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ukuran</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tautan Publik</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi Admin</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {files.data.map((file: any) => (
                                    <tr key={file.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{file.original_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{file.owner?.name || `ID: ${file.owner_id}`}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{(file.file_size / 1024 / 1024).toFixed(2)} MB</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {file.is_public ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {file.is_public && (
                                                <button onClick={() => handleRevokeLink(file.id)} className="text-orange-600 hover:text-orange-900">Cabut Link</button>
                                            )}
                                            <button onClick={() => handleDelete(file.id)} className="text-red-600 hover:text-red-900">Hapus Paksa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
