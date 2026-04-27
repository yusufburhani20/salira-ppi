<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $bill->bill_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #1e293b; background: #fff; }

        .page { padding: 30px; }

        /* Header */
        .header { display: flex; align-items: center; border-bottom: 3px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; }
        .header-logo { width: 55px; height: 55px; margin-right: 14px; }
        .header-info h1 { font-size: 18px; font-weight: bold; color: #1e293b; margin: 0; }
        .header-info p { font-size: 10px; color: #64748b; margin-top: 2px; }
        .header-right { margin-left: auto; text-align: right; }
        .header-right h2 { font-size: 20px; font-weight: bold; color: #4f46e5; letter-spacing: 1px; }
        .header-right p { font-size: 10px; color: #64748b; margin-top: 2px; }

        /* Status Badge */
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: bold; letter-spacing: 0.5px; }
        .status-paid { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
        .status-unpaid { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
        .status-pending { background: #fef9c3; color: #ca8a04; border: 1px solid #fde047; }

        /* Info Grid */
        .info-grid { display: flex; gap: 20px; margin-bottom: 20px; }
        .info-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
        .info-box label { font-size: 9px; color: #94a3b8; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 4px; letter-spacing: 0.5px; }
        .info-box span { font-size: 12px; font-weight: bold; color: #1e293b; display: block; }
        .info-box small { font-size: 10px; color: #64748b; }

        /* Detail Table */
        .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 8px; }
        table.detail { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table.detail thead th { background: #4f46e5; color: #fff; padding: 8px 12px; font-size: 10px; text-align: left; }
        table.detail tbody td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
        table.detail tbody tr:last-child td { border-bottom: none; }
        table.detail tfoot td { padding: 10px 12px; border-top: 2px solid #e2e8f0; font-weight: bold; font-size: 12px; }
        .text-right { text-align: right; }
        .total-amount { color: #4f46e5; font-size: 14px; }

        /* Paid Info */
        .paid-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; }
        .paid-box p { font-size: 10px; color: #15803d; margin: 0; }
        .paid-box .paid-date { font-size: 12px; font-weight: bold; color: #166534; margin-top: 2px; }

        /* Footer */
        .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        .footer p { font-size: 9px; color: #94a3b8; text-align: center; }

        /* Watermark for paid */
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 80px; font-weight: bold; color: rgba(16, 185, 129, 0.08); text-transform: uppercase; letter-spacing: 10px; pointer-events: none; z-index: 0; }
    </style>
</head>
<body>
<div class="page">

    @if($bill->status === 'paid')
    <div class="watermark">LUNAS</div>
    @endif

    {{-- Header --}}
    <div class="header">
        <div class="header-info">
            @if($logo)
                <img src="{{ public_path($logo) }}" class="header-logo">
            @endif
            <h1>{{ $school_name }}</h1>
            <p>Sistem Administrasi Sekolah Terpadu</p>
        </div>
        <div class="header-right">
            <h2>INVOICE</h2>
            <p>No. {{ $bill->bill_number }}</p>
            <div style="margin-top: 6px;">
                @if($bill->status === 'paid')
                    <span class="status-badge status-paid">✓ LUNAS</span>
                @elseif($bill->status === 'pending')
                    <span class="status-badge status-pending">⏳ PENDING</span>
                @else
                    <span class="status-badge status-unpaid">✗ BELUM BAYAR</span>
                @endif
            </div>
        </div>
    </div>

    {{-- Tagihan Kepada & Info Invoice --}}
    <div class="info-grid">
        <div class="info-box" style="flex: 2;">
            <label>Tagihan Kepada:</label>
            <span>{{ $bill->student->name }}</span>
            <small>NIS: {{ $bill->student->nis ?? '-' }}</small>
            @if($bill->student->academic_class)
            <small style="display:block; margin-top:2px;">Kelas: {{ $bill->student->academic_class->name }}</small>
            @endif
            @if($bill->student->parent_email)
            <small style="display:block; margin-top:2px;">Email: {{ $bill->student->parent_email }}</small>
            @endif
        </div>
        <div class="info-box">
            <label>Tanggal Terbit:</label>
            <span>{{ $bill->created_at->format('d/m/Y') }}</span>
        </div>
        <div class="info-box">
            <label>Periode:</label>
            <span>Bulan {{ $bill->month }}</span>
            <small>Tahun {{ $bill->year }}</small>
        </div>
    </div>

    {{-- Rincian Tagihan --}}
    <div class="section-title">Rincian Tagihan</div>
    <table class="detail">
        <thead>
            <tr>
                <th>No.</th>
                <th>Keterangan</th>
                <th>Periode</th>
                <th class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>{{ $bill->title }}</td>
                <td>Bulan {{ $bill->month }} / {{ $bill->year }}</td>
                <td class="text-right">Rp {{ number_format($bill->amount, 0, ',', '.') }}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3" class="text-right">Total Pembayaran:</td>
                <td class="text-right total-amount">Rp {{ number_format($bill->amount, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    {{-- Status Pembayaran --}}
    @if($bill->status === 'paid' && $bill->paid_at)
    <div class="paid-box">
        <p>Pembayaran diterima pada:</p>
        <div class="paid-date">{{ \Carbon\Carbon::parse($bill->paid_at)->format('d F Y, H:i') }} WIB</div>
    </div>
    @endif

    {{-- Footer --}}
    <div class="footer">
        <p>Dokumen ini dicetak secara otomatis oleh sistem SALIRA pada {{ now()->format('d F Y, H:i') }} WIB</p>
        <p style="margin-top:4px;">Jika ada pertanyaan, silakan hubungi pihak sekolah.</p>
    </div>
</div>
</body>
</html>
