<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #333; margin: 0; padding: 0; }
        .header { border-bottom: 2px solid #444; padding-bottom: 10px; margin-bottom: 20px; }
        .school-logo { width: 60px; height: 60px; float: left; margin-right: 15px; }
        .school-info { float: left; }
        .school-name { font-size: 18px; font-weight: bold; margin: 0; color: #1e293b; }
        .report-title { font-size: 14px; margin: 5px 0 0; color: #64748b; font-weight: bold; }
        .clear { clear: both; }
        .meta { margin-bottom: 15px; font-size: 10px; }
        .meta table { width: 100%; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.data th { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-weight: bold; font-size: 10px; text-transform: uppercase; }
        table.data td { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 10px; vertical-align: top; }
        .status-hadir { color: #10b981; font-weight: bold; }
        .status-sakit { color: #f59e0b; }
        .status-izin { color: #3b82f6; }
        .status-alpha { color: #ef4444; font-weight: bold; }
        .status-terlambat { color: #f97316; }
        .text-center { text-align: center; }
        .footer { position: fixed; bottom: 0; width: 100%; font-size: 8px; text-align: right; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header">
        @if($logo)
            <img src="{{ public_path($logo) }}" class="school-logo">
        @endif
        <div class="school-info">
            <h1 class="school-name">{{ $school_name }}</h1>
            <p class="report-title">{{ $title }}</p>
        </div>
        <div class="clear"></div>
    </div>

    <div class="meta">
        <table>
            <tr>
                <td width="10%">Kelas:</td>
                <td width="40%"><strong>{{ $class_name ?? 'Semua Kelas' }}</strong></td>
                <td width="10%">Periode:</td>
                <td width="40%"><strong>{{ $range }}</strong></td>
            </tr>
            @if(isset($subject_name))
            <tr>
                <td>Mapel:</td>
                <td colspan="3"><strong>{{ $subject_name }}</strong></td>
            </tr>
            @endif
        </table>
    </div>

    @yield('content')

    <div class="footer">
        Dicetak pada: {{ date('d/m/Y H:i') }} | SALIRA Integrated System
    </div>
</body>
</html>
