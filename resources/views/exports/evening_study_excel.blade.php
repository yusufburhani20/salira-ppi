<html>
<body>
<table>
    <thead>
    {{-- Title Block --}}
    <tr>
        <th></th>
        <th></th>
        <th colspan="7" style="font-weight: bold; font-size: 14px;">REKAPITULASI BELAJAR MALAM</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th colspan="7" style="font-weight: bold; font-size: 11px;">{{ $meta['school_name'] ?? 'SALIRA ACADEMY' }}</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th colspan="7" style="font-style: italic; font-size: 9px;">Periode: {{ $meta['range'] ?? '-' }}</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th colspan="7" style="font-size: 9px;">Kelas: {{ $meta['class_name'] ?? 'Semua Kelas' }}</th>
    </tr>
    <tr>
        <th></th>
        <th></th>
        <th colspan="7" style="font-size: 9px;">Dicetak pada: {{ $meta['printed_at'] ?? date('d/m/Y H:i:s') }}</th>
    </tr>
    <tr>
        <th colspan="9"></th>
    </tr>

    {{-- Column Headers --}}
    <tr>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; text-align: center; width: 35px;">No</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; width: 100px;">Hari / Tanggal</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; width: 80px; text-align: center;">Kelas</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; width: 140px;">Pengawas</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; width: 200px;">Nama Kegiatan / Materi</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; width: 220px;">Catatan / Keterangan</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; width: 110px; text-align: center;">Foto Dokumentasi</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; width: 80px; text-align: center;">Ringkasan</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; width: 320px;">Rincian Kehadiran Siswa</th>
    </tr>
    </thead>
    <tbody>
    @foreach($data as $index => $item)
        @php
            // Build per-status student lists (including Hadir)
            $attendances = $item['attendances'] ?? [];
            $total       = count($attendances);
            $counts      = ['hadir' => 0, 'sakit' => 0, 'izin' => 0, 'alpha' => 0, 'terlambat' => 0];
            $byStatus    = ['Hadir' => [], 'Sakit' => [], 'Izin' => [], 'Alpha' => [], 'Terlambat' => []];

            foreach ($attendances as $att) {
                $sv  = strtolower($att['status']['value'] ?? ($att['status'] ?? ''));
                $nm  = $att['student']['name'] ?? '-';
                if (array_key_exists($sv, $counts)) {
                    $counts[$sv]++;
                }
                $label = ucfirst($sv);
                if (isset($byStatus[$label])) {
                    $byStatus[$label][] = $nm;
                }
            }

            // Photo link
            $photoUrl = null;
            if (!empty($item['photo_path'])) {
                $photoUrl = url('storage/' . $item['photo_path']);
            } elseif (!empty($item['photo_url'])) {
                $photoUrl = url($item['photo_url']);
            }
        @endphp
        <tr>
            <td style="border: 1px solid #000; text-align: center; vertical-align: top;">{{ $index + 1 }}</td>
            <td style="border: 1px solid #000; vertical-align: top;">
                <strong>{{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd') }}</strong><br>
                {{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}
            </td>
            <td style="border: 1px solid #000; text-align: center; vertical-align: top; font-weight: bold;">{{ $item['academic_class']['name'] ?? '-' }}</td>
            <td style="border: 1px solid #000; vertical-align: top;">{{ $item['supervisor']['name'] ?? '-' }}</td>
            <td style="border: 1px solid #000; vertical-align: top; font-weight: bold;">{{ $item['activity_name'] }}</td>
            <td style="border: 1px solid #000; vertical-align: top;">{{ $item['notes'] ?? '-' }}</td>
            <td style="border: 1px solid #000; text-align: center; vertical-align: top;">
                @if($photoUrl)
                    <a href="{{ $photoUrl }}" style="font-weight: bold; text-decoration: underline; color: #000;">Lihat Foto</a>
                @else
                    <span style="font-style: italic; font-size: 8px;">Tidak ada foto</span>
                @endif
            </td>
            <td style="border: 1px solid #000; text-align: center; vertical-align: top; font-size: 9px; line-height: 1.7;">
                Total: <strong>{{ $total }}</strong><br>
                H: <strong>{{ $counts['hadir'] }}</strong><br>
                S: {{ $counts['sakit'] }}<br>
                I: {{ $counts['izin'] }}<br>
                A: <strong>{{ $counts['alpha'] }}</strong><br>
                T: {{ $counts['terlambat'] }}
            </td>
            <td style="border: 1px solid #000; vertical-align: top; font-size: 9px; line-height: 1.5;">
                @foreach($byStatus as $label => $names)
                    @if(count($names) > 0)
                        <strong>{{ $label }}:</strong><br>
                        @foreach($names as $i => $n)
                            &nbsp;&nbsp;{{ $i + 1 }}. {{ $n }}<br>
                        @endforeach
                    @endif
                @endforeach
                @if($total === 0)
                    <em>Belum ada data</em>
                @endif
            </td>
        </tr>
    @endforeach
    @if(count($data) == 0)
        <tr>
            <td colspan="9" style="text-align: center; border: 1px solid #000; padding: 20px; font-style: italic;">Tidak ada data belajar malam dalam periode ini.</td>
        </tr>
    @endif
    </tbody>
</table>

{{-- Blank separator rows --}}
<tr><td colspan="9"></td></tr>
<tr><td colspan="9"></td></tr>

{{-- Supervisor Summary Table --}}
@if(!empty($meta['supervisor_summary']) && count($meta['supervisor_summary']) > 0)
@php $totalSesi = array_sum($meta['supervisor_summary']); @endphp
<table>
    <thead>
    <tr>
        <th colspan="4" style="font-weight: bold; font-size: 12px; padding-bottom: 4px;">RANGKUMAN PENGAWASAN PER PENGAWAS</th>
    </tr>
    <tr>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; text-align: center; width: 40px;">No</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; width: 280px;">Nama Pengawas</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; text-align: center; width: 120px;">Jumlah Sesi</th>
        <th style="font-weight: bold; background-color: #eee; border: 2px solid #000; text-align: center; width: 120px;">% dari Total</th>
    </tr>
    </thead>
    <tbody>
    @php $svNo = 1; @endphp
    @foreach($meta['supervisor_summary'] as $svName => $svCount)
    <tr>
        <td style="border: 1px solid #000; text-align: center; vertical-align: top;">{{ $svNo++ }}</td>
        <td style="border: 1px solid #000; vertical-align: top;">{{ $svName }}</td>
        <td style="border: 1px solid #000; text-align: center; vertical-align: top; font-weight: bold;">{{ $svCount }}</td>
        <td style="border: 1px solid #000; text-align: center; vertical-align: top;">
            {{ $totalSesi > 0 ? number_format(($svCount / $totalSesi) * 100, 1) : 0 }}%
        </td>
    </tr>
    @endforeach
    <tr>
        <td colspan="2" style="border: 1px solid #000; text-align: right; font-weight: bold; padding: 4px 6px;">TOTAL</td>
        <td style="border: 1px solid #000; text-align: center; font-weight: bold;">{{ $totalSesi }}</td>
        <td style="border: 1px solid #000; text-align: center; font-weight: bold;">100%</td>
    </tr>
    </tbody>
</table>
@endif

</body>
</html>
