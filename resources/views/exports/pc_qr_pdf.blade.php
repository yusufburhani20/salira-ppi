<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Cetak QR Code PC</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .grid {
            width: 100%;
        }
        .qr-card {
            width: 23%;
            display: inline-block;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            padding: 10px;
            margin: 5px;
            text-align: center;
            vertical-align: top;
            box-sizing: border-box;
        }
        .qr-image {
            width: 110px;
            height: 110px;
            margin-bottom: 5px;
        }
        .pc-code {
            font-size: 13px;
            font-weight: bold;
            color: #1e293b;
            margin: 0;
            font-family: monospace;
        }
        .lab-name {
            font-size: 9px;
            color: #64748b;
            margin: 2px 0 0 0;
        }
        .instruction {
            font-size: 7px;
            color: #94a3b8;
            margin: 4px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div style="margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        <h2 style="margin: 0; color: #0f172a;">Daftar QR Code Unit PC - {{ $lab->name }}</h2>
        <p style="margin: 5px 0 0 0; font-size: 11px; color: #64748b;">Gunting dan tempelkan QR Code ini pada meja unit PC yang bersangkutan.</p>
    </div>

    <div class="grid">
        @foreach($units as $unit)
            <div class="qr-card">
                <!-- Generating QR Code URL dynamically -->
                <img class="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ urlencode(route('public.computer-issues.report') . '?code=' . $unit->code) }}" alt="QR Code">
                <div class="pc-code">{{ $unit->code }}</div>
                <div class="lab-name">{{ $lab->name }}</div>
                <div class="instruction">Scan untuk lapor kerusakan</div>
            </div>
        @endforeach
    </div>
</body>
</html>
