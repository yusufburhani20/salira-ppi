@extends('reports.pdf_layout')

@section('content')
<table class="data">
    <thead>
        <tr>
            <th width="150">Nama Siswa</th>
            @foreach($assessments as $a)
                <th class="text-center">
                    {{ \Carbon\Carbon::parse($a['date'])->format('d/m') }}<br>
                    <span style="font-size: 8px; font-weight: normal;">{{ $a['title'] }}</span>
                </th>
            @endforeach
            <th class="text-center" width="60" style="background-color: #f1f5f9;">Rata-rata</th>
        </tr>
    </thead>
    <tbody>
        @foreach($students as $studentName)
        <tr>
            <td style="font-weight: bold; text-transform: uppercase;">{{ $studentName }}</td>
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
    </tbody>
</table>
@endsection
