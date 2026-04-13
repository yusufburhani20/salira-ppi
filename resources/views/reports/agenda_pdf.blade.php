@extends('reports.pdf_layout')

@section('content')
<table class="data">
    <thead>
        <tr>
            <th width="80">Hari/Tgl</th>
            <th width="50">Jam</th>
            <th width="120">Guru</th>
            <th width="100">Mapel</th>
            <th>Materi & Aktivitas</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $item)
        <tr>
            <td>
                <strong>{{ \Carbon\Carbon::parse($item['date'])->isoFormat('dddd') }}</strong><br>
                {{ \Carbon\Carbon::parse($item['date'])->format('d/m/Y') }}
            </td>
            <td class="text-center" style="font-family: monospace;">{{ $item['lesson_period'] }}</td>
            <td style="text-transform: uppercase; font-weight: 500;">{{ $item['teacher']['name'] ?? '-' }}</td>
            <td style="color: #4338ca; font-weight: bold;">{{ $item['subject']['name'] ?? ($item['subject_name'] ?? ($item['subject'] ?? '-')) }}</td>
            <td>
                <div style="font-weight: bold; margin-bottom: 3px;">{{ $item['topic'] }}</div>
                <div style="font-style: italic; color: #64748b; font-size: 9px;">{{ $item['activities'] }}</div>
            </td>
        </tr>
        @endforeach
        @if(count($data) == 0)
        <tr>
            <td colspan="5" style="text-align: center; padding: 30px; color: #94a3b8; font-style: italic;">Tidak ada data jurnal mengajar dalam periode ini.</td>
        </tr>
        @endif
    </tbody>
</table>
@endsection
