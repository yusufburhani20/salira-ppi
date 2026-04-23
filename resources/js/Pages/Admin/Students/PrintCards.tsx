import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';

export default function PrintCards({ academicClass, students, settings }: any) {
    const [orientation, setOrientation] = useState<'h' | 'v'>('h');

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <Head title={`Cetak Kartu - ${academicClass.name}`} />

            {/* CONTROL PANEL (Hidden on Print) */}
            <div className="max-w-4xl mx-auto no-print bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Cetak Kartu Kelas: {academicClass.name}</h2>
                    <p className="text-slate-500 text-sm">Total {students.length} siswa siap dicetak.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1">
                    <button
                        onClick={() => setOrientation('h')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${orientation === 'h' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Horizontal
                    </button>
                    <button
                        onClick={() => setOrientation('v')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${orientation === 'v' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Vertikal
                    </button>
                </div>
                <button
                    onClick={handlePrint}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    CETAK SEKARANG
                </button>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none print:bg-transparent overflow-hidden print:overflow-visible">
                
                {orientation === 'h' ? (
                    // HORIZONTAL LAYOUT (A4 Portrait, 2 columns, ~10 per page)
                    <div className="card-grid-h">
                        {students.map((student: any) => (
                            <div key={student.id} className="card-container-h card-avoid-break">
                                <div className="card-h-inner bg-emerald-800 text-white">
                                    <div className="card-h-qr-section">
                                        <div className="card-qr-box">
                                            <QRCodeSVG value={student.qr_token} size={70} style={{ width: '100%', height: '100%' }} />
                                        </div>
                                        <p className="card-qr-text">Secured Token</p>
                                    </div>
                                    <div className="card-h-info-section">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="card-h-school">{settings.school_name}</h3>
                                                <p className="card-h-subtitle">Digital Student Identification</p>
                                            </div>
                                            {settings.school_logo && <img src={settings.school_logo} className="card-h-logo" alt="Logo" />}
                                        </div>
                                        <div className="mt-auto">
                                            <p className="card-h-label">Nama Lengkap</p>
                                            <h4 className="card-h-name">{student.name}</h4>
                                        </div>
                                        <div className="flex gap-4 mt-2">
                                            <div>
                                                <p className="card-h-label">NIS</p>
                                                <p className="card-h-nis">{student.nis}</p>
                                            </div>
                                            <div>
                                                <p className="card-h-label">Status</p>
                                                <span className="card-h-status">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // VERTICAL LAYOUT (A4 Portrait, 3 columns for 54x85mm, ~9 per page)
                    <div className="card-grid-v">
                        {students.map((student: any) => (
                            <div key={student.id} className="card-container-v card-avoid-break">
                                <div className="card-v-inner bg-emerald-900 text-white">
                                    <div className="card-v-header">
                                        {settings.school_logo && <img src={settings.school_logo} className="card-v-logo" alt="Logo" />}
                                        <h3 className="card-v-school">{settings.school_name}</h3>
                                    </div>
                                    <div className="card-v-body">
                                        <div className="card-qr-box mb-2">
                                            <QRCodeSVG value={student.qr_token} size={60} style={{ width: '100%', height: '100%' }} />
                                        </div>
                                        <h4 className="card-v-name">{student.name}</h4>
                                        <p className="card-v-nis">{student.nis}</p>
                                        <div className="card-v-divider" />
                                        <p className="card-v-footer-text">Valid ID Card<br />SALIRA Academic Portal</p>
                                    </div>
                                    <div className="card-v-footer">
                                        <span className="card-v-status">Verified Student</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            <style>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4 portrait; /* Force A4 portrait for bulk printing */
                    }
                    body {
                        background: transparent;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .card-avoid-break {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    .min-h-screen {
                        min-height: auto !important;
                        padding: 0 !important;
                        background: transparent !important;
                    }
                }

                /* GRID LAYOUTS FOR A4 */
                .card-grid-h {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    padding: 15px;
                    justify-items: center;
                }
                
                .card-grid-v {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    padding: 15px;
                    justify-items: center;
                }

                /* HORIZONTAL CARD (CR80: 85.6mm x 53.98mm) */
                .card-container-h {
                    width: 86mm;
                    height: 54mm;
                    border: 1px dashed #ccc; /* Cut guide */
                    padding: 0;
                    box-sizing: border-box;
                    background: white;
                }
                .card-h-inner {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                .card-h-qr-section {
                    width: 32%;
                    background: rgba(255,255,255,0.12);
                    border-right: 1px solid rgba(255,255,255,0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    text-align: center;
                }
                .card-qr-box {
                    background: white;
                    padding: 4px;
                    border-radius: 8px;
                    margin-bottom: 6px;
                }
                .card-qr-text {
                    font-size: 6px;
                    font-weight: 900;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    opacity: 0.7;
                    margin: 0;
                }
                .card-h-info-section {
                    flex: 1;
                    padding: 12px 14px;
                    display: flex;
                    flex-direction: column;
                }
                .card-h-school {
                    margin: 0;
                    font-size: 13px;
                    font-weight: 900;
                    letter-spacing: -0.02em;
                }
                .card-h-subtitle {
                    margin: 2px 0 0;
                    font-size: 6px;
                    opacity: 0.7;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .card-h-logo {
                    height: 38px;
                    width: auto;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                }
                .card-h-label {
                    margin: 0 0 2px;
                    font-size: 6px;
                    opacity: 0.6;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                }
                .card-h-name {
                    margin: 0;
                    font-size: 14px; /* Reduced to fit long names */
                    font-weight: 900;
                    letter-spacing: -0.02em;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .card-h-nis {
                    margin: 0;
                    font-size: 11px;
                    font-weight: 900;
                    font-family: monospace;
                    letter-spacing: -0.02em;
                }
                .card-h-status {
                    font-size: 7px;
                    font-weight: 700;
                    background: rgba(255,255,255,0.2);
                    padding: 2px 6px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                /* VERTICAL CARD (CR80: 53.98mm x 85.6mm) */
                .card-container-v {
                    width: 54mm;
                    height: 86mm;
                    border: 1px dashed #ccc;
                    box-sizing: border-box;
                    background: white;
                }
                .card-v-inner {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                }
                .card-v-header {
                    padding: 10px;
                    text-align: center;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .card-v-logo {
                    height: 48px;
                    width: auto;
                    display: block;
                    margin: 0 auto 8px;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                }
                .card-v-school {
                    margin: 0;
                    font-size: 11px;
                    font-weight: 900;
                    line-height: 1.2;
                }
                .card-v-body {
                    flex: 1;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                .card-v-name {
                    margin: 0 0 3px;
                    font-size: 12px;
                    font-weight: 900;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                }
                .card-v-nis {
                    margin: 0 0 8px;
                    font-size: 9px;
                    font-family: monospace;
                    letter-spacing: 0.1m;
                    color: #818cf8;
                    font-weight: 900;
                }
                .card-v-divider {
                    width: 80%;
                    height: 1px;
                    background: rgba(255,255,255,0.2);
                    margin-bottom: 6px;
                }
                .card-v-footer-text {
                    margin: 0;
                    font-size: 6px;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    line-height: 1.6;
                }
                .card-v-footer {
                    padding: 8px;
                    background: rgba(255,255,255,0.05);
                    border-top: 1px solid rgba(255,255,255,0.05);
                    text-align: center;
                }
                .card-v-status {
                    padding: 3px 10px;
                    background: rgba(16,185,129,0.1);
                    color: #34d399;
                    border-radius: 9999px;
                    font-size: 6px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    border: 1px solid rgba(16,185,129,0.2);
                    display: inline-block;
                }
            `}</style>
        </div>
    );
}
