@extends('reports.pdf_layout')

@section('content')
<!-- Bagian I: Jurnal Mengajar (Ringkasan) -->
<h3 style="font-size: 12px; border-left: 4px solid #4f46e5; padding-left: 10px; margin-bottom: 10px; color: #1e293b;">I. Jurnal Mengajar</h3>
<table class="data">
    <thead>
        <tr>
            <th width="20" class="text-center">No</th>
            <th width="90">Hari / Tanggal</th>
            <th width="40" class="text-center">Jam</th>
            <th width="80">Mata Pelajaran</th>
            <th>Topik / Materi Pembelajaran</th>
            <th>Aktivitas & Tugas Siswa</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $index => $item)
        <tr>
            <td class="text-center">{{ $index + 1 }}</td>
            <td style="font-size: 9px;">
                <strong>{{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd') }}</strong><br>
                {{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}
            </td>
            <td class="text-center" style="font-family: monospace; font-size: 9px;">{{ $item['lesson_period'] }}</td>
            <td style="font-size: 8px; font-weight: bold; color: #4338ca;">{{ $item['subject']['name'] ?? ($item['subject_name'] ?? ($item['subject'] ?? '-')) }}</td>
            <td style="font-size: 9px;"><strong>{{ $item['topic'] }}</strong></td>
            <td style="font-size: 8px;">
                <div style="margin-bottom: 3px;">{{ $item['activities'] }}</div>
                @if(!empty($item['student_tasks']))
                    <div style="font-style: italic; color: #64748b; border-top: 1px dashed #e2e8f0; padding-top: 2px;">
                        Tugas: {{ $item['student_tasks'] }}
                    </div>
                @endif
            </td>
        </tr>
        @endforeach
        @if(count($data) == 0)
        <tr>
            <td colspan="6" class="text-center" style="padding: 30px; color: #94a3b8; font-style: italic;">Tidak ada data jurnal mengajar dalam periode ini.</td>
        </tr>
        @endif
    </tbody>
</table>

<!-- Bagian II: Matriks Presensi Siswa (Hanya jika kelas dipilih) -->
@if(isset($matrix) && $matrix)
<div style="page-break-before: always;"></div>
<h3 style="font-size: 12px; border-left: 4px solid #10b981; padding-left: 10px; margin-bottom: 10px; margin-top: 20px; color: #1e293b;">II. Matriks Presensi Siswa</h3>
<table class="data">
    <thead>
        <tr>
            <th width="20" class="text-center">No</th>
            <th width="150">Nama Siswa</th>
            @foreach($matrix['dates'] as $date)
                <th class="text-center" style="font-size: 7px; width: 18px; padding: 4px 1px;">{{ \Carbon\Carbon::parse($date)->format('d/m') }}</th>
            @endforeach
            <th class="text-center" style="background: #ecfdf5; width: 18px; font-size: 8px;">H</th>
            <th class="text-center" style="background: #fffbeb; width: 18px; font-size: 8px;">S</th>
            <th class="text-center" style="background: #eff6ff; width: 18px; font-size: 8px;">I</th>
            <th class="text-center" style="background: #fef2f2; width: 18px; font-size: 8px;">A</th>
            <th class="text-center" style="background: #fff7ed; width: 18px; font-size: 8px;">T</th>
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
                    <span class="status-{{ $status }}">
                        @if($status == 'hadir') H @elseif($status == 'sakit') S @elseif($status == 'izin') I @elseif($status == 'alpha') A @elseif($status == 'terlambat') T @else - @endif
                    </span>
                </td>
            @endforeach
            <td class="text-center" style="font-weight: bold; background: #f0fdf4; font-size: 9px;">{{ $row['summary']['hadir'] }}</td>
            <td class="text-center" style="font-size: 9px;">{{ $row['summary']['sakit'] }}</td>
            <td class="text-center" style="font-size: 9px;">{{ $row['summary']['izin'] }}</td>
            <td class="text-center" style="font-weight: bold; color: #ef4444; background: #fef2f2; font-size: 9px;">{{ $row['summary']['alpha'] }}</td>
            <td class="text-center" style="font-size: 9px;">{{ $row['summary']['terlambat'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<div style="margin-top: 15px; font-size: 8px; color: #64748b;">
    <strong>Keterangan Matriks:</strong> H (Hadir), S (Sakit), I (Izin), A (Alpha/Tanpa Keterangan), T (Terlambat)
</div>
@else
<div style="margin-top: 20px; padding: 15px; background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; font-size: 10px; border-radius: 4px;">
    <strong>Catatan:</strong> Matriks presensi siswa akan muncul otomatis jika Anda melakukan filter **Kelas** dan **Rentang Tanggal** sebelum melakukan ekspor.
</div>
@endif
@endsection
