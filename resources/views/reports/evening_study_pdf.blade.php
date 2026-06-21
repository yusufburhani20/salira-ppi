@extends('reports.pdf_layout')

@section('content')
<h3 style="font-size: 11px; border-left: 4px solid #000; padding-left: 10px; margin-bottom: 10px; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">Daftar Kegiatan Belajar Malam</h3>
<table class="data">
    <thead>
        <tr>
            <th width="25" class="text-center">No</th>
            <th width="85">Hari / Tanggal</th>
            <th width="40" class="text-center">Kelas</th>
            <th width="100">Pengawas</th>
            <th width="190">Kegiatan &amp; Catatan</th>
            <th width="100" class="text-center">Foto Dokumentasi</th>
            <th width="220">Rincian Kehadiran</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $index => $item)
        @php
            $photoPath = null;
            if (!empty($item['photo_path'])) {
                if (file_exists(storage_path('app/public/' . $item['photo_path']))) {
                    $photoPath = storage_path('app/public/' . $item['photo_path']);
                } elseif (file_exists(public_path('storage/' . $item['photo_path']))) {
                    $photoPath = public_path('storage/' . $item['photo_path']);
                }
            }

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
        <tr>
            <td class="text-center">{{ $index + 1 }}</td>
            <td style="font-size: 9px;">
                <div style="font-weight: bold;">{{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd') }}</div>
                <div>{{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}</div>
            </td>
            <td class="text-center" style="font-weight: bold; background: #eee; font-size: 10px;">{{ $item['academic_class']['name'] ?? '-' }}</td>
            <td style="font-size: 9px;">{{ $item['supervisor']['name'] ?? '-' }}</td>
            <td style="font-size: 9px; line-height: 1.3;">
                <strong style="color: #4f46e5; text-transform: uppercase;">{{ $item['activity_name'] }}</strong>
                @if(!empty($item['notes']))
                    <div style="font-size: 8px; color: #475569; margin-top: 4px; font-style: italic; border-top: 1px dashed #e2e8f0; padding-top: 2px;">
                        <strong>Catatan:</strong> {{ $item['notes'] }}
                    </div>
                @endif
            </td>
            <td class="text-center">
                @if($photoPath)
                    <img src="{{ $photoPath }}" style="width: 90px; max-height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;">
                @else
                    <span style="color: #94a3b8; font-style: italic; font-size: 8px;">Tidak ada foto</span>
                @endif
            </td>
            <td style="font-size: 8px; line-height: 1.3;">
                <div style="font-weight: bold; margin-bottom: 3px; color: #1e293b; background: #f1f5f9; padding: 2px 4px; border-radius: 3px;">
                    Total: {{ $total }} | H: {{ $hadir }} | S: {{ $sakit }} | I: {{ $izin }} | A: {{ $alpha }} | T: {{ $terlambat }}
                </div>
                @if(empty($absents))
                    <span style="color: #16a34a; font-weight: bold;">Hadir Semua</span>
                @else
                    @foreach($absents as $status => $names)
                        <div style="margin-bottom: 2px;">
                            <strong style="color: #dc2626;">{{ $status }}:</strong>
                            <span style="color: #334155;">{{ implode(', ', $names) }}</span>
                        </div>
                    @endforeach
                @endif
            </td>
        </tr>
        @endforeach
        @if(count($data) == 0)
        <tr>
            <td colspan="7" class="text-center" style="padding: 40px; font-style: italic; border: 1px dashed #000;">Tidak ada data belajar malam dalam periode ini.</td>
        </tr>
        @endif
    </tbody>
</table>
@endsection
