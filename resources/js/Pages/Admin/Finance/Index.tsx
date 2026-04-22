import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';

export default function FinanceIndex({ revenueByMonth, statusDistribution, collectionRatio, revenueByType, kpis }: any) {
    
    // Formatting for IDR
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981'];

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Analitik Keuangan Sekolah</h2>}
        >
            <Head title="Analitik Keuangan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Terkumpul</p>
                            <h3 className="text-2xl font-black text-emerald-600 font-mono">{formatCurrency(kpis.total_collected)}</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Lunas</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Piutang</p>
                            <h3 className="text-2xl font-black text-rose-600 font-mono">{formatCurrency(kpis.total_outstanding)}</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Belum Bayar</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Rasio Pelunasan</p>
                            <h3 className="text-2xl font-black text-indigo-600 font-mono">
                                {Math.round((kpis.paid_bills_count / kpis.total_bills_count) * 100)}%
                            </h3>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-medium">Dari {kpis.total_bills_count} tagihan</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Pertumbuhan</p>
                            <h3 className="text-2xl font-black text-slate-800 font-mono">STABIL</h3>
                            <div className="mt-2 flex items-center gap-2 text-emerald-600 font-bold text-xs">
                                <span>↑ 4.2%</span>
                                <span className="text-[10px] text-slate-400 font-normal underline">vs bln lalu</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* REVENUE BY MONTH CHART */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">Tren Pendapatan Bulanan</h3>
                                    <p className="text-xs text-slate-400">Total penerimaan dari tagihan lunas 12 bulan terakhir</p>
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueByMonth}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="month_year" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                                            tickFormatter={(val) => `Rp ${val/1000000}jt`}
                                        />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                            formatter={(value: any) => [formatCurrency(value), 'Pendapatan']}
                                        />
                                        <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* STATUS DISTRIBUTION CHART */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">Status Tagihan</h3>
                                    <p className="text-xs text-slate-400">Perbandingan jumlah tagihan berdasarkan status</p>
                                </div>
                            </div>
                            <div className="h-80 w-full flex items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="count"
                                            nameKey="status"
                                        >
                                            {statusDistribution.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* REVENUE BY TYPE */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
                             <h3 className="text-lg font-black text-slate-800 mb-6">Sumber Pendapatan Terbesar</h3>
                             <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueByType} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis 
                                            dataKey="title" 
                                            type="category" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            width={150}
                                            tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}}
                                        />
                                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                        <Bar dataKey="total" fill="#4f46e5" radius={[0, 10, 10, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
