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
<div style="margin-bottom: 20px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px;">
    <h3 style="margin: 0 0 8px 0; font-size: 10px; color: #1e293b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Grafik Persentase Kehadiran Harian (%)</h3>
    <svg width="100%" height="110" viewBox="0 0 750 110" style="display: block;">
        <!-- Grid Lines -->
        <line x1="40" y1="10" x2="730" y2="10" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3" />
        <line x1="40" y1="45" x2="730" y2="45" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3" />
        <line x1="40" y1="80" x2="730" y2="80" stroke="#cbd5e1" stroke-width="1" />
        
        <!-- Y-Axis Labels -->
        <text x="32" y="13" font-size="8" fill="#64748b" text-anchor="end">100%</text>
        <text x="32" y="48" font-size="8" fill="#64748b" text-anchor="end">50%</text>
        <text x="32" y="83" font-size="8" fill="#64748b" text-anchor="end">0%</text>
        
        @php
            $N = count($chartData);
            $width = 680;
            $height = 70;
            $points = [];
            $colWidth = $N > 1 ? $width / ($N - 1) : $width;
        @endphp
        
        @foreach($chartData as $i => $c)
            @php
                $x = 45 + ($N > 1 ? $i * $colWidth : $width / 2);
                $y = 80 - ($c['percent'] / 100) * $height;
                $points[] = "$x,$y";
            @endphp
            
            <!-- Column/Bar representation in background -->
            <rect x="{{ $x - 8 }}" y="{{ $y }}" width="16" height="{{ 80 - $y }}" fill="#e0e7ff" rx="2" style="opacity: 0.6;" />
            
            <!-- Value text -->
            <text x="{{ $x }}" y="{{ $y - 4 }}" font-size="7" font-weight="bold" fill="#4f46e5" text-anchor="middle">{{ $c['percent'] }}%</text>
            
            <!-- Date label -->
            <text x="{{ $x }}" y="95" font-size="7" fill="#475569" text-anchor="middle">{{ $c['date'] }}</text>
            
            <!-- Dot -->
            <circle cx="{{ $x }}" cy="{{ $y }}" r="2.5" fill="#4f46e5" stroke="#ffffff" stroke-width="1" />
        @endforeach
        
        <!-- Line connecting points -->
        @if($N > 1)
            <polyline points="{{ implode(' ', $points) }}" fill="none" stroke="#4f46e5" stroke-width="1.5" />
        @endif
    </svg>
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
