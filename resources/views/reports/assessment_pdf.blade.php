@extends('reports.pdf_layout')

@section('content')
<h3 style="font-size: 11px; border-left: 4px solid #4f46e5; padding-left: 10px; margin-bottom: 10px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Daftar Nilai Siswa</h3>
<table class="data">
    <thead>
        <tr>
            <th width="30" class="text-center">No</th>
            <th width="150">Nama Siswa</th>
            @foreach($assessments as $a)
                <th class="text-center">
                    <div style="font-weight: bold; color: #1e293b;">{{ \Carbon\Carbon::parse($a['date'])->format('d/m') }}</div>
                    <div style="font-size: 7px; font-weight: normal; color: #64748b; text-transform: none;">{{ $a['title'] }}</div>
                </th>
            @endforeach
            <th class="text-center" width="60" style="background-color: #f1f5f9; color: #1e293b;">Rata-rata</th>
        </tr>
    </thead>
    <tbody>
        @foreach($students as $index => $studentName)
        <tr>
            <td class="text-center" style="color: #64748b;">{{ $index + 1 }}</td>
            <td style="font-weight: bold; text-transform: uppercase; color: #334155;">{{ $studentName }}</td>
            @php $total = 0; $count = 0; @endphp
            @foreach($assessments as $a)
                @php 
                    $scoreObj = collect($a['scores'])->first(function($s) use ($studentName) {
                        return ($s['student']['name'] ?? '') === $studentName;
                    });
                    $val = $scoreObj['score'] ?? '-';
                    if ($val !== '-') {
                        $total += $val;
                        $count++;
                    }
                @endphp
                <td class="text-center" style="{{ $val != '-' ? 'font-weight: bold; color: #4338ca;' : 'color: #cbd5e1;' }}">
                    {{ $val }}
                </td>
            @endforeach
            <td class="text-center" style="font-weight: 800; background-color: #f8fafc; color: #1e1b4b;">
                {{ $count > 0 ? number_format($total / $count, 2) : '-' }}
            </td>
        </tr>
        @endforeach
        @if(count($students) == 0)
        <tr>
            <td colspan="{{ count($assessments) + 3 }}" class="text-center" style="padding: 30px; color: #94a3b8; font-style: italic;">Tidak ada data penilaian untuk periode ini.</td>
        </tr>
        @endif
    </tbody>
</table>
@endsection
