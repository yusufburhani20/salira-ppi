@extends('reports.pdf_layout')

@section('content')
<!-- Bagian I: Jurnal Mengajar (Ringkasan) -->
<h3 style="font-size: 11px; border-left: 4px solid #000; padding-left: 10px; margin-bottom: 10px; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">I. Jurnal Mengajar</h3>
<table class="data">
    <thead>
        <tr>
            <th width="25" class="text-center">No</th>
            <th width="90">Hari / Tanggal</th>
            <th width="35" class="text-center">Jam</th>
            <th width="90">Mata Pelajaran</th>
            <th width="190">Tujuan Pembelajaran</th>
            <th width="210">Laporan Perkembangan Siswa</th>
            <th width="120">Kehadiran / Absensi</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $index => $item)
        <tr>
            <td class="text-center">{{ $index + 1 }}</td>
            <td style="font-size: 9px;">
                <div style="font-weight: bold;">{{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd') }}</div>
                <div>{{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}</div>
            </td>
            <td class="text-center" style="font-family: monospace; font-size: 9px; background: #eee;">{{ $item['lesson_period'] }}</td>
            <td style="font-size: 8px; font-weight: bold; text-transform: uppercase;">{{ $item['subject']['name'] ?? ($item['subject_name'] ?? ($item['subject'] ?? '-')) }}</td>
            <td style="font-size: 9px; line-height: 1.3;">
                <strong>{{ $item['topic'] }}</strong>
                @if(!empty($item['learning_model']))
                    <div style="font-size: 8px; color: #444; margin-top: 5px;">
                        <strong>Model &amp; Media:</strong> {{ $item['learning_model'] }}
                    </div>
                @endif
            </td>
            <td style="font-size: 8px; line-height: 1.3;">
                <div style="margin-bottom: 4px;">{{ $item['activities'] }}</div>
                @if(!empty($item['student_tasks']))
                    <div style="font-style: italic; border-top: 1px dashed #000; padding-top: 3px; margin-top: 3px;">
                        <span style="font-weight: bold; font-size: 7px;">TUGAS:</span> {{ $item['student_tasks'] }}
                    </div>
                @endif
            </td>
            <td style="font-size: 8px; line-height: 1.3;">
                @php
                    $absentList = [];
                    if (!empty($item['attendances'])) {
                        foreach ($item['attendances'] as $att) {
                            $statusVal = strtolower($att['status']['value'] ?? ($att['status'] ?? ''));
                            if (in_array($statusVal, ['sakit', 'izin', 'alpha', 'terlambat'])) {
                                $studentName = $att['student']['name'] ?? '-';
                                $statusLabel = ucfirst($statusVal);
                                $absentList[$statusLabel][] = $studentName;
                            }
                        }
                    }
                @endphp
                @if(empty($absentList))
                    <span style="color: #16a34a; font-weight: bold;">Hadir Semua</span>
                @else
                    @foreach($absentList as $status => $names)
                        <div style="margin-bottom: 2px;">
                            <strong style="color: #dc2626;">{{ $status }}:</strong>
                            <span style="color: #334155;">{{ implode(', ', $names) }}</span>
                        </div>
                    @endforeach
                @endif
            </td>
        </tr>
        @endforeach
        @if(count($data) == 0)
        <tr>
            <td colspan="7" class="text-center" style="padding: 40px; font-style: italic; border: 1px dashed #000;">Tidak ada data jurnal mengajar dalam periode ini.</td>
        </tr>
        @endif
    </tbody>
</table>

<!-- Bagian II: Matriks Presensi Siswa -->
@if(isset($matrix) && $matrix)
@php
    $dailyPercentages = [];
    $totalStudents = count($matrix['report']);
    foreach($matrix['dates'] as $date) {
        $presentCount = 0;
        foreach($matrix['report'] as $row) {
            $status = strtolower($row['daily'][$date] ?? '-');
            if (in_array($status, ['hadir', 'terlambat'])) {
                $presentCount++;
            }
        }
        $percentage = $totalStudents > 0 ? round(($presentCount / $totalStudents) * 100) : 0;
        $dailyPercentages[$date] = [
            'percentage' => $percentage,
            'present' => $presentCount,
            'total' => $totalStudents
        ];
    }
@endphp
<div style="page-break-before: always;"></div>
<h3 style="font-size: 11px; border-left: 4px solid #000; padding-left: 10px; margin-bottom: 10px; margin-top: 10px; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">II. Matriks Presensi Siswa</h3>
<table class="data">
    <thead>
        <tr>
            <th width="25" class="text-center">No</th>
            <th width="160">Nama Siswa</th>
            @foreach($matrix['dates'] as $date)
                <th class="text-center" style="font-size: 7px; width: 18px; padding: 4px 1px; background: #eee;">{{ \Carbon\Carbon::parse($date)->format('d/m') }}</th>
            @endforeach
            <th class="text-center" style="background: #ddd; width: 18px; font-size: 8px;">H</th>
            <th class="text-center" style="background: #ddd; width: 18px; font-size: 8px;">S</th>
            <th class="text-center" style="background: #ddd; width: 18px; font-size: 8px;">I</th>
            <th class="text-center" style="background: #ddd; width: 18px; font-size: 8px;">A</th>
            <th class="text-center" style="background: #ddd; width: 18px; font-size: 8px;">T</th>
        </tr>
    </thead>
    <tbody>
        @foreach($matrix['report'] as $index => $row)
        <tr>
            <td class="text-center" style="font-size: 9px;">{{ $index + 1 }}</td>
            <td style="font-weight: bold; text-transform: uppercase; font-size: 8px;">{{ $row['name'] }}</td>
            @foreach($matrix['dates'] as $date)
                <td class="text-center" style="font-size: 8px; padding: 4px 1px;">
                    @php $status = strtolower($row['daily'][$date] ?? '-'); @endphp
                    @if($status == 'hadir')
                        <span style="font-weight: bold;">H</span>
                    @elseif($status == 'sakit')
                        <span>S</span>
                    @elseif($status == 'izin')
                        <span>I</span>
                    @elseif($status == 'alpha')
                        <span style="font-weight: bold;">A</span>
                    @elseif($status == 'terlambat')
                        <span>T</span>
                    @else
                        <span style="color: #999;">-</span>
                    @endif
                </td>
            @endforeach
            <td class="text-center" style="font-weight: bold; background: #f9f9f9; font-size: 9px;">{{ $row['summary']['hadir'] }}</td>
            <td class="text-center" style="font-size: 9px;">{{ $row['summary']['sakit'] }}</td>
            <td class="text-center" style="font-size: 9px;">{{ $row['summary']['izin'] }}</td>
            <td class="text-center" style="font-weight: bold; background: #f9f9f9; font-size: 9px;">{{ $row['summary']['alpha'] }}</td>
            <td class="text-center" style="font-size: 9px;">{{ $row['summary']['terlambat'] }}</td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr style="background: #f8fafc; font-weight: bold;">
            <td colspan="2" class="text-right" style="font-size: 8px; font-weight: bold; padding: 6px; border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">% Kehadiran Harian</td>
            @foreach($matrix['dates'] as $date)
                @php
                    $pct = $dailyPercentages[$date]['percentage'];
                    $color = $pct >= 90 ? '#16a34a' : ($pct >= 75 ? '#d97706' : '#dc2626');
                @endphp
                <td class="text-center" style="font-size: 8px; font-weight: bold; padding: 4px 1px; color: {{ $color }}; border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;">
                    {{ $pct }}%
                </td>
            @endforeach
            <td colspan="5" style="background: #f1f5f9; border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1;"></td>
        </tr>
    </tfoot>
</table>

<div style="margin-top: 20px; page-break-inside: avoid;">
    <h4 style="font-size: 10px; border-left: 3px solid #4F46E5; padding-left: 8px; margin-bottom: 10px; text-transform: uppercase; color: #1e293b; letter-spacing: 0.5px;">Grafik Persentase Kehadiran Harian</h4>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr style="height: 90px;">
                @foreach($matrix['dates'] as $date)
                    @php
                        $pct = $dailyPercentages[$date]['percentage'];
                        $height = round(($pct / 100) * 70); // max height 70px
                        $color = $pct >= 90 ? '#10b981' : ($pct >= 75 ? '#f59e0b' : '#ef4444');
                    @endphp
                    <td style="vertical-align: bottom; text-align: center; padding: 0 2px; height: 90px;">
                        <div style="font-size: 7px; font-weight: bold; margin-bottom: 2px; color: {{ $color }};">{{ $pct }}%</div>
                        <div style="background-color: {{ $color }}; height: {{ $height }}px; width: 18px; margin: 0 auto; border-radius: 2px 2px 0 0;"></div>
                    </td>
                @endforeach
            </tr>
            <tr style="height: 18px; background-color: #e2e8f0;">
                @foreach($matrix['dates'] as $date)
                    <td style="text-align: center; font-size: 6.5px; color: #334155; font-weight: bold; border-top: 1px solid #cbd5e1; padding: 3px 0;">
                        {{ \Carbon\Carbon::parse($date)->format('d/m') }}
                    </td>
                @endforeach
            </tr>
        </table>
    </div>
</div>

<div style="margin-top: 15px; font-size: 8px; background: #eee; padding: 8px; border: 1px solid #000;">
    <strong>KETERANGAN MATRIKS:</strong> 
    <span style="margin-left: 10px;">H : HADIR</span>
    <span style="margin-left: 10px;">S : SAKIT</span>
    <span style="margin-left: 10px;">I : IZIN</span>
    <span style="margin-left: 10px;">A : ALPHA / TANPA KETERANGAN</span>
    <span style="margin-left: 10px;">T : TERLAMBAT</span>
</div>
@else
<div style="margin-top: 20px; padding: 20px; background: #fff; border: 1px dashed #000; color: #000; font-size: 10px; text-align: center;">
    <strong>INFORMASI:</strong> Matriks presensi siswa akan muncul secara otomatis di halaman terpisah jika Anda melakukan filter **Kelas** dan **Rentang Tanggal** sebelum melakukan ekspor PDF.
</div>
@endif
@endsection
