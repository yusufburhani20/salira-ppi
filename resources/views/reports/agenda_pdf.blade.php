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
</table>

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
