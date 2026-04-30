<table>
    <thead>
    <tr>
        <th colspan="6" style="font-weight: bold; font-size: 14px;">REKAP JURNAL & PRESENSI TERPADU</th>
    </tr>
    <tr>
        <th colspan="6" style="font-weight: bold; font-size: 12px;">{{ $meta['school_name'] }}</th>
    </tr>
    <tr></tr>
    <tr>
        <th colspan="2" style="font-weight: bold;">Kelas:</th>
        <th colspan="4">{{ $meta['class_name'] }}</th>
    </tr>
    <tr>
        <th colspan="2" style="font-weight: bold;">Periode:</th>
        <th colspan="4">{{ $meta['range'] }}</th>
    </tr>
    <tr>
        <th colspan="2" style="font-weight: bold;">Guru:</th>
        <th colspan="4">{{ $meta['teacher_name'] }}</th>
    </tr>
    <tr></tr>

    <!-- I. Jurnal Mengajar -->
    <tr>
        <th colspan="6" style="font-weight: bold; background-color: #4f46e5; color: #ffffff; text-align: center;">I. JURNAL MENGAJAR</th>
    </tr>
    <tr>
        <th style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #000000; text-align: center;">No</th>
        <th style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #000000; width: 150px;">Hari / Tanggal</th>
        <th style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #000000; text-align: center;">Jam</th>
        <th style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #000000; width: 120px;">Mata Pelajaran</th>
        <th style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #000000; width: 250px;">Topik / Materi Pembelajaran</th>
        <th style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #000000; width: 250px;">Aktivitas & Tugas Siswa</th>
    </tr>
    </thead>
    <tbody>
    @foreach($data as $index => $item)
        <tr>
            <td style="border: 1px solid #000000; text-align: center;">{{ $index + 1 }}</td>
            <td style="border: 1px solid #000000;">{{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd, D MMMM Y') }}</td>
            <td style="border: 1px solid #000000; text-align: center;">{{ $item['lesson_period'] }}</td>
            <td style="border: 1px solid #000000;">{{ $item['subject']['name'] ?? ($item['subject_name'] ?? ($item['subject'] ?? '-')) }}</td>
            <td style="border: 1px solid #000000; font-weight: bold;">{{ $item['topic'] }}</td>
            <td style="border: 1px solid #000000;">
                {{ $item['activities'] }}
                @if(!empty($item['student_tasks']))
                    (Tugas: {{ $item['student_tasks'] }})
                @endif
            </td>
        </tr>
    @endforeach
    </tbody>
</table>

@if($matrix)
<table>
    <tr></tr>
    <tr></tr>
    <thead>
    <tr>
        <th colspan="{{ count($matrix['dates']) + 7 }}" style="font-weight: bold; background-color: #10b981; color: #ffffff; text-align: center;">II. MATRIKS PRESENSI SISWA</th>
    </tr>
    <tr>
        <th style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #000000; text-align: center;">No</th>
        <th style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #000000; width: 200px;">Nama Siswa</th>
        @foreach($matrix['dates'] as $date)
            <th style="font-weight: bold; background-color: #f1f5f9; border: 1px solid #000000; text-align: center;">{{ \Carbon\Carbon::parse($date)->format('d/m') }}</th>
        @endforeach
        <th style="font-weight: bold; background-color: #ecfdf5; border: 1px solid #000000; text-align: center;">H</th>
        <th style="font-weight: bold; background-color: #fffbeb; border: 1px solid #000000; text-align: center;">S</th>
        <th style="font-weight: bold; background-color: #eff6ff; border: 1px solid #000000; text-align: center;">I</th>
        <th style="font-weight: bold; background-color: #fef2f2; border: 1px solid #000000; text-align: center;">A</th>
        <th style="font-weight: bold; background-color: #fff7ed; border: 1px solid #000000; text-align: center;">T</th>
    </tr>
    </thead>
    <tbody>
    @foreach($matrix['report'] as $index => $row)
        <tr>
            <td style="border: 1px solid #000000; text-align: center;">{{ $index + 1 }}</td>
            <td style="border: 1px solid #000000; font-weight: bold;">{{ $row['name'] }}</td>
            @foreach($matrix['dates'] as $date)
                <td style="border: 1px solid #000000; text-align: center;">
                    @php $status = strtolower($row['daily'][$date] ?? '-'); @endphp
                    @if($status == 'hadir') H @elseif($status == 'sakit') S @elseif($status == 'izin') I @elseif($status == 'alpha') A @elseif($status == 'terlambat') T @else - @endif
                </td>
            @endforeach
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #f0fdf4;">{{ $row['summary']['hadir'] }}</td>
            <td style="border: 1px solid #000000; text-align: center;">{{ $row['summary']['sakit'] }}</td>
            <td style="border: 1px solid #000000; text-align: center;">{{ $row['summary']['izin'] }}</td>
            <td style="border: 1px solid #000000; text-align: center; font-weight: bold; color: #dc2626; background-color: #fef2f2;">{{ $row['summary']['alpha'] }}</td>
            <td style="border: 1px solid #000000; text-align: center;">{{ $row['summary']['terlambat'] }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
@endif
