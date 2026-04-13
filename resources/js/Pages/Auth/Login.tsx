import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-sans relative overflow-hidden transition-colors">
            <Head title="Log in" />

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl shadow-indigo-500/10 dark:shadow-none border border-white/20 dark:border-slate-700/50 h-auto md:h-[500px] relative z-10 transition-colors">
                {/* Left Side - Welcome Panel */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-10 md:p-14 flex flex-col justify-center items-center text-center text-white rounded-t-[2rem] md:rounded-tr-none md:rounded-l-[2rem] relative isolate">
                    {/* Decorative blobs inside left panel */}
                    <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

                    <img src="/images/login-img.png" alt="SALIRA Logo" className="h-20 w-auto mb-6 relative z-10 drop-shadow-xl" />
                    <h1 className="text-3xl md:text-4xl font-black mb-3 relative z-10 tracking-tight">SALIRA</h1>
                    <p className="text-xs font-bold mb-10 max-w-[280px] leading-relaxed relative z-10 text-indigo-100 uppercase tracking-widest">
                        Sistem Absensi, Logistik, Inventaris, <br /> & Rekapitulasi Akademik
                    </p>
                    <Link
                        href={route('register')}
                        className="border border-white/50 text-white hover:bg-white hover:text-indigo-700 transition-colors rounded-xl px-12 py-3 font-bold text-xs uppercase tracking-wider relative z-10 backdrop-blur-sm"
                    >
                        DAFTAR GURU / STAFF
                    </Link>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white dark:bg-slate-800 rounded-b-[2rem] md:rounded-bl-none md:rounded-r-[2rem] transition-colors">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 transition-colors">Sign In</h2>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col gap-5">
                        <div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-20 px-4 py-3 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all shadow-sm"
                                autoComplete="username"
                                placeholder="Email"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-20 px-4 py-3 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all shadow-sm"
                                autoComplete="current-password"
                                placeholder="Password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between mt-1">
                            <label className="flex items-center cursor-pointer group">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    className="text-indigo-600 focus:ring-indigo-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded-md w-4 h-4 transition-colors"
                                    onChange={(e) =>
                                        setData(
                                            'remember',
                                            (e.target.checked || false) as false,
                                        )
                                    }
                                />
                                <span className="ms-3 text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                                    Remember me
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline decoration-1 underline-offset-[3px] transition-colors font-medium"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <div className="mt-6 flex justify-start">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-12 py-3 font-bold text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg shadow-indigo-600/30"
                            >
                                LOGIN
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
