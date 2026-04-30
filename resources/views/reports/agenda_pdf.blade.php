@extends('reports.pdf_layout')

@section('content')
<table class="data">
    <thead>
        <tr>
            <th width="80">Hari/Tgl</th>
            <th width="40">Jam</th>
            <th width="100">Guru</th>
            <th width="80">Mapel</th>
            <th>Materi & Aktivitas</th>
            <th width="20">H</th>
            <th width="20">S</th>
            <th width="20">I</th>
            <th width="20">A</th>
            <th width="100">Ket. Absensi</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $item)
        @php
            $atts = collect($item['attendances'] ?? []);
            $h = $atts->where('status', 'hadir')->count();
            $s = $atts->where('status', 'sakit')->count();
            $i = $atts->where('status', 'izin')->count();
            $a = $atts->where('status', 'alpha')->count();
            $ket = $atts->whereIn('status', ['sakit', 'izin', 'alpha'])->map(fn($att) => ($att['student']['name'] ?? 'Siswa') . ' ('.strtoupper(substr($att['status'], 0, 1)).')')->implode(', ');
        @endphp
        <tr>
            <td>
                <strong>{{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd') }}</strong><br>
                {{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}
            </td>
            <td class="text-center" style="font-family: monospace;">{{ $item['lesson_period'] }}</td>
            <td style="text-transform: uppercase; font-weight: 500; font-size: 9px;">{{ $item['teacher']['name'] ?? '-' }}</td>
            <td style="color: #4338ca; font-weight: bold; font-size: 9px;">{{ $item['subject']['name'] ?? ($item['subject_name'] ?? ($item['subject'] ?? '-')) }}</td>
            <td>
                <div style="font-weight: bold; margin-bottom: 3px;">{{ $item['topic'] }}</div>
                <div style="font-style: italic; color: #64748b; font-size: 8px;">{{ $item['activities'] }}</div>
            </td>
            <td class="text-center">{{ $h }}</td>
            <td class="text-center">{{ $s }}</td>
            <td class="text-center">{{ $i }}</td>
            <td class="text-center">{{ $a }}</td>
            <td style="font-size: 8px; color: #ef4444;">{{ $ket ?: '-' }}</td>
        </tr>
        @endforeach
        @if(count($data) == 0)
        <tr>
            <td colspan="10" style="text-align: center; padding: 30px; color: #94a3b8; font-style: italic;">Tidak ada data jurnal mengajar dalam periode ini.</td>
        </tr>
        @endif
    </tbody>
</table>
@endsection
