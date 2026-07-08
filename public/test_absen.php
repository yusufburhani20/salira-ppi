<?php
define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;
use App\Models\User;
use App\Models\EventAttendance;
use Illuminate\Support\Facades\Schema;

if (($_GET['key'] ?? '') !== 'salira123') {
    die('Unauthorized');
}

echo "<h3>Testing Event Attendance Database & Models:</h3>";

// 1. Check Tables
echo "Checking tables...<br>";
foreach (['events', 'event_attendances', 'users'] as $table) {
    echo "Table '$table' exists: " . (Schema::hasTable($table) ? "YES" : "NO") . "<br>";
}

// 2. Fetch Active Event
$event = Event::where('is_active', true)->first();
if ($event) {
    echo "Active Event Found: ID {$event->id} - Name: {$event->name}<br>";
} else {
    echo "No active events found in database!<br>";
}

// 3. Fetch Active User
$user = User::first();
if ($user) {
    echo "User Found: ID {$user->id} - Name: {$user->name}<br>";
} else {
    echo "No users found in database!<br>";
}

if ($event && $user) {
    echo "Trying to create an attendance record directly...<br>";
    try {
        // Delete if exists so we don't hit duplicate constraint
        EventAttendance::where('event_id', $event->id)->where('user_id', $user->id)->delete();
        
        $attendance = EventAttendance::create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'proof_path' => 'event_attendances/test_proof.jpg',
            'status' => 'hadir'
        ]);
        echo "<b>SUCCESS:</b> Record created successfully with ID: " . $attendance->id . "<br>";
        
        // Clean up
        $attendance->delete();
        echo "Cleaned up test record.<br>";
    } catch (\Throwable $e) {
        echo "<b>ERROR:</b> " . $e->getMessage() . "<br>";
        echo "<pre>" . $e->getTraceAsString() . "</pre>";
    }
}
