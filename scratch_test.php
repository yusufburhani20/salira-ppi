<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$classes = \App\Models\AcademicClass::withCount('students')->get();
foreach($classes as $c) {
    $total = $c->students_count;
    $present = \App\Models\StudentAttendance::where('status', 'hadir')->whereDate('date', today())->where('academic_class_id', $c->id)->distinct('student_id')->count();
    $percentage = $total > 0 ? round(($present / $total) * 100) : 0;
    echo $c->name . ": Present=" . $present . " Total=" . $total . " Percentage=" . $percentage . "%\n";
}

$totalAll = \App\Models\Student::count();
$presentAll = \App\Models\StudentAttendance::where('status', 'hadir')->whereDate('date', today())->distinct('student_id')->count();
$percentageAll = $totalAll > 0 ? round(($presentAll / $totalAll) * 100) : 0;
echo "\nALL (Dashboard Logic): Present=" . $presentAll . " Total=" . $totalAll . " Percentage=" . $percentageAll . "%\n";
