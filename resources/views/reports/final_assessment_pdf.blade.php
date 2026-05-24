<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Asesmen Akhir</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #000; margin: 0; padding: 0; }
        .header-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .school-logo { width: 70px; height: 70px; object-fit: contain; }
        .school-name { font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase; }
        .report-title { font-size: 14px; margin: 5px 0 0; font-weight: bold; letter-spacing: 1px; }
        .school-address { font-size: 9px; color: #333; margin-top: 5px; }
        .meta { margin-bottom: 15px; font-size: 10px; background: #fff; padding: 10px; border: 1px solid #000; }
        .meta table { width: 100%; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.data th { background: #eee; border: 1px solid #000; padding: 6px; text-align: left; font-weight: bold; font-size: 9px; text-transform: uppercase; }
        table.data td { border: 1px solid #000; padding: 5px; font-size: 9px; vertical-align: middle; word-wrap: break-word; }
        .text-center { text-align: center; }
        .badge-asas { background-color: #e0e7ff; color: #3730a3; font-weight: bold; padding: 2px 8px; border-radius: 20px; font-size: 8px; }
        .badge-asat { background-color: #ede9fe; color: #5b21b6; font-weight: bold; padding: 2px 8px; border-radius: 20px; font-size: 8px; }
        .footer { position: fixed; bottom: -20px; left: 0; right: 0; height: 20px; font-size: 8px; text-align: right; color: #333; border-top: 1px solid #000; padding-top: 5px; }
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
                <h1 class="school-name">{{ $school_name ?? 'SALIRA ACADEMY' }}</h1>
                <p class="report-title">REKAP ASESMEN AKHIR ({{ $type_label ?? 'ASAS & ASAT' }})</p>
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
                <td width="15%">Kelas:</td>
                <td width="35%"><strong>{{ $class_name ?? 'Semua Kelas' }}</strong></td>
                <td width="15%">Semester:</td>
                <td width="35%"><strong>{{ $semester_label ?? '-' }}</strong></td>
            </tr>
            <tr>
                <td>Mapel:</td>
                <td><strong>{{ $subject_name ?? 'Semua Mapel' }}</strong></td>
                <td>Guru:</td>
                <td><strong>{{ $teacher_name ?? '-' }}</strong></td>
            </tr>
        </table>
    </div>

    <h3 style="font-size: 11px; border-left: 4px solid #000; padding-left: 10px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Daftar Nilai Asesmen Akhir</h3>

    <table class="data">
        <thead>
            <tr>
                <th class="text-center" width="25">No</th>
                <th width="120">Nama Siswa</th>
                <th class="text-center" width="45">Tipe</th>
                <th class="text-center" width="40">Nilai</th>
                <th class="text-center" width="55">Hadir (60%)</th>
                <th class="text-center" width="45">Sikap (20%)</th>
                <th class="text-center" width="45">Minat (20%)</th>
                <th class="text-center" width="55">Nilai Akhlak</th>
                <th>Catatan</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp
            @forelse($assessments as $assessment)
                @php
                    $typeName = $assessment['type'] ?? '-';
                @endphp
                @foreach($assessment['scores'] as $score)
                <tr>
                    <td class="text-center">{{ $no++ }}</td>
                    <td style="font-weight: bold; text-transform: uppercase;">{{ $score['student']['name'] ?? '-' }}</td>
                    <td class="text-center">
                        <span class="{{ strtolower($typeName) === 'asas' ? 'badge-asas' : 'badge-asat' }}">
                            {{ $typeName }}
                        </span>
                    </td>
                    <td class="text-center" style="font-weight: bold; font-size: 11px;">{{ $score['score'] }}</td>
                    <td class="text-center">{{ $score['attendance_percentage'] ?? '—' }}%</td>
                    <td class="text-center">{{ $score['attitude_score'] ?? '—' }}</td>
                    <td class="text-center">{{ $score['interest_score'] ?? '—' }}</td>
                    <td class="text-center" style="font-weight: bold; font-size: 11px; color: #4f46e5;">{{ $score['character_score'] ?? '—' }}</td>
                    <td style="color: #555;">{{ $score['notes'] ?? '-' }}</td>
                </tr>
                @endforeach
            @empty
                <tr>
                    <td colspan="9" class="text-center" style="padding: 30px; font-style: italic;">Tidak ada data asesmen akhir untuk filter ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dicetak pada: {{ date('d/m/Y H:i') }} | SALIRA Integrated System
    </div>
</body>
</html>
