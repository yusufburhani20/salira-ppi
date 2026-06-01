import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';

export default function PortalLogin() {
    const { data, setData, post, processing, errors, reset } = useForm({
        nisn: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e: any) => {
        e.preventDefault();
        post(route('portal.login'));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex items-center justify-center p-4">
            <Head title="Login Portal Siswa" />

            <div className="max-w-4xl w-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden flex flex-col md:flex-row relative z-10 transition-colors duration-300">

                {/* Left Side - Illustration (hidden on mobile) */}
                <div className="hidden md:flex w-full md:w-1/2 bg-blue-600 p-10 md:p-14 flex flex-col justify-center items-start text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

                    <h1 className="text-3xl md:text-4xl font-black mb-3 relative z-10 tracking-tight">PORTAL SALIRA</h1>
                    <p className="text-sm font-semibold mb-6 max-w-[280px] leading-relaxed relative z-10 text-blue-100 tracking-wider">
                        Masuk untuk memantau absensi, tagihan, dan perkembangan Peserta Didik.
                    </p>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 relative z-10 mb-6">
                        <p className="text-xs text-blue-50 font-medium">Bagi login pertama, gunakan <strong className="text-white">NISN</strong> sebagai Username dan <strong className="text-white">Format DDMMYYYY tanggal lahir</strong> (atau <strong className="text-white">123456</strong> jika kosong) sebagai Sandi.</p>
                    </div>

                    <div className="relative z-10 mb-8 flex flex-col gap-3 w-full">
                        <Link
                            href={route('portal.attendance.scanner')}
                            className="flex items-center justify-center gap-3 w-full bg-white text-blue-700 hover:bg-blue-50 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            Absensi Scanner (Tapping)
                        </Link>
                    </div>

                    <a
                        href="/login"
                        className="text-blue-100 hover:text-white underline text-xs font-semibold tracking-wider relative z-10"
                    >
                        ← KEMBALI KE PORTAL GURU
                    </a>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white dark:bg-slate-800 transition-colors">
                    {/* Compact logo for mobile view only */}
                    <div className="flex flex-col items-center md:hidden mb-6 text-center">
                        <img src="/images/Salira.png" alt="SALIRA Logo" className="h-14 w-auto mb-2 drop-shadow-md" />
                        <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">PORTAL SALIRA</h1>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                            Portal Siswa & Wali Murid
                        </p>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 hidden md:block">Sign In Siswa/Wali Murid</h2>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 md:hidden text-center">Sign In</h2>

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div>
                            <input
                                id="nisn"
                                type="text"
                                name="nisn"
                                value={data.nisn}
                                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-20 px-4 py-3 placeholder-slate-400 dark:placeholder-slate-500 text-base transition-all shadow-sm"
                                placeholder="NISN Siswa"
                                onChange={(e) => setData('nisn', e.target.value)}
                                required
                            />
                            <InputError message={errors.nisn} className="mt-2" />
                        </div>

                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-blue-600 focus:ring focus:ring-blue-600 focus:ring-opacity-20 px-4 py-3 placeholder-slate-400 dark:placeholder-slate-500 text-base transition-all shadow-sm"
                                placeholder="Password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="mt-6 flex justify-start">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-12 py-3.5 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg shadow-blue-600/30"
                            >
                                MASUK
                            </button>
                        </div>
                    </form>

                    {/* Mobile-only PWA Shortcuts */}
                    <div className="mt-6 flex flex-col gap-3 md:hidden">
                        <div className="text-center mb-4 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-white dark:bg-slate-800 px-3 text-slate-400">Atau</span>
                            </div>
                        </div>

                        <Link
                            href={route('portal.attendance.scanner')}
                            className="flex items-center justify-center gap-3 w-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 00-1 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            Absensi Scanner (Tapping)
                        </Link>

                        <a
                            href="/login"
                            className="text-center text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold tracking-wider py-2 mt-2"
                        >
                            ← KEMBALI KE PORTAL GURU
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
