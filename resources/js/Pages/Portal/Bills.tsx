import { Head, Link } from '@inertiajs/react';
import PortalLayout from '@/Layouts/PortalLayout';

export default function PortalBills({ bills, student, finance_contact }: any) {
    const unpaidBills = bills.filter((b: any) => b.status !== 'paid');
    const paidBills = bills.filter((b: any) => b.status === 'paid');

    const totalTunggakan = unpaidBills.reduce((acc: number, bill: any) => acc + parseFloat(bill.amount), 0);

    const waLink = finance_contact 
        ? `https://wa.me/${finance_contact}?text=${encodeURIComponent(`Halo Admin Keuangan Salira, saya ingin bertanya mengenai tagihan siswa atas nama ${student.name}`)}`
        : '#';

    return (
        <PortalLayout
            header={<h2 className="font-semibold text-2xl text-slate-800 leading-tight">Keuangan & Tagihan</h2>}
        >
            <Head title="Keuangan Siswa" />

            <div className="space-y-8">
                
                {/* FINANCIAL SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-[2rem] p-8 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <p className="text-rose-100 text-xs font-black uppercase tracking-widest mb-1">Total Tunggakan</p>
                        <h3 className="text-3xl font-black mb-1">Rp {new Intl.NumberFormat('id-ID').format(totalTunggakan)}</h3>
                        <p className="text-rose-100/80 text-[10px] font-bold italic">Berdasarkan data tagihan aktif</p>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Tagihan Belum Lunas</p>
                        <h3 className="text-3xl font-black text-slate-800">{unpaidBills.length} <span className="text-sm font-bold text-slate-400">Invoice</span></h3>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Riwayat Lunas</p>
                        <h3 className="text-3xl font-black text-emerald-600">{paidBills.length} <span className="text-sm font-bold text-slate-400">Invoice</span></h3>
                    </div>
                </div>

                {/* MAIN BILLS LIST */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                        <div>
                            <h4 className="text-xl font-bold text-slate-800">Daftar Rincian Tagihan</h4>
                            <p className="text-sm text-slate-500 mt-1">Gunakan nomor invoice sebagai referensi konfirmasi pembayaran.</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
                                Filter: Semua Status
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead>
                                <tr className="bg-slate-50/30">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deskripsi Tagihan</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nominal</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Opsi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-50">
                                {bills.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={2}/></svg>
                                                </div>
                                                <p className="text-slate-400 font-bold text-sm">Belum ada data tagihan tertulis.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    bills.map((bill: any) => (
                                        <tr key={bill.id} className="group hover:bg-slate-50/80 transition-all duration-200">
                                            <td className="px-8 py-6">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth={2}/></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-blue-600 uppercase tracking-wider mb-0.5">{bill.bill_number}</p>
                                                        <p className="text-base font-bold text-slate-800">{bill.title}</p>
                                                        <p className="text-xs font-semibold text-slate-400 mt-1">Periode: {bill.month} / {bill.year}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-lg font-black text-slate-800 leading-none">Rp {new Intl.NumberFormat('id-ID').format(bill.amount)}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Biaya Administrasi</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                {bill.status === 'paid' ? (
                                                    <div className="inline-flex flex-col">
                                                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl uppercase tracking-widest border border-emerald-100">
                                                            Terbayar Lunas
                                                        </span>
                                                        <span className="text-[9px] font-bold text-emerald-500 mt-1 ml-1 uppercase">
                                                            {new Date(bill.paid_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                        </span>
                                                    </div>
                                                ) : bill.status === 'pending' ? (
                                                    <span className="px-4 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-xl uppercase tracking-widest border border-amber-100">
                                                        Diproses
                                                    </span>
                                                ) : (
                                                    <span className="px-4 py-1.5 bg-rose-50 text-rose-700 text-[10px] font-black rounded-xl uppercase tracking-widest border border-rose-100">
                                                        Menunggu
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link 
                                                    href={route('invoice.show', bill.bill_number)}
                                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                                                        bill.status === 'paid' 
                                                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 shadow-lg'
                                                    }`}
                                                >
                                                    {bill.status === 'paid' ? 'Detail Kuitansi' : 'Bayar Sekarang'}
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div>
                            <h4 className="text-2xl font-black mb-2">Butuh bantuan pembayaran?</h4>
                            <p className="text-indigo-200 text-sm max-w-md">Jika Anda mengalami kendala saat melakukan transaksi, silakan hubungi bagian administrasi keuangan melalui tombol bantuan di bawah ini.</p>
                        </div>
                        <a 
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-colors shadow-xl flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            Hubungi Admin Keuangan
                        </a>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
}
