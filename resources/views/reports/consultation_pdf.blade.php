@extends('reports.pdf_layout')

@section('content')
<h3 style="font-size: 11px; border-left: 4px solid #4f46e5; padding-left: 10px; margin-bottom: 10px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">Daftar Konsultasi & Bimbingan Siswa</h3>
<table class="data">
    <thead>
        <tr>
            <th width="25" class="text-center">No</th>
            <th width="70">Tanggal</th>
            <th width="140">Siswa & Kelas</th>
            <th width="80" class="text-center">Kategori</th>
            <th>Perihal & Pembahasan</th>
            <th width="80" class="text-center">Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $index => $item)
        <tr>
            <td class="text-center" style="color: #64748b;">{{ $index + 1 }}</td>
            <td class="text-center" style="font-weight: bold; color: #1e293b;">
                {{ \Carbon\Carbon::parse($item['consultation_date'])->format('d/m/Y') }}
            </td>
            <td>
                <div style="font-weight: bold; text-transform: uppercase; color: #334155;">{{ $item['student']['name'] ?? '-' }}</div>
                <div style="font-size: 8px; color: #4338ca; font-weight: bold;">{{ $item['academic_class']['name'] ?? ($item['academic_class_name'] ?? '-') }}</div>
            </td>
            <td class="text-center">
                <div style="background: #f1f5f9; padding: 4px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 8px; border: 1px solid #e2e8f0; color: #475569;">
                    {{ $item['category'] }}
                </div>
            </td>
            <td>
                <div style="font-weight: bold; margin-bottom: 4px; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px;">{{ $item['subject'] }}</div>
                <div style="font-style: italic; color: #475569; font-size: 9px; line-height: 1.3;">"{{ $item['problem_description'] }}"</div>
                @if(!empty($item['advice_given']))
                    <div style="margin-top: 6px; background: #f8fafc; padding: 5px; border-radius: 4px; border: 1px solid #f1f5f9;">
                        <strong style="font-size: 8px; color: #1e293b;">SOLUSI/SARAN:</strong> 
                        <div style="color: #334155; margin-top: 2px;">{{ $item['advice_given'] }}</div>
                    </div>
                @endif
            </td>
            <td class="text-center" style="vertical-align: middle;">
                @php 
                    $status = $item['follow_up_status'];
                    $color = '#64748b'; // default
                    if($status == 'selesai') $color = '#059669';
                    elseif($status == 'proses') $color = '#d97706';
                    elseif($status == 'butuh_tindak_lanjut') $color = '#dc2626';
                @endphp
                <span style="font-weight: bold; text-transform: uppercase; font-size: 8px; color: {{ $color }}; background: #fff; padding: 3px 6px; border: 1px solid {{ $color }}; border-radius: 10px;">
                    {{ str_replace('_', ' ', $status) }}
                </span>
            </td>
        </tr>
        @endforeach
        @if(count($data) == 0)
        <tr>
            <td colspan="6" class="text-center" style="padding: 40px; color: #94a3b8; font-style: italic; border: 1px dashed #cbd5e1;">Tidak ada data bimbingan siswa dalam periode ini.</td>
        </tr>
        @endif
    </tbody>
</table>
@endsection
