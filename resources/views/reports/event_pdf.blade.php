@extends('reports.pdf_layout')

@section('content')
<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 15px;">
    <table width="100%" style="font-size: 10px; border-collapse: collapse;">
        <tr>
            <td width="18%" style="font-weight: bold; color: #475569;">Nama Event:</td>
            <td width="32%" style="font-weight: bold; color: #0f172a;">{{ $event->name }}</td>
            <td width="18%" style="font-weight: bold; color: #475569;">Tanggal Rapat:</td>
            <td width="32%">{{ \Carbon\Carbon::parse($event->date)->isoFormat('dddd, D MMMM YYYY') }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold; color: #475569;">Jam Pelaksanaan:</td>
            <td>{{ substr($event->start_time, 0, 5) }} - {{ substr($event->end_time, 0, 5) }} WIB</td>
            <td style="font-weight: bold; color: #475569;">Status Event:</td>
            <td>
                @if($event->is_active)
                    <span style="color: #047857; font-weight: bold;">[ AKTIF ]</span>
                @else
                    <span style="color: #be123c; font-weight: bold;">[ DITUTUP ]</span>
                @endif
            </td>
        </tr>
        <tr>
            <td style="font-weight: bold; color: #475569;">Dibuat Oleh:</td>
            <td>{{ $event->creator->name ?? 'Admin' }}</td>
            <td style="font-weight: bold; color: #475569;">Total Kehadiran:</td>
            <td><strong style="font-size: 11px;">{{ count($event->attendances) }} Orang</strong></td>
        </tr>
        @if($event->description)
        <tr>
            <td style="font-weight: bold; color: #475569; vertical-align: top;">Deskripsi:</td>
            <td colspan="3" style="font-style: italic; color: #334155;">{{ $event->description }}</td>
        </tr>
        @endif
    </table>
</div>

<h3 style="font-size: 11px; border-left: 4px solid #4f46e5; padding-left: 8px; margin-bottom: 10px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
    Daftar Kehadiran Peserta
</h3>

<table class="data">
    <thead>
        <tr>
            <th width="25" class="text-center">No</th>
            <th width="100">NIP / ID</th>
            <th>Nama Guru / Karyawan</th>
            <th width="110" class="text-center">Waktu Presensi</th>
            <th width="80" class="text-center">Foto Presensi</th>
            <th width="55" class="text-center">Status</th>
        </tr>
    </thead>
    <tbody>
        @forelse($event->attendances as $index => $att)
        @php
            $proofPath = null;
            $proofUrl = null;
            if (!empty($att->proof_path)) {
                if (file_exists(storage_path('app/public/' . $att->proof_path))) {
                    $proofPath = storage_path('app/public/' . $att->proof_path);
                } elseif (file_exists(public_path('storage/' . $att->proof_path))) {
                    $proofPath = public_path('storage/' . $att->proof_path);
                }
                $proofUrl = url('storage/' . $att->proof_path);
            }
        @endphp
        <tr>
            <td class="text-center">{{ $index + 1 }}</td>
            <td>{{ $att->user->nip ?? '-' }}</td>
            <td><strong>{{ $att->user->name ?? 'N/A' }}</strong></td>
            <td class="text-center">{{ $att->created_at->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB</td>
            <td class="text-center" style="vertical-align: middle;">
                @if($proofPath && file_exists($proofPath))
                    <img src="{{ $proofPath }}" style="width: 55px; max-height: 45px; object-fit: cover; border: 1px solid #cbd5e1; border-radius: 4px; display: inline-block;">
                @elseif($proofUrl)
                    <a href="{{ $proofUrl }}" style="font-size: 8px; color: #2563eb; text-decoration: underline;">[Lihat Foto]</a>
                @else
                    <span style="color: #94a3b8; font-style: italic; font-size: 8px;">Tidak Ada Foto</span>
                @endif
            </td>
            <td class="text-center status-hadir">Hadir</td>
        </tr>
        @empty
        <tr>
            <td colspan="6" class="text-center" style="font-style: italic; padding: 15px;">Belum ada peserta yang melakukan presensi untuk event ini.</td>
        </tr>
        @endforelse
    </tbody>
</table>

<table width="100%" style="margin-top: 30px; font-size: 10px; page-break-inside: avoid;">
    <tr>
        <td width="60%"></td>
        <td width="40%" class="text-center">
            <p>{{ $school_city ?? 'Tasikmalaya' }}, {{ \Carbon\Carbon::now()->isoFormat('D MMMM YYYY') }}</p>
            <p style="margin-top: -5px;">Penanggung Jawab / Admin,</p>
            <div style="height: 50px;"></div>
            <p style="font-weight: bold; text-decoration: underline;">{{ auth()->user()->name ?? 'Administrator' }}</p>
        </td>
    </tr>
</table>
@endsection
