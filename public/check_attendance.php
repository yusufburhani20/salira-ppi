<?php
define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\EventAttendance;

if (($_GET['key'] ?? '') !== 'salira123') {
    die('Unauthorized');
}

echo "<h3>Event Attendance Records in Database:</h3>";

try {
    $records = EventAttendance::with(['event', 'user'])->orderBy('created_at', 'desc')->take(20)->get();
    
    if ($records->isEmpty()) {
        echo "No attendance records found.<br>";
    } else {
        echo "<table border='1' cellpadding='5' cellspacing='0'>";
        echo "<tr><th>ID</th><th>Event Name</th><th>User Name</th><th>Status</th><th>Proof Path</th><th>Created At</th></tr>";
        foreach ($records as $r) {
            echo "<tr>";
            echo "<td>{$r->id}</td>";
            echo "<td>" . ($r->event->name ?? 'N/A') . "</td>";
            echo "<td>" . ($r->user->name ?? 'N/A') . "</td>";
            echo "<td>{$r->status}</td>";
            echo "<td>{$r->proof_path}</td>";
            echo "<td>{$r->created_at}</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
} catch (\Throwable $e) {
    echo "<b>ERROR:</b> " . $e->getMessage() . "<br>";
}
