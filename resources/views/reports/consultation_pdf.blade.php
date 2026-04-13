@extends('reports.pdf_layout')

@section('content')
<table class="data">
    <thead>
        <tr>
            <th width="70">Tgl</th>
            <th width="120">Siswa & Kelas</th>
            <th width="80">Kategori</th>
            <th>Perihal & Masalah</th>
            <th width="80" class="text-center">Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $item)
        <tr>
            <td class="text-center">{{ \Carbon\Carbon::parse($item['consultation_date'])->format('d/m/Y') }}</td>
            <td>
                <div style="font-weight: bold; text-transform: uppercase;">{{ $item['student']['name'] ?? '-' }}</div>
                <div style="font-size: 8px; color: #4338ca; font-weight: bold;">{{ $item['academic_class']['name'] ?? ($item['academic_class_name'] ?? '-') }}</div>
            </td>
            <td class="text-center">
                <span style="background: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 8px;">{{ $item['category'] }}</span>
            </td>
            <td>
                <div style="font-weight: bold; margin-bottom: 3px;">{{ $item['subject'] }}</div>
                <div style="font-style: italic; color: #64748b; font-size: 9px;">"{{ $item['problem_description'] }}"</div>
                @if(isset($item['advice_given']))
                    <div style="margin-top: 5px; border-top: 1px dotted #e2e8f0; padding-top: 3px;">
                        <strong>Saran:</strong> {{ $item['advice_given'] }}
                    </div>
                @endif
            </td>
            <td class="text-center" style="font-weight: bold; text-transform: uppercase; font-size: 8px;">
                <span class="status-{{ $item['follow_up_status'] }}">
                    {{ str_replace('_', ' ', $item['follow_up_status']) }}
                </span>
            </td>
        </tr>
        @endforeach
        @if(count($data) == 0)
        <tr>
            <td colspan="5" style="text-align: center; padding: 30px; color: #94a3b8; font-style: italic;">Tidak ada data bimbingan siswa dalam periode ini.</td>
        </tr>
        @endif
    </tbody>
</table>
@endsection
