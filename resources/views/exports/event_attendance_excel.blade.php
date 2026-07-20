<table>
    <tr>
        <td colspan="5" style="font-size: 16px; font-weight: bold; text-align: center;">{{ $meta['school_name'] ?? 'SALIRA ACADEMY' }}</td>
    </tr>
    <tr>
        <td colspan="5" style="font-size: 14px; font-weight: bold; text-align: center;">LAPORAN KEHADIRAN EVENT / RAPAT</td>
    </tr>
    <tr><td colspan="5"></td></tr>
    <tr>
        <td style="font-weight: bold;">Nama Event:</td>
        <td colspan="4">{{ $event->name }}</td>
    </tr>
    @if($event->description)
    <tr>
        <td style="font-weight: bold;">Deskripsi:</td>
        <td colspan="4">{{ $event->description }}</td>
    </tr>
    @endif
    <tr>
        <td style="font-weight: bold;">Tanggal &amp; Waktu:</td>
        <td colspan="4">
            {{ \Carbon\Carbon::parse($event->date)->translatedFormat('l, d F Y') }} | 
            {{ substr($event->start_time, 0, 5) }} - {{ substr($event->end_time, 0, 5) }} WIB
        </td>
    </tr>
    <tr>
        <td style="font-weight: bold;">Status Event:</td>
        <td colspan="4">{{ $event->is_active ? 'AKTIF' : 'DITUTUP' }}</td>
    </tr>
    <tr>
        <td style="font-weight: bold;">Dibuat Oleh:</td>
        <td colspan="4">{{ $event->creator->name ?? 'Admin' }}</td>
    </tr>
    <tr>
        <td style="font-weight: bold;">Total Hadir:</td>
        <td colspan="4">{{ count($event->attendances) }} Orang</td>
    </tr>
    <tr>
        <td style="font-weight: bold;">Dicetak Pada:</td>
        <td colspan="4">{{ $meta['printed_at'] ?? now()->format('d/m/Y H:i:s') }}</td>
    </tr>
    <tr><td colspan="5"></td></tr>
    <thead>
        <tr>
            <th style="font-weight: bold; background-color: #4f46e5; color: #ffffff; text-align: center; border: 1px solid #000000;">No</th>
            <th style="font-weight: bold; background-color: #4f46e5; color: #ffffff; text-align: left; border: 1px solid #000000;">NIP / ID</th>
            <th style="font-weight: bold; background-color: #4f46e5; color: #ffffff; text-align: left; border: 1px solid #000000;">Nama Guru / Karyawan</th>
            <th style="font-weight: bold; background-color: #4f46e5; color: #ffffff; text-align: center; border: 1px solid #000000;">Waktu Absen</th>
            <th style="font-weight: bold; background-color: #4f46e5; color: #ffffff; text-align: left; border: 1px solid #000000;">Link Foto Presensi</th>
            <th style="font-weight: bold; background-color: #4f46e5; color: #ffffff; text-align: center; border: 1px solid #000000;">Status</th>
        </tr>
    </thead>
    <tbody>
        @forelse($event->attendances as $index => $att)
        <tr>
            <td style="text-align: center; border: 1px solid #d1d5db;">{{ $index + 1 }}</td>
            <td style="text-align: left; border: 1px solid #d1d5db;">{{ $att->user->nip ?? '-' }}</td>
            <td style="text-align: left; border: 1px solid #d1d5db;">{{ $att->user->name ?? 'N/A' }}</td>
            <td style="text-align: center; border: 1px solid #d1d5db;">{{ $att->created_at->timezone('Asia/Jakarta')->format('d/m/Y H:i:s') }} WIB</td>
            <td style="text-align: left; border: 1px solid #d1d5db;">
                {{ !empty($att->proof_path) ? url('storage/' . $att->proof_path) : '-' }}
            </td>
            <td style="text-align: center; border: 1px solid #d1d5db;">Hadir</td>
        </tr>
        @empty
        <tr>
            <td colspan="6" style="text-align: center; font-style: italic; border: 1px solid #d1d5db;">Belum ada data kehadiran untuk event ini.</td>
        </tr>
        @endforelse
    </tbody>
</table>
