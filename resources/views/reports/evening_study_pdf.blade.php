@extends('reports.pdf_layout')

@section('content')
<h3 style="font-size: 11px; border-left: 4px solid #000; padding-left: 8px; margin-bottom: 10px; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">
    Daftar Kegiatan Belajar Malam
</h3>

<table class="data">
    <thead>
        <tr>
            <th width="22" class="text-center">No</th>
            <th width="70">Hari / Tanggal</th>
            <th width="38" class="text-center">Kelas</th>
            <th width="90">Pengawas</th>
            <th width="130">Kegiatan &amp; Catatan</th>
            <th width="90" class="text-center">Foto</th>
            <th width="70" class="text-center">Ringkasan</th>
            <th width="250">Rincian Kehadiran Siswa</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $index => $item)
        @php
            // Resolve local photo path for DomPDF inline rendering
            $photoPath = null;
            $photoUrl  = null;
            if (!empty($item['photo_path'])) {
                if (file_exists(storage_path('app/public/' . $item['photo_path']))) {
                    $photoPath = storage_path('app/public/' . $item['photo_path']);
                } elseif (file_exists(public_path('storage/' . $item['photo_path']))) {
                    $photoPath = public_path('storage/' . $item['photo_path']);
                }
                // Public URL so DomPDF can embed it as a clickable link
                $photoUrl = url('storage/' . $item['photo_path']);
            } elseif (!empty($item['photo_url'])) {
                $photoUrl = url($item['photo_url']);
            }

            // Build per-status student lists
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
        @endphp
        <tr>
            <td class="text-center" style="font-size: 8px;">{{ $index + 1 }}</td>
            <td style="font-size: 8px;">
                <strong>{{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd') }}</strong><br>
                {{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}
            </td>
            <td class="text-center" style="font-size: 9px; font-weight: bold;">{{ $item['academic_class']['name'] ?? '-' }}</td>
            <td style="font-size: 8px;">{{ $item['supervisor']['name'] ?? '-' }}</td>
            <td style="font-size: 8px; line-height: 1.4;">
                <strong style="text-transform: uppercase;">{{ $item['activity_name'] }}</strong>
                @if(!empty($item['notes']))
                    <div style="margin-top: 3px; font-style: italic; border-top: 1px dashed #999; padding-top: 2px;">
                        <strong>Catatan:</strong> {{ $item['notes'] }}
                    </div>
                @endif
            </td>
            <td class="text-center" style="font-size: 8px;">
                @if($photoPath && $photoUrl)
                    <a href="{{ $photoUrl }}" style="display: inline-block; border: 1px solid #000; text-decoration: none; color: #000;">
                        <img src="{{ $photoPath }}" style="width: 80px; max-height: 55px; display: block;">
                        <div style="font-size: 6px; padding: 1px 0; text-align: center; background: #eee; border-top: 1px solid #000;">&#128247; Klik untuk buka</div>
                    </a>
                @elseif($photoPath)
                    <img src="{{ $photoPath }}" style="width: 80px; max-height: 55px; border: 1px solid #000;">
                @elseif($photoUrl)
                    <a href="{{ $photoUrl }}" style="font-size: 8px; font-weight: bold; text-decoration: underline; color: #000;">[Lihat Foto]</a>
                @else
                    <span style="font-style: italic; font-size: 7px;">Tidak ada foto</span>
                @endif
            </td>
            <td class="text-center" style="font-size: 7px; line-height: 1.6;">
                <div>Total: <strong>{{ $total }}</strong></div>
                <div>H: <strong>{{ $counts['hadir'] }}</strong></div>
                <div>S: {{ $counts['sakit'] }}</div>
                <div>I: {{ $counts['izin'] }}</div>
                <div>A: <strong>{{ $counts['alpha'] }}</strong></div>
                <div>T: {{ $counts['terlambat'] }}</div>
            </td>
            <td style="font-size: 7px; line-height: 1.5;">
                @foreach($byStatus as $label => $names)
                    @if(count($names) > 0)
                        <div style="margin-bottom: 2px;">
                            <strong>{{ $label }}:</strong>
                            @foreach($names as $i => $n)
                                {{ $i + 1 }}. {{ $n }}<br>
                            @endforeach
                        </div>
                    @endif
                @endforeach
                @if($total === 0)
                    <span style="font-style: italic;">Belum ada data</span>
                @endif
            </td>
        </tr>
        @endforeach
        @if(count($data) == 0)
        <tr>
            <td colspan="8" class="text-center" style="padding: 30px; font-style: italic; border: 1px dashed #000;">
                Tidak ada data belajar malam dalam periode ini.
            </td>
        </tr>
        @endif
    </tbody>
</table>

{{-- Supervisor Summary Section --}}
@if(!empty($supervisor_summary) && count($supervisor_summary) > 0)
<div style="margin-top: 18px; page-break-inside: avoid;">
    <h4 style="font-size: 10px; border-left: 4px solid #000; padding-left: 8px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
        Rangkuman Pengawasan Per Pengawas
    </h4>
    <table style="width: 45%; border-collapse: collapse; font-size: 9px;">
        <thead>
            <tr>
                <th style="border: 1px solid #000; padding: 4px 6px; background: #eee; text-align: center; width: 30px;">No</th>
                <th style="border: 1px solid #000; padding: 4px 6px; background: #eee;">Nama Pengawas</th>
                <th style="border: 1px solid #000; padding: 4px 6px; background: #eee; text-align: center; width: 80px;">Jumlah Sesi</th>
                <th style="border: 1px solid #000; padding: 4px 6px; background: #eee; text-align: center; width: 80px;">% dari Total</th>
            </tr>
        </thead>
        <tbody>
            @php $totalSesi = array_sum($supervisor_summary); $noSv = 1; @endphp
            @foreach($supervisor_summary as $supervisorName => $count)
            <tr>
                <td style="border: 1px solid #000; padding: 3px 6px; text-align: center;">{{ $noSv++ }}</td>
                <td style="border: 1px solid #000; padding: 3px 6px;">{{ $supervisorName }}</td>
                <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; font-weight: bold;">{{ $count }}</td>
                <td style="border: 1px solid #000; padding: 3px 6px; text-align: center;">
                    {{ $totalSesi > 0 ? number_format(($count / $totalSesi) * 100, 1) : 0 }}%
                </td>
            </tr>
            @endforeach
            <tr>
                <td colspan="2" style="border: 1px solid #000; padding: 3px 6px; font-weight: bold; text-align: right;">TOTAL</td>
                <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; font-weight: bold;">{{ $totalSesi }}</td>
                <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; font-weight: bold;">100%</td>
            </tr>
        </tbody>
    </table>
</div>
@endif
@endsection
