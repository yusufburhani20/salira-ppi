import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function BillIndex({ bills, classes, finance_contact }: any) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        finance_contact: finance_contact || '',
    });

    const submitSetting = (e: any) => {
        e.preventDefault();
        post(route('admin.bills.settings'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manajemen Tagihan (SPP)</h2>}
        >
            <Head title="Manajemen Tagihan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* SETTING KONTAK KEUANGAN */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    Pengaturan Kontak Admin Keuangan
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Nomor ini akan muncul di portal siswa untuk bantuan pembayaran.</p>
                            </div>
                            <form onSubmit={submitSetting} className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 font-bold text-sm">+</span>
                                    <input
                                        type="text"
                                        value={data.finance_contact}
                                        onChange={(e) => setData('finance_contact', e.target.value)}
                                        className="pl-7 block w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="628123456789"
                                    />
                                </div>
                                <button
                                    disabled={processing}
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                                {recentlySuccessful && <span className="text-green-600 text-xs font-bold animate-pulse">Berhasil!</span>}
                            </form>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Daftar Tagihan Siswa</h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => router.post(route('admin.bills.sync'))}
                                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md font-semibold text-sm shadow-sm transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Sync Status
                            </button>
                            <Link
                                href={route('admin.bills.create')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold text-sm shadow-sm"
                            >
                                + Buat Tagihan
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Invoice</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul / Bulan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Lunas</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bills.data.length === 0 && (
                                        <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Belum ada tagihan.</td></tr>
                                    )}
                                    {bills.data.map((bill: any) => (
                                        <tr key={bill.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {bill.bill_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {bill.student?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {bill.title} ({bill.month}/{bill.year})
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                Rp {new Intl.NumberFormat('id-ID').format(bill.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {bill.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {bill.paid_at ? new Date(bill.paid_at).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {bill.status !== 'paid' && (
                                                    <>
                                                        <button 
                                                            onClick={() => router.post(route('admin.bills.sync', bill.id))}
                                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded mb-1 sm:mb-0 sm:mr-2"
                                                        >
                                                            Refresh
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                if(confirm('Apakah Anda yakin tagihan ini sudah dibayar secara CASH? Tagihan akan ditandai lunas dan notifikasi akan dikirim ke wali murid.')) {
                                                                    router.post(route('admin.bills.mark-paid', bill.id), {}, { preserveScroll: true });
                                                                }
                                                            }}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded"
                                                        >
                                                            Lunas Cash
                                                        </button>
                                                    </>
                                                )}
                                                <a href={route('invoice.show', bill.bill_number)} target="_blank" className="ml-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border border-gray-200" rel="noreferrer">
                                                    Lihat
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
