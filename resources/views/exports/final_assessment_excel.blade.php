<html>
<body>
<table>
    <thead>
    <tr>
        <th></th>
        <th colspan="3" style="font-weight: bold; font-size: 14px; color: #4F46E5;">REKAP ASESMEN AKHIR ({{ $type_label ?? 'ASAS & ASAT' }})</th>
    </tr>
    <tr>
        <th></th>
        <th colspan="3" style="font-weight: bold; font-size: 11px;">{{ $school_name ?? 'SALIRA ACADEMY' }}</th>
    </tr>
    <tr>
        <th></th>
        <th colspan="3" style="font-style: italic; font-size: 9px; color: #64748b;">Semester: {{ $semester_label ?? '-' }}</th>
    </tr>
    <tr>
        <th></th>
        <th colspan="3" style="font-size: 9px; color: #64748b;">Dicetak pada: {{ date('d/m/Y H:i:s') }}</th>
    </tr>
    <tr>
        <th colspan="4"></th>
    </tr>
    <tr>
        <th style="font-weight: bold; background-color: #eee; border: 1px solid #000;">Kelas:</th>
        <th colspan="3" style="border: 1px solid #000; font-weight: bold;">{{ $class_name ?? '-' }}</th>
    </tr>
    <tr>
        <th style="font-weight: bold; background-color: #eee; border: 1px solid #000;">Mata Pelajaran:</th>
        <th colspan="3" style="border: 1px solid #000; font-weight: bold;">{{ $subject_name ?? '-' }}</th>
    </tr>
    <tr>
        <th style="font-weight: bold; background-color: #eee; border: 1px solid #000;">Guru:</th>
        <th colspan="3" style="border: 1px solid #000;">{{ $teacher_name ?? '-' }}</th>
    </tr>
    <tr><th colspan="4"></th></tr>
    <tr>
        <th style="font-weight: bold; background-color: #000; color: #fff; border: 2px solid #000; text-align: center;">Nama Siswa</th>
        <th style="font-weight: bold; background-color: #000; color: #fff; border: 2px solid #000; text-align: center;">Tipe</th>
        <th style="font-weight: bold; background-color: #000; color: #fff; border: 2px solid #000; text-align: center;">Nilai</th>
        <th style="font-weight: bold; background-color: #000; color: #fff; border: 2px solid #000; text-align: center;">Catatan</th>
    </tr>
    </thead>
    <tbody>
    @foreach($assessments as $assessment)
        @php
            $subjectName = $assessment['subject']['name'] ?? '-';
            $className = $assessment['academic_class']['name'] ?? '-';
            $typeName = $assessment['type'] ?? '-';
        @endphp
        @foreach($assessment['scores'] as $score)
        <tr>
            <td style="border: 1px solid #ccc; padding: 4px 8px; font-weight: bold;">{{ $score['student']['name'] ?? '-' }}</td>
            <td style="border: 1px solid #ccc; padding: 4px 8px; text-align: center; font-weight: bold; color: {{ $typeName === 'ASAS' ? '#4F46E5' : '#7C3AED' }};">{{ $typeName }}</td>
            <td style="border: 1px solid #ccc; padding: 4px 8px; text-align: center; font-weight: bold;">{{ $score['score'] }}</td>
            <td style="border: 1px solid #ccc; padding: 4px 8px; color: #555;">{{ $score['notes'] ?? '-' }}</td>
        </tr>
        @endforeach
    @endforeach
    </tbody>
</table>
</body>
</html>
