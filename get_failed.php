<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$job = DB::table('failed_jobs')->orderBy('failed_at', 'desc')->first();
if ($job) {
    echo substr($job->exception, 0, 1500);
} else {
    echo "No failed jobs";
}
