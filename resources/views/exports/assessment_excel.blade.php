<html>
<body>
<table>
    <thead>
    <tr>
        <th></th>
        <th></th>
        <th colspan="{{ count($assessments) }}" style="font-weight: bold; font-size: 14px; color: #4F46E5;">REKAP PENILAIAN HARIAN</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th colspan="{{ count($assessments) }}" style="font-weight: bold; font-size: 11px;">{{ $meta['school_name'] ?? 'SALIRA ACADEMY' }}</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th colspan="{{ count($assessments) }}" style="font-style: italic; font-size: 9px; color: #64748b;">Periode: {{ $meta['range'] ?? '-' }}</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th colspan="{{ count($assessments) }}" style="font-size: 9px; color: #64748b;">Dicetak pada: {{ date('d/m/Y H:i:s') }}</th>
    </tr>
    <tr>
        <th colspan="{{ count($assessments) + 2 }}"></th>
    </tr>
    <tr>
        <th style="font-weight: bold; background-color: #eee; border: 1px solid #000;">Kelas:</th>
        <th colspan="{{ count($assessments) + 1 }}" style="border: 1px solid #000; font-weight: bold;">{{ $meta['class_name'] ?? '-' }}</th>
    </tr>
    <tr>
        <th style="font-weight: bold; background-color: #eee; border: 1px solid #000;">Mata Pelajaran:</th>
        <th colspan="{{ count($assessments) + 1 }}" style="border: 1px solid #000; font-weight: bold;">{{ $meta['subject_name'] ?? '-' }}</th>
    </tr>
    <tr>
        <th style="font-weight: bold; background-color: #eee; border: 1px solid #000;">Guru:</th>
        <th colspan="{{ count($assessments) + 1 }}" style="border: 1px solid #000;">{{ $meta['teacher_name'] ?? '-' }}</th>
    </tr>
    <tr>
        <th colspan="{{ count($assessments) + 2 }}"></th>
    </tr>
    <tr>
        <th style="font-weight: bold; background-color: #000; color: #ffffff; border: 2px solid #000000; text-align: center; width: 200px;">Nama Siswa</th>
        @foreach($assessments as $a)
            <th style="font-weight: bold; background-color: #eee; border: 2px solid #000000; text-align: center; width: 100px;">
                {{ \Carbon\Carbon::parse($a['date'])->format('d/m') }}<br>
                {{ $a['title'] }}<br>
                (KKTP: {{ $a['kkm'] ?? 75 }})
            </th>
        @endforeach
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000000; text-align: center; width: 100px;">Rata-rata</th>
    </tr>
    </thead>
    <tbody>
    @foreach($students as $studentName)
        <tr>
            <td style="border: 1px solid #000; font-weight: bold;">{{ $studentName }}</td>
            @php $total = 0; $count = 0; @endphp
            @foreach($assessments as $a)
                @php 
                    $scoreObj = collect($a['scores'])->first(function($s) use ($studentName) {
                        return ($s['student']['name'] ?? '') === $studentName;
                    });
                    $val = $scoreObj['score'] ?? '-';
                    $kkmVal = $a['kkm'] ?? 75;
                    if ($val !== '-') {
                        $total += $val;
                        $count++;
                    }
                @endphp
                <td style="border: 1px solid #000; text-align: center; {{ $val != '-' ? 'font-weight: bold;' : 'color: #333;' }} {{ $val != '-' && $val < $kkmVal ? 'color: #b91c1c; background-color: #fef2f2;' : '' }}">
                    {{ $val }}
                </td>
            @endforeach
            <td style="border: 1px solid #000; text-align: center; font-weight: bold; background-color: #f9f9f9;">
                {{ $count > 0 ? number_format($total / $count, 2) : '-' }}
            </td>
        </tr>
    @endforeach
    </tbody>
</table>
</body>
</html>
