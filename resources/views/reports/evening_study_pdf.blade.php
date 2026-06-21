@extends('reports.pdf_layout')

@section('content')
<h3 style="font-size: 11px; border-left: 4px solid #000; padding-left: 10px; margin-bottom: 10px; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">Daftar Kegiatan Belajar Malam</h3>
<table class="data">
    <thead>
        <tr>
            <th width="30" class="text-center">No</th>
            <th width="100">Hari / Tanggal</th>
            <th width="70" class="text-center">Kelas</th>
            <th width="120">Pengawas</th>
            <th width="180">Nama Kegiatan / Materi</th>
            <th width="180">Catatan / Keterangan</th>
            <th width="170">Kehadiran / Absensi</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $index => $item)
        <tr>
            <td class="text-center">{{ $index + 1 }}</td>
            <td style="font-size: 9px;">
                <div style="font-weight: bold;">{{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd') }}</div>
                <div>{{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}</div>
            </td>
            <td class="text-center" style="font-weight: bold; background: #eee; font-size: 10px;">{{ $item['academic_class']['name'] ?? '-' }}</td>
            <td style="font-size: 9px;">{{ $item['supervisor']['name'] ?? '-' }}</td>
            <td style="font-size: 9px; font-weight: bold;">{{ $item['activity_name'] }}</td>
            <td style="font-size: 9px; line-height: 1.3;">{{ $item['notes'] ?? '-' }}</td>
            <td style="font-size: 8px; line-height: 1.3;">
                @php
                    $absentList = [];
                    if (!empty($item['attendances'])) {
                        foreach ($item['attendances'] as $att) {
                            $statusVal = strtolower($att['status']['value'] ?? ($att['status'] ?? ''));
                            if (in_array($statusVal, ['sakit', 'izin', 'alpha', 'terlambat'])) {
                                $studentName = $att['student']['name'] ?? '-';
                                $statusLabel = ucfirst($statusVal);
                                $absentList[$statusLabel][] = $studentName;
                            }
                        }
                    }
                @endphp
                @if(empty($absentList))
                    <span style="color: #16a34a; font-weight: bold;">Hadir Semua</span>
                @else
                    @foreach($absentList as $status => $names)
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
