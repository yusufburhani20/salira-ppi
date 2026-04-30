@extends('reports.pdf_layout')

@section('content')
<style>
    .agenda-entry { 
        page-break-inside: avoid; 
        margin-bottom: 40px; 
        border: 1px solid #cbd5e1;
    }
    .agenda-header {
        background: #f1f5f9;
        padding: 12px;
        border-bottom: 1px solid #cbd5e1;
    }
    .agenda-info {
        width: 100%;
        border-collapse: collapse;
    }
    .agenda-info td {
        padding: 4px 8px;
        font-size: 10px;
        vertical-align: top;
        border: none !important;
    }
    .agenda-info .label {
        font-weight: bold;
        color: #475569;
        width: 120px;
    }
    .attendance-table {
        margin-top: 0 !important;
    }
</style>

@foreach($data as $item)
<div class="agenda-entry">
    <div class="agenda-header">
        <table class="agenda-info">
            <tr>
                <td class="label">Hari / Tanggal</td>
                <td>: {{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd, D MMMM Y') }}</td>
                <td class="label">Mata Pelajaran</td>
                <td>: <span style="color: #4338ca; font-weight: bold;">{{ $item['subject']['name'] ?? ($item['subject_name'] ?? ($item['subject'] ?? '-')) }}</span></td>
            </tr>
            <tr>
                <td class="label">Jam Pelajaran</td>
                <td>: <span style="font-family: monospace;">{{ $item['lesson_period'] }}</span></td>
                <td class="label">Guru Pengajar</td>
                <td style="text-transform: uppercase;">: {{ $item['teacher']['name'] ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Topik / Materi</td>
                <td colspan="3">: <strong>{{ $item['topic'] }}</strong></td>
            </tr>
            @if($item['activities'])
            <tr>
                <td class="label">Aktivitas</td>
                <td colspan="3">: <span style="font-style: italic; color: #64748b;">{{ $item['activities'] }}</span></td>
            </tr>
            @endif
        </table>
    </div>

    <table class="data attendance-table">
        <thead>
            <tr>
                <th width="30" class="text-center">No</th>
                <th>Nama Siswa</th>
                <th width="100">NISN / NIS</th>
                <th width="80" class="text-center">Status</th>
                <th>Keterangan Tambahan</th>
            </tr>
        </thead>
        <tbody>
            @php
                $attendances = collect($item['attendances'] ?? [])->sortBy('student.name');
            @endphp
            @foreach($attendances as $index => $att)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td style="font-weight: 500;">{{ $att['student']['name'] ?? '-' }}</td>
                <td>{{ $att['student']['nisn'] ?? ($att['student']['nis'] ?? '-') }}</td>
                <td class="text-center">
                    @php
                        $status = strtolower($att['status']);
                        $statusClass = 'status-' . $status;
                    @endphp
                    <span class="{{ $statusClass }}">
                        {{ strtoupper($att['status']) }}
                    </span>
                </td>
                <td style="font-size: 9px;">{{ $att['notes'] ?? '-' }}</td>
            </tr>
            @endforeach
            @if($attendances->isEmpty())
            <tr>
                <td colspan="5" class="text-center" style="padding: 20px; color: #94a3b8;">Data absensi tidak ditemukan untuk jurnal ini.</td>
            </tr>
            @endif
        </tbody>
    </table>
</div>
@endforeach

@if(count($data) == 0)
<div style="text-align: center; padding: 50px; border: 2px dashed #e2e8f0; color: #94a3b8; font-style: italic;">
    Tidak ada data jurnal mengajar dalam periode yang dipilih.
</div>
@endif
@endsection
