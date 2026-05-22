@extends('reports.pdf_layout')

@section('content')
@php
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
                <!-- Value label -->
                <div style="font-size: 7px; font-weight: bold; color: #4f46e5; margin-bottom: 3px;">{{ $c['percent'] }}%</div>
                
                <!-- Robust Bar -->
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

<div style="margin-top: 20px; font-size: 9px; color: #64748b;">
    <strong>Keterangan:</strong> H (Hadir), S (Sakit), I (Izin), A (Alpha), T (Terlambat)
</div>
@endsection
