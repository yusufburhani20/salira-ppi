import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Plus, List, Settings } from 'lucide-react';

export default function FinanceIndex({ 
    revenueByMonth, 
    expensesByMonth, 
    statusDistribution, 
    collectionRatio, 
    revenueByCategory, 
    expenseByCategory, 
    kpis 
}: any) {
    
    // Formatting for IDR
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    // Merge revenue and expenses for the trend chart
    const combinedTrend = revenueByMonth.map((rev: any) => {
        const exp = expensesByMonth.find((e: any) => e.month_year === rev.month_year);
        return {
            month_year: rev.month_year,
            pemasukan: parseFloat(rev.total),
            pengeluaran: exp ? parseFloat(exp.total) : 0
        };
    });

    const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard Keuangan Akademik</h2>
                    <div className="flex gap-2">
                        <Link href={route('admin.finance.categories.index')} className="bg-white text-slate-600 px-4 py-2 rounded-xl text-xs font-black border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
                            <Settings size={14} /> Kategori
                        </Link>
                        <Link href={route('admin.finance.expenses.index')} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-100">
                            <Plus size={14} /> Catat Pengeluaran
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Keuangan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                                <TrendingUp size={64} className="text-emerald-600" />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
                            <h3 className="text-2xl font-black text-emerald-600 font-mono">{formatCurrency(kpis.total_collected)}</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Lunas</span>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                                <TrendingDown size={64} className="text-rose-600" />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Pengeluaran</p>
                            <h3 className="text-2xl font-black text-rose-600 font-mono">{formatCurrency(kpis.total_expenses)}</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">Operasional</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                                <Wallet size={64} className="text-indigo-600" />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Kas Saat Ini</p>
                            <h3 className={`text-2xl font-black font-mono ${kpis.cash_balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                                {formatCurrency(kpis.cash_balance)}
                            </h3>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold underline">Net Balance</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                                <CreditCard size={64} className="text-amber-600" />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Piutang</p>
                            <h3 className="text-2xl font-black text-amber-600 font-mono">{formatCurrency(kpis.total_outstanding)}</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Belum Bayar</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* CASH FLOW TREND CHART */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Tren Arus Kas (Pendapatan vs Pengeluaran)</h3>
                                    <p className="text-xs text-slate-400 font-medium">Perbandingan performa keuangan 12 bulan terakhir</p>
                                </div>
                            </div>
                            <div className="h-96 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={combinedTrend}>
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
                                            contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                                            formatter={(value: any) => formatCurrency(value)}
                                        />
                                        <Legend verticalAlign="top" align="right" height={36}/>
                                        <Bar dataKey="pemasukan" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} name="Pendapatan" />
                                        <Bar dataKey="pengeluaran" fill="#ef4444" radius={[10, 10, 0, 0]} barSize={40} name="Pengeluaran" />
                                        <Line type="monotone" dataKey="pemasukan" stroke="#059669" strokeWidth={3} dot={{r: 4}} name="Trend Pendapatan" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* REVENUE BY CATEGORY PIE CHART */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 mb-6 text-center">Distribusi Pendapatan</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={revenueByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="total"
                                            nameKey="name"
                                        >
                                            {revenueByCategory.map((entry: any, index: number) => (
                                                <Cell key={`cell-rev-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* EXPENSE BY CATEGORY PIE CHART */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 mb-6 text-center">Distribusi Pengeluaran</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="total"
                                            nameKey="name"
                                        >
                                            {expenseByCategory.map((entry: any, index: number) => (
                                                <Cell key={`cell-exp-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
