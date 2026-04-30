<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #333; margin: 0; padding: 0; }
        .header-table { width: 100%; border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 15px; }
        .school-logo { width: 70px; height: 70px; object-fit: contain; }
        .school-name { font-size: 20px; font-weight: bold; margin: 0; color: #1e293b; text-transform: uppercase; }
        .report-title { font-size: 14px; margin: 5px 0 0; color: #475569; font-weight: bold; letter-spacing: 1px; }
        .school-address { font-size: 9px; color: #64748b; margin-top: 5px; }
        .clear { clear: both; }
        .meta { margin-bottom: 15px; font-size: 10px; background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; }
        .meta table { width: 100%; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
        table.data th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-weight: bold; font-size: 9px; text-transform: uppercase; color: #334155; }
        table.data td { border: 1px solid #cbd5e1; padding: 5px; font-size: 9px; vertical-align: top; word-wrap: break-word; }
        .status-hadir { color: #059669; font-weight: bold; }
        .status-sakit { color: #d97706; }
        .status-izin { color: #2563eb; }
        .status-alpha { color: #dc2626; font-weight: bold; }
        .status-terlambat { color: #ea580c; }
        .text-center { text-align: center; }
        .footer { position: fixed; bottom: -20px; left: 0; right: 0; height: 20px; font-size: 8px; text-align: right; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 5px; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            @if(isset($logo) && $logo)
            <td width="80">
                <img src="{{ $logo }}" class="school-logo">
            </td>
            @endif
            <td style="vertical-align: middle;">
                <h1 class="school-name">{{ $school_name }}</h1>
                <p class="report-title">{{ $title }}</p>
                @if(isset($school_address))
                    <p class="school-address">{{ $school_address }}</p>
                @endif
            </td>
            <td width="150" style="text-align: right; vertical-align: bottom; font-size: 8px; color: #94a3b8;">
                Dicetak: {{ date('d/m/Y H:i') }}
            </td>
        </tr>
    </table>

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
