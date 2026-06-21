<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Stock Opname Lab Komputer</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #334155;
            font-size: 11px;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            border-bottom: 3px double #cbd5e1;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 18px;
            margin: 0;
            color: #0f172a;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #64748b;
        }
        .meta-table {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .meta-table td {
            padding: 4px 0;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        .stats-container {
            width: 100%;
            margin-bottom: 20px;
        }
        .stats-box {
            width: 23%;
            display: inline-block;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
            box-sizing: border-box;
            margin-right: 1.5%;
        }
        .stats-value {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
        }
        .stats-label {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .data-table th {
            background-color: #f1f5f9;
            color: #475569;
            text-align: left;
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
            font-weight: bold;
        }
        .data-table td {
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-active { background-color: #dcfce7; color: #15803d; }
        .status-maintenance { background-color: #fef3c7; color: #b45309; }
        .status-broken { background-color: #fee2e2; color: #b91c1c; }

        .notes-box {
            background-color: #f8fafc;
            border-left: 3px solid #6366f1;
            padding: 10px;
            margin-bottom: 25px;
            border-radius: 0 6px 6px 0;
        }
        .signatures {
            width: 100%;
            margin-top: 40px;
        }
        .signature-box {
            width: 45%;
            display: inline-block;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN STOCK OPNAME MINGGUAN LAB KOMPUTER</h1>
        <p>Aplikasi Sistem Informasi Sekolah (SALIRA)</p>
    </div>

    <table class="meta-table">
        <tr>
            <td style="width: 15%; font-weight: bold;">Ruangan Lab</td>
            <td style="width: 35%;">: {{ $lab->name }}</td>
            <td style="width: 15%; font-weight: bold;">Periode Laporan</td>
            <td style="width: 35%;">: {{ $dateRange }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Laboran</td>
            <td>: {{ $laboranName }}</td>
            <td style="font-weight: bold;">Tanggal Cetak</td>
            <td>: {{ now()->translatedFormat('d F Y H:i') }}</td>
        </tr>
    </table>

    <div class="section-title">Ringkasan Status Aset PC</div>
    <div class="stats-container">
        <div class="stats-box">
            <div class="stats-value">{{ $stats['total'] }}</div>
            <div class="stats-label">Total Unit</div>
        </div>
        <div class="stats-box" style="border-left: 3px solid #10b981;">
            <div class="stats-value">{{ $stats['active'] }}</div>
            <div class="stats-label">Aktif / Baik</div>
        </div>
        <div class="stats-box" style="border-left: 3px solid #f59e0b;">
            <div class="stats-value">{{ $stats['maintenance'] }}</div>
            <div class="stats-label">Perbaikan</div>
        </div>
        <div class="stats-box" style="border-left: 3px solid #ef4444; margin-right: 0;">
            <div class="stats-value">{{ $stats['broken'] }}</div>
            <div class="stats-label">Rusak</div>
        </div>
    </div>

    <div class="section-title">Catatan & Analisis Laboran</div>
    <div class="notes-box">
        {{ $notes ?: 'Tidak ada catatan tambahan dari Laboran.' }}
    </div>

    <div class="section-title">Daftar Status Unit PC</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 15%;">Kode PC</th>
                <th style="width: 20%;">Merek / Tipe</th>
                <th style="width: 40%;">Spesifikasi (CPU / RAM / Storage / OS)</th>
                <th style="width: 15%;">Kondisi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($units as $unit)
                <tr>
                    <td style="font-family: monospace; font-weight: bold;">{{ $unit->code }}</td>
                    <td>{{ $unit->brand ?: '-' }} ({{ $unit->name }})</td>
                    <td>
                        {{ $unit->processor ?: '-' }} / RAM: {{ $unit->ram ?: '-' }} / {{ $unit->storage ?: '-' }} / OS: {{ $unit->os ?: '-' }}
                    </td>
                    <td>
                        @if($unit->status === 'active')
                            <span class="status-badge status-active">Aktif</span>
                        @elseif($unit->status === 'maintenance')
                            <span class="status-badge status-maintenance">Perbaikan</span>
                        @else
                            <span class="status-badge status-broken">Rusak</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @if($recentIssues->isNotEmpty())
        <div class="section-title" style="page-break-before: always;">Riwayat Laporan Kerusakan & Troubleshooting (Minggu Ini)</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 15%;">Tanggal</th>
                    <th style="width: 15%;">Kode PC</th>
                    <th style="width: 15%;">Pelapor</th>
                    <th style="width: 35%;">Kerusakan</th>
                    <th style="width: 20%;">Status Perbaikan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($recentIssues as $issue)
                    <tr>
                        <td>{{ $issue->created_at->translatedFormat('d-m-Y') }}</td>
                        <td style="font-family: monospace;">{{ $issue->unit->code }}</td>
                        <td>{{ $issue->reporter_name }}</td>
                        <td>{{ $issue->description }}</td>
                        <td>
                            @if($issue->status === 'resolved')
                                <span style="color: #16a34a; font-weight: bold;">Resolved</span>
                                <div style="font-size: 8px; color: #64748b;">{{ $issue->resolution_notes }}</div>
                            @elseif($issue->status === 'open')
                                <span style="color: #ea580c; font-weight: bold;">Open / In Progress</span>
                            @else
                                <span style="color: #dc2626; font-weight: bold;">Pending</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="signatures" style="margin-top: 50px;">
        <div class="signature-box" style="float: left;">
            <p>Laboran Komputer,</p>
            <br><br><br>
            <p style="text-decoration: underline; font-weight: bold;">{{ $laboranName }}</p>
            <p style="font-size: 9px; color: #64748b; margin-top: 2px;">Laboran Komputer</p>
        </div>
        <div class="signature-box" style="float: right;">
            <p>Mengetahui,<br>Kepala Program</p>
            <br><br><br>
            <p style="text-decoration: underline; font-weight: bold;">{{ $recipientName }}</p>
            <p style="font-size: 9px; color: #64748b; margin-top: 2px;">Kepala Program Studi</p>
        </div>
    </div>
</body>
</html>
