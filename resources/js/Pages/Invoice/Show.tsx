import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function InvoiceShow({ bill, isProduction, clientKey }: any) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Build snap script
        const script = document.createElement('script');
        script.src = isProduction 
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', clientKey);
        
        script.onload = () => setIsLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [clientKey, isProduction]);

    const handlePay = () => {
        if (!isLoaded || !bill.snap_token) return;

        window.snap.pay(bill.snap_token, {
            onSuccess: function(result: any) {
                // Polling or webhook will handle db update
                alert('Pembayaran Berhasil!');
                window.location.reload();
            },
            onPending: function(result: any) {
                alert('Mohon tuntaskan pembayaran Anda sesuai petunjuk.');
            },
            onError: function(result: any) {
                alert('Pembayaran gagal, silakan coba lagi.');
            },
            onClose: function() {
                // User closed popup without finishing
            }
        });
    };

    const handleDownloadPdf = () => {
        window.open(`/invoice/${bill.bill_number}/pdf`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Head title={`Invoice ${bill.bill_number}`} />

            <div className="max-w-xl w-full bg-white rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden">
                <div className="bg-indigo-600 px-6 py-8 text-center text-white">
                    <h1 className="text-2xl font-bold tracking-tight">Kuitansi Pembayaran SPP</h1>
                    <p className="mt-2 text-indigo-200">SALIRA - Sistem Administrasi Cerdas</p>
                </div>
                
                <div className="px-6 py-8">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tagihan Kepada:</p>
                            <h2 className="text-xl font-bold text-gray-900 mt-1">{bill.student.name}</h2>
                            <p className="text-sm text-gray-600">NIS: {bill.student.nis ?? '-'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 font-medium">No. Invoice</p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">{bill.bill_number}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2
                                ${bill.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                    bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {bill.status === 'paid' ? 'LUNAS' : bill.status === 'pending' ? 'PENDING' : 'BELUM BAYAR'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Keterangan:</span>
                            <span className="font-medium text-gray-900">{bill.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Periode:</span>
                            <span className="font-medium text-gray-900">Bulan {bill.month} / Tahun {bill.year}</span>
                        </div>
                        {bill.paid_at && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Dibayar Pada:</span>
                                <span className="font-medium text-green-700">{new Date(bill.paid_at).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        )}
                        <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center text-lg">
                            <span className="font-bold text-gray-900">Total Pembayaran</span>
                            <span className="font-bold text-indigo-600">Rp {new Intl.NumberFormat('id-ID').format(bill.amount)}</span>
                        </div>
                    </div>

                    {bill.status !== 'paid' && (
                        <div className="mt-8">
                            <button
                                onClick={handlePay}
                                disabled={!isLoaded || !bill.snap_token}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white 
                                    ${(!isLoaded || !bill.snap_token) ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
                            >
                                {!isLoaded ? 'Menyiapkan Payment Gateway...' : 'Bayar Sekarang'}
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4">
                                Pembayaran diproses dengan aman oleh Midtrans.
                            </p>
                        </div>
                    )}

                    {bill.status === 'paid' && (
                        <div className="mt-8 p-4 bg-green-50 rounded-lg text-center border border-green-100">
                            <svg className="mx-auto h-12 w-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-bold text-green-800">Tagihan Telah Lunas</h3>
                            <p className="text-sm text-green-600 mt-1">Terima kasih atas pembayaran Anda.</p>
                        </div>
                    )}

                    {/* Tombol Download PDF - Tampil untuk semua status */}
                    <div className="mt-6 border-t border-gray-100 pt-4">
                        <button
                            onClick={handleDownloadPdf}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-indigo-300 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Unduh Invoice PDF
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Add TS interface for window.snap
declare global {
    interface Window {
        snap: any;
    }
}
