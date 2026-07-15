<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Absensi Siswa - Semua Kelas</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #000; margin: 0; padding: 0; }
        .header-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .school-logo { width: 70px; height: 70px; object-fit: contain; }
        .school-name { font-size: 20px; font-weight: bold; margin: 0; color: #000; text-transform: uppercase; }
        .report-title { font-size: 14px; margin: 5px 0 0; color: #000; font-weight: bold; letter-spacing: 1px; }
        .school-address { font-size: 9px; color: #333; margin-top: 5px; }
        .clear { clear: both; }
        .meta { margin-bottom: 15px; font-size: 10px; background: #fff; padding: 10px; border: 1px solid #000; }
        .meta table { width: 100%; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
        table.data th { background: #eee; border: 1px solid #000; padding: 6px; text-align: left; font-weight: bold; font-size: 9px; text-transform: uppercase; color: #000; }
        table.data td { border: 1px solid #000; padding: 5px; font-size: 9px; vertical-align: top; word-wrap: break-word; color: #000; }
        .status-hadir { color: #000; font-weight: bold; }
        .status-sakit { color: #000; }
        .status-izin { color: #000; }
        .status-alpha { color: #000; font-weight: bold; }
        .status-terlambat { color: #000; }
        .text-center { text-align: center; }
        .footer { font-size: 8px; text-align: right; color: #333; border-top: 1px solid #000; padding-top: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    @foreach($classesData as $index => $data)
    <div style="{{ $index < count($classesData) - 1 ? 'page-break-after: always;' : '' }}">
        <table class="header-table">
            <tr>
                @if(isset($logo) && $logo)
                <td width="80">
                    @if(file_exists(public_path('storage/' . $logo)))
                        <img src="{{ public_path('storage/' . $logo) }}" class="school-logo">
                    @else
                        <img src="{{ $logo }}" class="school-logo">
                    @endif
                </td>
                @endif
                <td style="vertical-align: middle;">
                    <h1 class="school-name">{{ $school_name }}</h1>
                    <p class="report-title">Rekap Absensi Siswa</p>
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
                    <td width="40%"><strong>{{ $data['class'] }}</strong></td>
                    <td width="10%">Periode:</td>
                    <td width="40%"><strong>{{ $data['range'] }}</strong></td>
                </tr>
            </table>
        </div>

        @php
            $dates = $data['dates'];
            $report = $data['report'];
            $totalStudents = count($report);
            $chartData = [];
            foreach($dates as $date) {
                $present = 0;
                foreach($report as $row) {
                    $status = $row['daily'][$date] ?? '-';
                    if ($status === 'hadir' || $status === 'terlambat') {
                        $present++;
                    }
                }
                $chartData[] = [
                    'date' => \Carbon\Carbon::parse($date)->format('d/m'),
                    'percent' => $totalStudents > 0 ? round(($present / $totalStudents) * 100, 1) : 0,
                    'present' => $present
                ];
            }
        @endphp

        @if(count($chartData) > 0)
        <div style="margin-bottom: 15px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px;">
            <h3 style="margin: 0 0 10px 0; font-size: 9px; color: #1e293b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Grafik Persentase Kehadiran Harian (%)</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="vertical-align: bottom;">
                    <td style="width: 30px; text-align: right; padding-right: 5px; font-size: 7px; color: #64748b; padding-bottom: 15px; border-right: 1px solid #cbd5e1;">
                        <div style="height: 35px; line-height: 1;">100%</div>
                        <div style="height: 35px; line-height: 1;">50%</div>
                        <div style="height: 5px; line-height: 1;">0%</div>
                    </td>
                    @foreach($chartData as $c)
                    <td style="text-align: center; padding: 0 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
                        <div style="font-size: 7px; font-weight: bold; color: #4f46e5; margin-bottom: 3px;">{{ $c['percent'] }}%</div>
                        <div style="width: 22px; margin: 0 auto; background-color: #4f46e5; border-radius: 3px 3px 0 0; height: {{ max(2, round($c['percent'] * 0.7)) }}px;"></div>
                    </td>
                    @endforeach
                </tr>
                <tr>
                    <td style="border-right: 1px solid #cbd5e1;"></td>
                    @foreach($chartData as $c)
                    <td style="text-align: center; padding-top: 5px; font-size: 7px; color: #475569; font-weight: bold;">
                        {{ $c['date'] }}
                    </td>
                    @endforeach
                </tr>
            </table>
        </div>
        @endif

        <table class="data">
            <thead>
                <tr>
                    <th width="150">Nama Siswa</th>
                    @foreach($dates as $date)
                        <th class="text-center">{{ \Carbon\Carbon::parse($date)->format('d') }}</th>
                    @endforeach
                    <th class="text-center" style="background: #ecfdf5">H</th>
                    <th class="text-center" style="background: #fffbeb">S</th>
                    <th class="text-center" style="background: #eff6ff">I</th>
                    <th class="text-center" style="background: #fef2f2">A</th>
                    <th class="text-center" style="background: #fff7ed">T</th>
                </tr>
            </thead>
            <tbody>
                @foreach($report as $row)
                <tr>
                    <td style="font-weight: bold; text-transform: uppercase;">{{ $row['name'] }}</td>
                    @foreach($dates as $date)
                        <td class="text-center">
                            @php $status = $row['daily'][$date] ?? '-'; @endphp
                            <span class="status-{{ $status }}">
                                {{ $status == 'hadir' ? 'H' : ($status == 'sakit' ? 'S' : ($status == 'izin' ? 'I' : ($status == 'alpha' ? 'A' : ($status == 'terlambat' ? 'T' : '-')))) }}
                            </span>
                        </td>
                    @endforeach
                    <td class="text-center" style="font-weight: bold">{{ $row['summary']['hadir'] }}</td>
                    <td class="text-center">{{ $row['summary']['sakit'] }}</td>
                    <td class="text-center">{{ $row['summary']['izin'] }}</td>
                    <td class="text-center" style="font-weight: bold; color: #ef4444">{{ $row['summary']['alpha'] }}</td>
                    <td class="text-center">{{ $row['summary']['terlambat'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div style="margin-top: 15px; font-size: 9px; color: #64748b;">
            <strong>Keterangan:</strong> H (Hadir), S (Sakit), I (Izin), A (Alpha), T (Terlambat)
        </div>

        <div class="footer">
            Dicetak pada: {{ date('d/m/Y H:i') }} | SALIRA Integrated System
        </div>
    </div>
    @endforeach
</body>
</html>
