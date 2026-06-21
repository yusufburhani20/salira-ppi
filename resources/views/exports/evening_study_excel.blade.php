<html>
<body>
<table>
    <thead>
    <tr>
        <th></th>
        <th></th>
        <th colspan="6" style="font-weight: bold; font-size: 14px; color: #4F46E5;">REKAPITULASI BELAJAR MALAM</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th colspan="6" style="font-weight: bold; font-size: 11px;">{{ $meta['school_name'] ?? 'SALIRA ACADEMY' }}</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th colspan="6" style="font-style: italic; font-size: 9px; color: #64748b;">Periode: {{ $meta['range'] ?? '-' }}</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th colspan="6" style="font-size: 9px; color: #64748b;">Dicetak pada: {{ $meta['printed_at'] ?? date('d/m/Y H:i:s') }}</th>
    </tr>
    <tr>
        <th colspan="8"></th>
    </tr>
    <tr>
        <th colspan="2" style="font-weight: bold; background-color: #eee; border: 1px solid #000;">Kelas:</th>
        <th colspan="6" style="border: 1px solid #000; font-weight: bold;">{{ $meta['class_name'] ?? 'Semua Kelas' }}</th>
    </tr>
    <tr>
        <th colspan="8"></th>
    </tr>
 
    <tr>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000000; text-align: center; width: 40px;">No</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000000; width: 120px;">Hari / Tanggal</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000000; width: 100px; text-align: center;">Kelas</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000000; width: 150px;">Pengawas</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000000; width: 220px;">Nama Kegiatan / Materi</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000000; width: 250px;">Catatan / Keterangan</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000000; width: 130px; text-align: center;">Foto Dokumentasi</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000000; width: 300px;">Kehadiran / Absensi</th>
    </tr>
    </thead>
    <tbody>
    @foreach($data as $index => $item)
        <tr>
            <td style="border: 1px solid #000; text-align: center; vertical-align: top;">{{ $index + 1 }}</td>
            <td style="border: 1px solid #000; vertical-align: top;">
                {{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd') }}<br>
                {{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}
            </td>
            <td style="border: 1px solid #000; text-align: center; vertical-align: top; font-weight: bold;">{{ $item['academic_class']['name'] ?? '-' }}</td>
            <td style="border: 1px solid #000; vertical-align: top;">{{ $item['supervisor']['name'] ?? '-' }}</td>
            <td style="border: 1px solid #000; vertical-align: top; font-weight: bold;">{{ $item['activity_name'] }}</td>
            <td style="border: 1px solid #000; vertical-align: top;">{{ $item['notes'] ?? '-' }}</td>
            <td style="border: 1px solid #000; text-align: center; vertical-align: top;">
                @if(!empty($item['photo_path']))
                    <a href="{{ url('storage/' . $item['photo_path']) }}" style="color: #4F46E5; font-weight: bold; text-decoration: underline;">Lihat Foto</a>
                @elseif(!empty($item['photo_url']))
                    <a href="{{ url($item['photo_url']) }}" style="color: #4F46E5; font-weight: bold; text-decoration: underline;">Lihat Foto</a>
                @else
                    <span style="color: #64748b; font-style: italic;">Tidak ada foto</span>
                @endif
            </td>
            <td style="border: 1px solid #000; vertical-align: top;">
                @php
                    $attendances = $item['attendances'] ?? [];
                    $total = count($attendances);
                    $hadir = 0; $sakit = 0; $izin = 0; $alpha = 0; $terlambat = 0;
                    $absents = [];
                    
                    foreach ($attendances as $att) {
                        $statusVal = strtolower($att['status']['value'] ?? ($att['status'] ?? ''));
                        if ($statusVal === 'hadir') {
                            $hadir++;
                        } elseif ($statusVal === 'sakit') {
                            $sakit++;
                            $absents['Sakit'][] = $att['student']['name'] ?? '-';
                        } elseif ($statusVal === 'izin') {
                            $izin++;
                            $absents['Izin'][] = $att['student']['name'] ?? '-';
                        } elseif ($statusVal === 'alpha') {
                            $alpha++;
                            $absents['Alpha'][] = $att['student']['name'] ?? '-';
                        } elseif ($statusVal === 'terlambat') {
                            $terlambat++;
                            $absents['Telat'][] = $att['student']['name'] ?? '-';
                        }
                    }
                @endphp
                <strong>Total: {{ $total }} | H: {{ $hadir }} | S: {{ $sakit }} | I: {{ $izin }} | A: {{ $alpha }} | T: {{ $terlambat }}</strong><br>
                @if(empty($absents))
                    Hadir Semua
                @else
                    @foreach($absents as $status => $names)
                        {{ $status }}: {{ implode(', ', $names) }}<br>
                    @endforeach
                @endif
            </td>
        </tr>
    @endforeach
    @if(count($data) == 0)
        <tr>
            <td colspan="8" style="text-align: center; border: 1px solid #000; padding: 20px; font-style: italic;">Tidak ada data belajar malam dalam periode ini.</td>
        </tr>
    @endif
    </tbody>
</table>
</body>
</html>
