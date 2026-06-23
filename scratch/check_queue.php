<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$jobsCount = 0;
$failedJobsCount = 0;

try {
    $jobsCount = DB::table('jobs')->count();
} catch (\Exception $e) {
    echo "Warning: jobs table does not exist or error: " . $e->getMessage() . "\n";
}

try {
    $failedJobsCount = DB::table('failed_jobs')->count();
} catch (\Exception $e) {
    echo "Warning: failed_jobs table does not exist or error: " . $e->getMessage() . "\n";
}

echo "--- QUEUE STATUS ---\n";
echo "Pending Jobs in 'jobs' table: " . $jobsCount . "\n";
echo "Failed Jobs in 'failed_jobs' table: " . $failedJobsCount . "\n";

if ($failedJobsCount > 0) {
    echo "\n--- LATEST FAILED JOB ---\n";
    $latestFailed = DB::table('failed_jobs')->orderBy('failed_at', 'desc')->first();
    echo "ID: " . $latestFailed->id . "\n";
    echo "Queue: " . $latestFailed->queue . "\n";
    echo "Failed At: " . $latestFailed->failed_at . "\n";
    echo "Exception: " . substr($latestFailed->exception, 0, 1000) . "...\n";
}
