@extends('reports.pdf_layout')

@section('content')
<!-- Bagian I: Jurnal Mengajar (Ringkasan) -->
<h3 style="font-size: 11px; border-left: 4px solid #4f46e5; padding-left: 10px; margin-bottom: 10px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">I. Jurnal Mengajar</h3>
<table class="data">
    <thead>
        <tr>
            <th width="25" class="text-center">No</th>
            <th width="100">Hari / Tanggal</th>
            <th width="40" class="text-center">Jam</th>
            <th width="100">Mata Pelajaran</th>
            <th>Topik / Materi Pembelajaran</th>
            <th>Aktivitas & Tugas Siswa</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $index => $item)
        <tr>
            <td class="text-center" style="color: #64748b;">{{ $index + 1 }}</td>
            <td style="font-size: 9px;">
                <div style="font-weight: bold; color: #1e293b;">{{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd') }}</div>
                <div style="color: #64748b;">{{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}</div>
            </td>
            <td class="text-center" style="font-family: monospace; font-size: 9px; background: #f8fafc;">{{ $item['lesson_period'] }}</td>
            <td style="font-size: 8px; font-weight: bold; color: #4338ca; text-transform: uppercase;">{{ $item['subject']['name'] ?? ($item['subject_name'] ?? ($item['subject'] ?? '-')) }}</td>
            <td style="font-size: 9px; line-height: 1.3;"><strong>{{ $item['topic'] }}</strong></td>
            <td style="font-size: 8px; line-height: 1.3;">
                <div style="margin-bottom: 4px; color: #334155;">{{ $item['activities'] }}</div>
                @if(!empty($item['student_tasks']))
                    <div style="font-style: italic; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 3px; margin-top: 3px;">
                        <span style="font-weight: bold; font-size: 7px; color: #475569;">TUGAS:</span> {{ $item['student_tasks'] }}
                    </div>
                @endif
            </td>
        </tr>
        @endforeach
        @if(count($data) == 0)
        <tr>
            <td colspan="6" class="text-center" style="padding: 40px; color: #94a3b8; font-style: italic; border: 1px dashed #cbd5e1;">Tidak ada data jurnal mengajar dalam periode ini.</td>
        </tr>
        @endif
    </tbody>
</table>

<!-- Bagian II: Matriks Presensi Siswa -->
@if(isset($matrix) && $matrix)
<div style="page-break-before: always;"></div>
<h3 style="font-size: 11px; border-left: 4px solid #10b981; padding-left: 10px; margin-bottom: 10px; margin-top: 10px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">II. Matriks Presensi Siswa</h3>
<table class="data">
    <thead>
        <tr>
            <th width="25" class="text-center">No</th>
            <th width="160">Nama Siswa</th>
            @foreach($matrix['dates'] as $date)
                <th class="text-center" style="font-size: 7px; width: 18px; padding: 4px 1px; background: #f8fafc;">{{ \Carbon\Carbon::parse($date)->format('d/m') }}</th>
            @endforeach
            <th class="text-center" style="background: #ecfdf5; width: 18px; font-size: 8px; color: #065f46;">H</th>
            <th class="text-center" style="background: #fffbeb; width: 18px; font-size: 8px; color: #92400e;">S</th>
            <th class="text-center" style="background: #eff6ff; width: 18px; font-size: 8px; color: #1e40af;">I</th>
            <th class="text-center" style="background: #fef2f2; width: 18px; font-size: 8px; color: #991b1b;">A</th>
            <th class="text-center" style="background: #fff7ed; width: 18px; font-size: 8px; color: #9a3412;">T</th>
        </tr>
    </thead>
    <tbody>
        @foreach($matrix['report'] as $index => $row)
        <tr>
            <td class="text-center" style="font-size: 9px; color: #64748b;">{{ $index + 1 }}</td>
            <td style="font-weight: bold; text-transform: uppercase; font-size: 8px; color: #334155;">{{ $row['name'] }}</td>
            @foreach($matrix['dates'] as $date)
                <td class="text-center" style="font-size: 8px; padding: 4px 1px;">
                    @php $status = strtolower($row['daily'][$date] ?? '-'); @endphp
                    @if($status == 'hadir')
                        <span style="color: #059669; font-weight: bold;">H</span>
                    @elseif($status == 'sakit')
                        <span style="color: #d97706;">S</span>
                    @elseif($status == 'izin')
                        <span style="color: #2563eb;">I</span>
                    @elseif($status == 'alpha')
                        <span style="color: #dc2626; font-weight: bold;">A</span>
                    @elseif($status == 'terlambat')
                        <span style="color: #ea580c;">T</span>
                    @else
                        <span style="color: #cbd5e1;">-</span>
                    @endif
                </td>
            @endforeach
            <td class="text-center" style="font-weight: bold; background: #f0fdf4; font-size: 9px; color: #166534;">{{ $row['summary']['hadir'] }}</td>
            <td class="text-center" style="font-size: 9px; color: #92400e;">{{ $row['summary']['sakit'] }}</td>
            <td class="text-center" style="font-size: 9px; color: #1e40af;">{{ $row['summary']['izin'] }}</td>
            <td class="text-center" style="font-weight: bold; color: #dc2626; background: #fef2f2; font-size: 9px;">{{ $row['summary']['alpha'] }}</td>
            <td class="text-center" style="font-size: 9px; color: #9a3412;">{{ $row['summary']['terlambat'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<div style="margin-top: 15px; font-size: 8px; color: #64748b; background: #f8fafc; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
    <strong>KETERANGAN MATRIKS:</strong> 
    <span style="margin-left: 10px;">H : HADIR</span>
    <span style="margin-left: 10px;">S : SAKIT</span>
    <span style="margin-left: 10px;">I : IZIN</span>
    <span style="margin-left: 10px;">A : ALPHA / TANPA KETERANGAN</span>
    <span style="margin-left: 10px;">T : TERLAMBAT</span>
</div>
@else
<div style="margin-top: 20px; padding: 20px; background: #fffbeb; border: 1px dashed #f59e0b; color: #92400e; font-size: 10px; border-radius: 6px; text-align: center;">
    <strong>INFORMASI:</strong> Matriks presensi siswa akan muncul secara otomatis di halaman terpisah jika Anda melakukan filter **Kelas** dan **Rentang Tanggal** sebelum melakukan ekspor PDF.
</div>
@endif
@endsection
