<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ClassAgenda;
use App\Models\StudentAttendance;
use App\Enums\AttendanceStatus;
use Illuminate\Http\Request;

try {
    $controller = new \App\Http\Controllers\Teacher\ClassAgendaController();
    
    // Simulate Request
    $request = Request::create('/teacher/agendas/export/excel', 'GET', [
        'academic_class_id' => 1,
        'start_date' => '2026-04-01',
        'end_date' => '2026-04-30',
        'subject_id' => 10,
    ]);
    
    // We need to bypass auth, so let's log in user ID 1
    Auth::loginUsingId(1);
    
    // Let's call prepareDetailedAttendanceReport via reflection since it's private
    $reflection = new \ReflectionClass($controller);
    $method = $reflection->getMethod('exportExcel');
    
    $result = $method->invoke($controller, $request);
    echo "SUCCESS\n";
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}

