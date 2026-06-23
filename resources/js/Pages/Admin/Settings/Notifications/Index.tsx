import { PageProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useEffect, Fragment } from 'react';
import { Tab } from '@headlessui/react';
import { Cog6ToothIcon, DevicePhoneMobileIcon, EnvelopeIcon, PaperAirplaneIcon, CheckCircleIcon, XCircleIcon, BellIcon } from '@heroicons/react/24/outline';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

interface Settings {
    [key: string]: boolean | string;
}

interface Subscriber {
    id: number;
    name: string;
    email_or_nisn: string;
    type: 'Pegawai' | 'Siswa';
    role_or_class: string;
    devices_count: number;
    last_active: string;
}

export default function NotificationSettings({ auth, settings, bot_username, user_subscriptions_count, student_subscriptions_count, available_roles, subscribers = [] }: PageProps<{ settings: Settings, bot_username: string, user_subscriptions_count: number, student_subscriptions_count: number, available_roles: string[], subscribers?: Subscriber[] }>) {
    const [waStatus, setWaStatus] = useState<string>('checking...');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [waInfo, setWaInfo] = useState<any>(null);

    // Form for Master Switches and Matrix
    const { data: matrixData, setData: setMatrixData, post: postMatrix, processing: processingMatrix } = useForm({
        notif_channel_email: settings.notif_channel_email as boolean,
        notif_channel_telegram: settings.notif_channel_telegram as boolean,
        notif_channel_whatsapp: settings.notif_channel_whatsapp as boolean,
        notif_channel_webpush: settings.notif_channel_webpush as boolean,
        notif_bill_generated_email: settings.notif_bill_generated_email as boolean,
        notif_bill_generated_telegram: settings.notif_bill_generated_telegram as boolean,
        notif_bill_generated_whatsapp: settings.notif_bill_generated_whatsapp as boolean,
        notif_bill_generated_webpush: settings.notif_bill_generated_webpush as boolean,
        notif_bill_paid_email: settings.notif_bill_paid_email as boolean,
        notif_bill_paid_telegram: settings.notif_bill_paid_telegram as boolean,
        notif_bill_paid_whatsapp: settings.notif_bill_paid_whatsapp as boolean,
        notif_bill_paid_webpush: settings.notif_bill_paid_webpush as boolean,
        notif_absence_email: settings.notif_absence_email as boolean,
        notif_absence_telegram: settings.notif_absence_telegram as boolean,
        notif_absence_whatsapp: settings.notif_absence_whatsapp as boolean,
        notif_absence_webpush: settings.notif_absence_webpush as boolean,
        notif_permission_req_email: settings.notif_permission_req_email as boolean,
        notif_permission_req_telegram: settings.notif_permission_req_telegram as boolean,
        notif_permission_req_whatsapp: settings.notif_permission_req_whatsapp as boolean,
        notif_permission_req_webpush: settings.notif_permission_req_webpush as boolean,
        notif_permission_status_email: settings.notif_permission_status_email as boolean,
        notif_permission_status_telegram: settings.notif_permission_status_telegram as boolean,
        notif_permission_status_whatsapp: settings.notif_permission_status_whatsapp as boolean,
        notif_permission_status_webpush: settings.notif_permission_status_webpush as boolean,
        notif_announcement_email: settings.notif_announcement_email as boolean,
        notif_announcement_telegram: settings.notif_announcement_telegram as boolean,
        notif_announcement_whatsapp: settings.notif_announcement_whatsapp as boolean,
        notif_announcement_webpush: settings.notif_announcement_webpush as boolean,
        notif_student_report_email: settings.notif_student_report_email as boolean,
        notif_student_report_telegram: settings.notif_student_report_telegram as boolean,
        notif_student_report_whatsapp: settings.notif_student_report_whatsapp as boolean,
        notif_student_report_webpush: settings.notif_student_report_webpush as boolean,
        attendance_alert_enabled: settings.attendance_alert_enabled as boolean,
        attendance_alert_time: settings.attendance_alert_time as string,
        user_attendance_reminder_enabled: settings.user_attendance_reminder_enabled as boolean,
        user_attendance_reminder_time_in: settings.user_attendance_reminder_time_in as string,
        user_attendance_reminder_time_out: settings.user_attendance_reminder_time_out as string,
    });

    // Form for Templates
    const { data: tplData, setData: setTplData, post: postTpl, processing: processingTpl } = useForm({
        tpl_wa_bill_generated: settings.tpl_wa_bill_generated as string,
        tpl_wa_bill_paid: settings.tpl_wa_bill_paid as string,
        tpl_wa_absence: settings.tpl_wa_absence as string,
        tpl_wa_permission_req: settings.tpl_wa_permission_req as string,
        tpl_wa_permission_status: settings.tpl_wa_permission_status as string,
        tpl_wa_announcement: settings.tpl_wa_announcement as string,
        tpl_wa_student_report: settings.tpl_wa_student_report as string,
        tpl_tg_bill_generated: settings.tpl_tg_bill_generated as string,
        tpl_tg_bill_paid: settings.tpl_tg_bill_paid as string,
        tpl_tg_absence: settings.tpl_tg_absence as string,
        tpl_tg_permission_req: settings.tpl_tg_permission_req as string,
        tpl_tg_permission_status: settings.tpl_tg_permission_status as string,
        tpl_tg_announcement: settings.tpl_tg_announcement as string,
        tpl_tg_student_report: settings.tpl_tg_student_report as string,
    });

    // Form for Test Sending
    const { data: testData, setData: setTestData, post: postTest, processing: processingTest, reset: resetTest } = useForm({
        channel: 'whatsapp',
        target: '',
    });

    // Form for Broadcast Push
    const { data: broadcastData, setData: setBroadcastData, post: postBroadcast, processing: processingBroadcast, reset: resetBroadcast } = useForm({
        target: 'all',
        title: '',
        body: '',
        action_url: '/dashboard',
    });

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await axios.get(route('admin.settings.whatsapp-status'));
                setWaStatus(response.data.status);
                setQrCode(response.data.qr || null);
                setWaInfo(response.data);
            } catch (error) {
                setWaStatus('offline');
                setQrCode(null);
                setWaInfo(null);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const submitMatrix = () => {
        postMatrix(route('admin.settings.notifications.matrix'));
    };

    const submitTpl = () => {
        postTpl(route('admin.settings.notifications.templates'));
    };

    const submitTest = (e: React.FormEvent) => {
        e.preventDefault();
        postTest(route('admin.settings.notifications.test'), {
            onSuccess: () => resetTest('target'),
        });
    };

    const submitBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm(`Apakah Anda yakin ingin mengirim push notifikasi broadcast ke target "${broadcastData.target}"?`)) {
            postBroadcast(route('admin.settings.notifications.broadcast'), {
                onSuccess: () => {
                    resetBroadcast('title', 'body');
                }
            });
        }
    };

    const formatUptime = (seconds: number) => {
        if (!seconds) return '0s';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + 'j ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
    };

    const classNames = (...classes: string[]) => classes.filter(Boolean).join(' ');

    const notificationTypes = [
        { label: 'Tagihan Baru (SPP)', key: 'bill_generated' },
        { label: 'Tagihan Lunas', key: 'bill_paid' },
        { label: 'Peringatan Absensi Pagi', key: 'absence' },
        { label: 'Pengajuan Izin Baru (Admin)', key: 'permission_req' },
        { label: 'Status Izin Diperbarui (Guru)', key: 'permission_status' },
        { label: 'Pengumuman Penting', key: 'announcement' },
        { label: 'Laporan Siswa', key: 'student_report' },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pusat Pengaturan Notifikasi</h2>}>
            <Head title="Pengaturan Notifikasi" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <Tab.Group>
                            <Tab.List className="flex space-x-1 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 p-2 m-4 border border-gray-100 dark:border-gray-700">
                                {['Koneksi & Master Switch', 'Matriks Distribusi', 'Template Pesan Telegram & WA', 'Broadcast Push Notifikasi'].map((category) => (
                                    <Tab
                                        key={category}
                                        className={({ selected }) =>
                                            classNames(
                                                'w-full rounded-lg py-3 text-sm font-bold leading-5',
                                                'ring-white/60 ring-offset-2 ring-offset-primary focus:outline-none focus:ring-2 transition-all',
                                                selected
                                                    ? 'bg-white text-primary shadow-sm dark:bg-gray-800 dark:text-indigo-400'
                                                    : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-white'
                                            )
                                        }
                                    >
                                        {category}
                                    </Tab>
                                ))}
                            </Tab.List>

                            <Tab.Panels className="mt-2">
                                {/* TAB 1: Koneksi & Master Switch */}
                                <Tab.Panel className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                        {/* Email Card */}
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                                            <EnvelopeIcon className="w-12 h-12 text-blue-500 mb-4" />
                                            <h3 className="text-lg font-bold mb-2">Email SMTP</h3>
                                            <label className="relative inline-flex items-center cursor-pointer mb-4">
                                                <input type="checkbox" checked={matrixData.notif_channel_email} onChange={(e) => setMatrixData('notif_channel_email', e.target.checked)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{matrixData.notif_channel_email ? 'Aktif' : 'Nonaktif'}</span>
                                            </label>
                                            <p className="text-xs text-gray-500">Konfigurasi di file .env (MAIL_HOST dll)</p>
                                        </div>
 
                                        {/* Telegram Card */}
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                                            <PaperAirplaneIcon className="w-12 h-12 text-sky-500 mb-4" />
                                            <h3 className="text-lg font-bold mb-2">Telegram Bot</h3>
                                            <label className="relative inline-flex items-center cursor-pointer mb-4">
                                                <input type="checkbox" checked={matrixData.notif_channel_telegram} onChange={(e) => setMatrixData('notif_channel_telegram', e.target.checked)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{matrixData.notif_channel_telegram ? 'Aktif' : 'Nonaktif'}</span>
                                            </label>
                                            <p className="text-xs text-gray-500">Bot aktif: @{bot_username}</p>
                                        </div>
 
                                        {/* WhatsApp Card */}
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                                            <DevicePhoneMobileIcon className="w-12 h-12 text-[#25D366] mb-4" />
                                            <h3 className="text-lg font-bold mb-2">WhatsApp Gateway</h3>
                                            <label className="relative inline-flex inline-flex items-center cursor-pointer mb-4">
                                                <input type="checkbox" checked={matrixData.notif_channel_whatsapp} onChange={(e) => setMatrixData('notif_channel_whatsapp', e.target.checked)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#25D366]"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{matrixData.notif_channel_whatsapp ? 'Aktif' : 'Nonaktif'}</span>
                                            </label>
                                            <div className="text-xs font-bold flex items-center justify-center gap-1 mt-1">
                                                Status: 
                                                <span className={`capitalize ${waStatus === 'connected' ? 'text-green-500' : 'text-red-500'}`}>{waStatus}</span>
                                            </div>
                                        </div>

                                        {/* Web Push Card */}
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
                                            <BellIcon className="w-12 h-12 text-indigo-500 mb-4" />
                                            <h3 className="text-lg font-bold mb-2">Push Notifikasi</h3>
                                            <label className="relative inline-flex items-center cursor-pointer mb-4">
                                                <input type="checkbox" checked={matrixData.notif_channel_webpush} onChange={(e) => setMatrixData('notif_channel_webpush', e.target.checked)} className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{matrixData.notif_channel_webpush ? 'Aktif' : 'Nonaktif'}</span>
                                            </label>
                                            <p className="text-xs text-gray-500">Push Notifikasi Web (PWA)</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 mb-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                                                    <Cog6ToothIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Polisi Absensi Otomatis</h4>
                                                    <p className="text-xs text-slate-500">Kirim peringatan otomatis ke wali jika siswa belum scan kehadiran.</p>
                                                </div>
                                            </div>
                                            <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                                                onClick={() => setMatrixData('attendance_alert_enabled', !matrixData.attendance_alert_enabled)}
                                                style={{ backgroundColor: matrixData.attendance_alert_enabled ? '#4f46e5' : '#d1d5db' }}
                                            >
                                                <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                                    style={{ transform: matrixData.attendance_alert_enabled ? 'translateX(20px)' : 'translateX(0px)' }}
                                                />
                                            </div>
                                        </div>
 
                                        {matrixData.attendance_alert_enabled && (
                                            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4">
                                                <label className="block font-bold text-slate-700 dark:text-slate-300 text-sm">Jam Pengiriman Notifikasi:</label>
                                                <input 
                                                    type="time"
                                                    value={matrixData.attendance_alert_time}
                                                    onChange={e => setMatrixData('attendance_alert_time', e.target.value)}
                                                    className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white font-bold text-sm"
                                                />
                                                <p className="text-[10px] text-slate-400">Sistem akan memindai siswa yang belum hadir pada jam ini.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Staff Push Notification Attendance Reminders Card */}
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 mb-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                                                    <BellIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Pengingat Absensi Guru & Pegawai (Web Push)</h4>
                                                    <p className="text-xs text-slate-500">Kirim pengingat check-in (pagi) dan check-out (sore) ke Guru/Pegawai yang belum absensi.</p>
                                                </div>
                                            </div>
                                            <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                                                onClick={() => setMatrixData('user_attendance_reminder_enabled', !matrixData.user_attendance_reminder_enabled)}
                                                style={{ backgroundColor: matrixData.user_attendance_reminder_enabled ? '#4f46e5' : '#d1d5db' }}
                                            >
                                                <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                                                    style={{ transform: matrixData.user_attendance_reminder_enabled ? 'translateX(20px)' : 'translateX(0px)' }}
                                                />
                                            </div>
                                        </div>
 
                                        {matrixData.user_attendance_reminder_enabled && (
                                            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3">
                                                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-sm whitespace-nowrap">Jam Check-in (Pagi):</label>
                                                    <input 
                                                        type="time"
                                                        value={matrixData.user_attendance_reminder_time_in}
                                                        onChange={e => setMatrixData('user_attendance_reminder_time_in', e.target.value)}
                                                        className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-sm whitespace-nowrap">Jam Check-out (Sore):</label>
                                                    <input 
                                                        type="time"
                                                        value={matrixData.user_attendance_reminder_time_out}
                                                        onChange={e => setMatrixData('user_attendance_reminder_time_out', e.target.value)}
                                                        className="rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white font-bold text-sm"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end mb-8">
                                        <button onClick={submitMatrix} disabled={processingMatrix} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 transition-colors">
                                            {processingMatrix ? 'Menyimpan...' : 'Simpan Master Switch'}
                                        </button>
                                    </div>

                                    <hr className="my-8 border-gray-200 dark:border-gray-700" />

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* WhatsApp QR Code Section */}
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-lg flex items-center gap-2"><DevicePhoneMobileIcon className="w-5 h-5 text-[#25D366]" /> Manajemen WhatsApp Gateway</h4>
                                                <button 
                                                    onClick={() => {
                                                        if(confirm('Apakah Anda yakin ingin me-restart koneksi WhatsApp? Sesi sebelumnya akan dihapus dan Anda perlu scan QR Code baru.')) {
                                                            router.post(route('admin.settings.whatsapp-restart'), {}, { preserveScroll: true });
                                                        }
                                                    }}
                                                    className="text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg font-bold transition-colors text-rose-600 dark:text-rose-400 shadow-sm"
                                                >
                                                    Restart Gateway
                                                </button>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                                <div className="flex-shrink-0 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mx-auto sm:mx-0">
                                                    {qrCode ? (
                                                        <QRCodeCanvas value={qrCode} size={150} level="M" />
                                                    ) : waStatus === 'connected' ? (
                                                        <div className="w-[150px] h-[150px] flex items-center justify-center bg-green-50 rounded-xl">
                                                            <div className="text-center">
                                                                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                                                <span className="font-bold text-green-700 text-sm">Terhubung</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-[150px] h-[150px] flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                                            <span className="text-gray-400 text-xs font-medium animate-pulse text-center px-4">Memeriksa Layanan Gateway...</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 w-full space-y-4">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {waStatus === 'connected' ? (
                                                            <p className="font-medium text-slate-800 dark:text-slate-200">Sistem notifikasi WhatsApp sudah aktif. Pesan akan dikirim otomatis.</p>
                                                        ) : waStatus === 'disconnected' && qrCode ? (
                                                            <p className="font-medium text-slate-800 dark:text-slate-200">Buka WA &gt; Perangkat Tertaut &gt; Tautkan Perangkat.</p>
                                                        ) : (
                                                            <p className="italic text-gray-400">Menghubungkan ke service Node.js di port 3000...</p>
                                                        )}
                                                    </div>

                                                    {waInfo && (
                                                        <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-wider font-bold">
                                                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                                                <span className="block text-slate-400 mb-0.5">Uptime</span>
                                                                <span className="text-slate-700 dark:text-slate-300">{formatUptime(waInfo.uptime)}</span>
                                                            </div>
                                                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                                                <span className="block text-slate-400 mb-0.5">Memory (RSS)</span>
                                                                <span className="text-slate-700 dark:text-slate-300">{waInfo.memory?.rss || '-'}</span>
                                                            </div>
                                                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                                                <span className="block text-slate-400 mb-0.5">Versi Gateway</span>
                                                                <span className="text-slate-700 dark:text-slate-300">{waInfo.version}</span>
                                                            </div>
                                                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                                                <span className="block text-slate-400 mb-0.5">Status Proses</span>
                                                                <span className="text-green-500">Active (PM2)</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>


                                        {/* Test Send Section */}
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-700">
                                            <h4 className="font-bold text-lg mb-4">Uji Coba Pengiriman</h4>
                                            <form onSubmit={submitTest} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Pilih Kanal</label>
                                                    <select value={testData.channel} onChange={e => setTestData('channel', e.target.value)} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                                        <option value="whatsapp">WhatsApp</option>
                                                        <option value="telegram">Telegram</option>
                                                        <option value="email">Email</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Tujuan (Nomor HP / Chat ID / Email)</label>
                                                    <input type="text" value={testData.target} onChange={e => setTestData('target', e.target.value)} placeholder={testData.channel === 'whatsapp' ? '628xxx...' : testData.channel === 'telegram' ? 'Telegram ID' : 'admin@domain.com'} className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
                                                </div>
                                                <button type="submit" disabled={processingTest} className="w-full bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50">
                                                    {processingTest ? 'Mengirim...' : 'Kirim Pesan Test'}
                                                </button>
                                                {testData.channel === 'telegram' && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400 italic">Pastikan ID tujuan pernah /start ke bot @{bot_username}</p>
                                                )}
                                            </form>
                                        </div>
                                    </div>
                                </Tab.Panel>

                                {/* TAB 2: Matriks Distribusi */}
                                <Tab.Panel className="p-6">
                                    <div className="mb-6 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold">Matriks Distribusi</h3>
                                            <p className="text-sm text-gray-500">Centang kanal pengiriman yang ingin diaktifkan untuk setiap jenis notifikasi.</p>
                                        </div>
                                        <button onClick={submitMatrix} disabled={processingMatrix} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 transition-colors">
                                            {processingMatrix ? 'Menyimpan...' : 'Simpan Matriks'}
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                                <tr>
                                                    <th className="p-4 font-semibold">Jenis Notifikasi</th>
                                                    <th className="p-4 font-semibold text-center text-blue-600 dark:text-blue-400">Email</th>
                                                    <th className="p-4 font-semibold text-center text-sky-600 dark:text-sky-400">Telegram</th>
                                                    <th className="p-4 font-semibold text-center text-green-600 dark:text-green-400">WhatsApp</th>
                                                    <th className="p-4 font-semibold text-center text-indigo-600 dark:text-indigo-400">Web Push</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {notificationTypes.map((type) => (
                                                    <tr key={type.key} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                        <td className="p-4 font-medium text-gray-900 dark:text-gray-200">{type.label}</td>
                                                        <td className="p-4 text-center">
                                                            <input type="checkbox" checked={matrixData[`notif_${type.key}_email` as keyof typeof matrixData] as boolean} onChange={e => setMatrixData(`notif_${type.key}_email` as keyof typeof matrixData, e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <input type="checkbox" checked={matrixData[`notif_${type.key}_telegram` as keyof typeof matrixData] as boolean} onChange={e => setMatrixData(`notif_${type.key}_telegram` as keyof typeof matrixData, e.target.checked)} className="w-5 h-5 text-sky-600 rounded border-gray-300 focus:ring-sky-500" />
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <input type="checkbox" checked={matrixData[`notif_${type.key}_whatsapp` as keyof typeof matrixData] as boolean} onChange={e => setMatrixData(`notif_${type.key}_whatsapp` as keyof typeof matrixData, e.target.checked)} className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <input type="checkbox" checked={matrixData[`notif_${type.key}_webpush` as keyof typeof matrixData] as boolean} onChange={e => setMatrixData(`notif_${type.key}_webpush` as keyof typeof matrixData, e.target.checked)} className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Tab.Panel>

                                {/* TAB 3: Template Pesan */}
                                <Tab.Panel className="p-6">
                                    <div className="mb-6 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold">Template Pesan</h3>
                                            <p className="text-sm text-gray-500">Gunakan placeholder seperti <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-indigo-500">[NAMA_SISWA]</code> agar teks diganti otomatis.</p>
                                        </div>
                                        <button onClick={submitTpl} disabled={processingTpl} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50 transition-colors">
                                            {processingTpl ? 'Menyimpan...' : 'Simpan Template'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                        <div className="space-y-8">
                                            <h4 className="font-bold flex items-center gap-2 text-green-600 border-b pb-2"><DevicePhoneMobileIcon className="w-5 h-5"/> Template WhatsApp</h4>
                                            {notificationTypes.map((type) => (
                                                <div key={`wa_${type.key}`}>
                                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{type.label}</label>
                                                    <textarea 
                                                        rows={4} 
                                                        value={tplData[`tpl_wa_${type.key}` as keyof typeof tplData] as string} 
                                                        onChange={e => setTplData(`tpl_wa_${type.key}` as keyof typeof tplData, e.target.value)}
                                                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-8">
                                            <h4 className="font-bold flex items-center gap-2 text-sky-600 border-b pb-2"><PaperAirplaneIcon className="w-5 h-5"/> Template Telegram</h4>
                                            <p className="text-xs text-gray-500 -mt-6">Mendukung format HTML dasar seperti &lt;b&gt;, &lt;i&gt;, &lt;a href=""&gt;</p>
                                            {notificationTypes.map((type) => (
                                                <div key={`tg_${type.key}`}>
                                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{type.label}</label>
                                                    <textarea 
                                                        rows={4} 
                                                        value={tplData[`tpl_tg_${type.key}` as keyof typeof tplData] as string} 
                                                        onChange={e => setTplData(`tpl_tg_${type.key}` as keyof typeof tplData, e.target.value)}
                                                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                                        <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Panduan Placeholder yang Tersedia:</h5>
                                        <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-400 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                            <li><code className="font-bold">[NAMA_SISWA]</code>: Nama Lengkap Siswa</li>
                                            <li><code className="font-bold">[NAMA_TAGIHAN]</code>: Judul Tagihan SPP</li>
                                            <li><code className="font-bold">[NOMINAL]</code>: Nominal Uang (Rp X.XXX)</li>
                                            <li><code className="font-bold">[LINK_INVOICE]</code>: Link Kuitansi/Bayar</li>
                                            <li><code className="font-bold">[WAKTU]</code>: Waktu / Jam</li>
                                            <li><code className="font-bold">[LINK_PORTAL]</code>: Link Login Portal Siswa</li>
                                            <li><code className="font-bold">[NAMA_ADMIN]</code>: Nama Admin</li>
                                            <li><code className="font-bold">[NAMA_PEMOHON]</code>: Nama Pengaju Izin</li>
                                            <li><code className="font-bold">[TIPE_IZIN]</code>: Sakit/Izin/Cuti</li>
                                            <li><code className="font-bold">[ALASAN]</code>: Alasan Izin Diajukan</li>
                                            <li><code className="font-bold">[STATUS]</code>: Diterima/Ditolak</li>
                                            <li><code className="font-bold">[ALASAN_TOLAK]</code>: Alasan Penolakan Izin</li>
                                            <li><code className="font-bold">[JUDUL_PENGUMUMAN]</code>: Judul Pengumuman</li>
                                            <li><code className="font-bold">[KONTEN]</code>: Isi Pengumuman / Pesan Wali Kelas</li>
                                            <li><code className="font-bold">[LINK_LAMPIRAN]</code>: Tautan Unduh Lampiran / Laporan</li>
                                        </ul>
                                    </div>
                                </Tab.Panel>

                                {/* TAB 4: Broadcast Push Notifikasi */}
                                <Tab.Panel className="p-6">
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold">Broadcast Push Notifikasi</h3>
                                        <p className="text-sm text-gray-500">Kirim pesan instan langsung ke perangkat browser seluruh pengguna yang telah mengaktifkan notifikasi push.</p>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Perangkat Terdaftar</span>
                                            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                                                {((user_subscriptions_count || 0) + (student_subscriptions_count || 0))} Device
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-1">Menggunakan push notifikasi web</span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Perangkat Guru & Pegawai</span>
                                            <span className="text-3xl font-black text-slate-800 dark:text-slate-200 mt-2">
                                                {user_subscriptions_count || 0} Device
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-1">Akun staf yang terdaftar</span>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Perangkat Siswa / Orang Tua</span>
                                            <span className="text-3xl font-black text-slate-800 dark:text-slate-200 mt-2">
                                                {student_subscriptions_count || 0} Device
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-1">Akun portal siswa yang terdaftar</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Broadcast Form */}
                                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                                            <form onSubmit={submitBroadcast} className="space-y-6">
                                                <div>
                                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Target Penerima</label>
                                                    <select
                                                        value={broadcastData.target}
                                                        onChange={e => setBroadcastData('target', e.target.value)}
                                                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-semibold"
                                                    >
                                                        <option value="all">Semua Perangkat (Guru, Pegawai, & Siswa/Orang Tua)</option>
                                                        <option value="users">Semua Guru & Pegawai</option>
                                                        <option value="students">Semua Siswa & Orang Tua</option>
                                                        {available_roles && available_roles.map((role: string) => (
                                                            <option key={role} value={`role:${role}`}>Hanya Role: {role}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Judul Notifikasi</label>
                                                    <input
                                                        type="text"
                                                        maxLength={100}
                                                        value={broadcastData.title}
                                                        onChange={e => setBroadcastData('title', e.target.value)}
                                                        placeholder="Masukkan judul notifikasi..."
                                                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Isi Pesan (Body)</label>
                                                    <textarea
                                                        rows={3}
                                                        maxLength={255}
                                                        value={broadcastData.body}
                                                        onChange={e => setBroadcastData('body', e.target.value)}
                                                        placeholder="Tulis detail pengumuman yang ingin disampaikan..."
                                                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Tautan Tindakan (Action URL)</label>
                                                    <input
                                                        type="text"
                                                        value={broadcastData.action_url}
                                                        onChange={e => setBroadcastData('action_url', e.target.value)}
                                                        placeholder="Contoh: /dashboard atau /portal/attendance"
                                                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                                        required
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={processingBroadcast}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <BellIcon className="w-5 h-5" />
                                                    {processingBroadcast ? 'Mengirim Broadcast...' : 'Kirim Broadcast'}
                                                </button>
                                            </form>
                                        </div>

                                        {/* Quick Templates */}
                                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
                                            <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">Quick Template</h4>
                                            <p className="text-xs text-gray-500">Gunakan templat cepat ini untuk mempermudah pengisian formulir broadcast.</p>
                                            
                                            <div className="space-y-2">
                                                <button
                                                    onClick={() => {
                                                        setBroadcastData({
                                                            target: 'all',
                                                            title: 'Pengumuman Libur Sekolah 📢',
                                                            body: 'Diinformasikan kepada seluruh warga sekolah bahwa kegiatan KBM besok ditiadakan sehubungan dengan hari libur nasional.',
                                                            action_url: '/dashboard',
                                                        });
                                                    }}
                                                    className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-xs font-semibold text-gray-700 dark:text-gray-300"
                                                >
                                                    🌴 Libur Sekolah
                                                </button>
                                                
                                                <button
                                                    onClick={() => {
                                                        setBroadcastData({
                                                            target: 'role:Guru',
                                                            title: 'Peringatan Rapat Guru 🕒',
                                                            body: 'Undangan rapat dinas guru dan staf akan dilaksanakan sore ini pukul 14:00 di ruang guru. Kehadiran bersifat wajib.',
                                                            action_url: '/dashboard',
                                                        });
                                                    }}
                                                    className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-xs font-semibold text-gray-700 dark:text-gray-300"
                                                >
                                                    👨‍🏫 Rapat Dewan Guru
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setBroadcastData({
                                                            target: 'students',
                                                            title: 'Pembayaran SPP Bulanan 💳',
                                                            body: 'Tagihan SPP bulanan Anda telah terbit. Silakan lakukan pembayaran melalui portal keuangan sekolah.',
                                                            action_url: '/portal/bills',
                                                        });
                                                    }}
                                                    className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-xs font-semibold text-gray-700 dark:text-gray-300"
                                                >
                                                    💳 Tagihan SPP
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setBroadcastData({
                                                            target: 'all',
                                                            title: 'Pemeliharaan Sistem Terjadwal 🔧',
                                                            body: 'Sistem SALIRA akan mengalami pemeliharaan malam ini pukul 22:00 s.d 24:00. Aplikasi tidak dapat diakses sementara.',
                                                            action_url: '/dashboard',
                                                        });
                                                    }}
                                                    className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-xs font-semibold text-gray-700 dark:text-gray-300"
                                                >
                                                    🔧 Maintenance Sistem
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Registered Subscribers List */}
                                    <div className="mt-12">
                                        <h4 className="font-bold text-base text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                            <DevicePhoneMobileIcon className="w-5 h-5 text-indigo-500" />
                                            Daftar Perangkat Terdaftar ({subscribers.length} Pengguna)
                                        </h4>
                                        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                                            {subscribers.length > 0 ? (
                                                <table className="w-full text-left text-sm whitespace-nowrap">
                                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                                        <tr>
                                                            <th className="p-4 font-bold text-gray-750 dark:text-gray-300">Nama</th>
                                                            <th className="p-4 font-bold text-gray-750 dark:text-gray-300">Tipe / Peran</th>
                                                            <th className="p-4 font-bold text-gray-750 dark:text-gray-300">Email / NISN</th>
                                                            <th className="p-4 font-bold text-gray-750 dark:text-gray-300 text-center">Jumlah Perangkat</th>
                                                            <th className="p-4 font-bold text-gray-750 dark:text-gray-300 text-right">Terakhir Aktif</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-150 dark:divide-gray-700">
                                                        {subscribers.map((sub) => (
                                                            <tr key={`${sub.type}-${sub.id}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                                                <td className="p-4">
                                                                    <div className="font-semibold text-gray-900 dark:text-gray-100">{sub.name}</div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                                            sub.type === 'Pegawai'
                                                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                                                                : 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                                                        }`}>
                                                                            {sub.type}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                                            {sub.role_or_class}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                    {sub.email_or_nisn}
                                                                </td>
                                                                <td className="p-4 text-center">
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                                                        {sub.devices_count} Device
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-right text-xs text-gray-400 dark:text-gray-500">
                                                                    {sub.last_active}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="p-12 text-center text-gray-400 dark:text-gray-500">
                                                    <DevicePhoneMobileIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                    <p className="font-semibold text-sm">Belum ada perangkat yang terdaftar.</p>
                                                    <p className="text-xs mt-1">Pengguna harus mengaktifkan notifikasi push dari HP/Browser mereka.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
