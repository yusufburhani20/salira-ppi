import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function InvoiceShow({ bill: initialBill, isProduction, clientKey, snapTokenExpired, adminFee }: any) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [bill, setBill] = useState(initialBill);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [snapInstance, setSnapInstance] = useState<any>(null);

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
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [clientKey, isProduction]);

    const openSnapPayment = (token: string) => {
        window.snap.pay(token, {
            onSuccess: function() {
                window.location.reload();
            },
            onPending: function() {
                alert('Pembayaran sedang diproses. Silakan selesaikan sesuai petunjuk.');
            },
            onError: function(result: any) {
                console.error('Snap Error:', result);
                alert('Terjadi kesalahan. Silakan klik "Ganti / Coba Lagi" untuk memperbarui sesi pembayaran.');
            },
            onClose: function() {
                // User closed without paying, allow them to reopen
            }
        });
    };

    const handlePay = () => {
        if (!isLoaded || !bill.snap_token) return;
        openSnapPayment(bill.snap_token);
    };

    const handleRegenerateToken = async () => {
        setIsRegenerating(true);
        try {
            const response = await fetch(`/invoice/${bill.bill_number}/regenerate-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (data.snap_token) {
                setBill({ ...bill, snap_token: data.snap_token });
                // Automatically open payment after regenerate
                setTimeout(() => openSnapPayment(data.snap_token), 300);
            } else {
                alert(data.error || 'Gagal memperbarui sesi. Muat ulang halaman.');
            }
        } catch {
            alert('Gagal menghubungi server. Periksa koneksi internet Anda.');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleDownloadPdf = () => {
        window.open(`/invoice/${bill.bill_number}/pdf`, '_blank');
    };

    const statusConfig: Record<string, { label: string; className: string }> = {
        paid: { label: 'LUNAS', className: 'bg-green-100 text-green-800' },
        pending: { label: 'MENUNGGU PEMBAYARAN', className: 'bg-yellow-100 text-yellow-800' },
        expired: { label: 'KADALUARSA', className: 'bg-orange-100 text-orange-800' },
        unpaid: { label: 'BELUM DIBAYAR', className: 'bg-red-100 text-red-800' },
        failed: { label: 'GAGAL', className: 'bg-red-100 text-red-800' },
    };

    const status = statusConfig[bill.status] ?? { label: bill.status.toUpperCase(), className: 'bg-gray-100 text-gray-800' };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 flex items-center justify-center p-4">
            <Head title={`Invoice ${bill.bill_number}`} />

            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8 text-center text-white">
                    <h1 className="text-2xl font-bold tracking-tight">Kuitansi Pembayaran SPP</h1>
                    <p className="mt-1.5 text-indigo-200 text-sm">SALIRA - Sistem Administrasi Cerdas</p>
                </div>

                <div className="px-6 py-8">
                    {/* Invoice Info */}
                    <div className="flex justify-between items-end border-b border-gray-100 pb-6 mb-6">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Tagihan Kepada:</p>
                            <h2 className="text-xl font-bold text-gray-900 mt-1">{bill.student.name}</h2>
                            <p className="text-sm text-gray-500">NIS: {bill.student.nis ?? '-'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">No. Invoice</p>
                            <p className="text-xs font-semibold text-gray-700 mt-1">{bill.bill_number}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-2 ${status.className}`}>
                                {status.label}
                            </span>
                        </div>
                    </div>

                    {/* Detail */}
                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Keterangan:</span>
                            <span className="font-medium text-gray-900 text-right ml-4">{bill.title}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Periode:</span>
                            <span className="font-medium text-gray-900">Bulan {bill.month} / {bill.year}</span>
                        </div>
                        {bill.paid_at && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tanggal Lunas:</span>
                                <span className="font-medium text-green-700">
                                    {new Date(bill.paid_at).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}
                        {bill.payment_method && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Metode Bayar:</span>
                                <span className="font-medium text-gray-900 capitalize">{bill.payment_method.replace(/_/g, ' ')}</span>
                            </div>
                        )}
                        <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tagihan SPP</span>
                                <span className="text-gray-700">Rp {new Intl.NumberFormat('id-ID').format(bill.amount)}</span>
                            </div>
                            {adminFee && adminFee.amount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{adminFee.label}</span>
                                    <span className="text-orange-600 font-medium">+ Rp {new Intl.NumberFormat('id-ID').format(adminFee.amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="font-bold text-gray-900 text-base">Total Pembayaran</span>
                                <span className="font-bold text-indigo-600 text-xl">
                                    Rp {new Intl.NumberFormat('id-ID').format(bill.amount + (adminFee ? adminFee.amount : 0))}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* EXPIRED STATE */}
                    {(bill.status === 'expired' || snapTokenExpired) && bill.status !== 'paid' && (
                        <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
                            <svg className="mx-auto h-10 w-10 text-orange-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-sm font-bold text-orange-800">Sesi Pembayaran Kadaluarsa</h3>
                            <p className="text-xs text-orange-600 mt-1">Token pembayaran sudah habis masa berlakunya. Klik tombol di bawah untuk memperbarui.</p>
                        </div>
                    )}

                    {/* PAYMENT BUTTONS (for unpaid/expired) */}
                    {bill.status !== 'paid' && (
                        <div className="space-y-3 mt-4">
                            {/* Main Pay / Retry button */}
                            <button
                                onClick={handlePay}
                                disabled={!isLoaded || !bill.snap_token}
                                className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-sm transition-all
                                    ${(!isLoaded || !bill.snap_token) ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'}`}
                            >
                                {!isLoaded ? (
                                    <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Menyiapkan...</>
                                ) : (
                                    'Bayar Sekarang'
                                )}
                            </button>

                            {/* Change method / Regenerate button */}
                            <button
                                onClick={handleRegenerateToken}
                                disabled={isRegenerating || !isLoaded}
                                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all disabled:opacity-60"
                            >
                                {isRegenerating ? (
                                    <><span className="animate-spin inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full"></span> Memperbarui sesi...</>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Ganti Metode / Perbarui Sesi
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-400">
                                Pembayaran diproses dengan aman oleh Midtrans.
                            </p>
                        </div>
                    )}

                    {/* PAID STATE */}
                    {bill.status === 'paid' && (
                        <div className="mt-2 p-4 bg-green-50 rounded-xl text-center border border-green-100">
                            <svg className="mx-auto h-12 w-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-bold text-green-800">Tagihan Telah Lunas</h3>
                            <p className="text-sm text-green-600 mt-1">Terima kasih atas pembayaran Anda.</p>
                        </div>
                    )}

                    {/* Download PDF Button */}
                    <div className="mt-5 border-t border-gray-100 pt-4">
                        <button
                            onClick={handleDownloadPdf}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-indigo-200 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
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

declare global {
    interface Window {
        snap: any;
    }
}
