<?php
require __DIR__ . "/vendor/autoload.php";
$app = require_once __DIR__ . "/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

dump("Is Production: " . env('MIDTRANS_IS_PRODUCTION'));
dump("Server Key length: " . strlen(env('MIDTRANS_SERVER_KEY')));
dump("Server Key starts with: " . substr(env('MIDTRANS_SERVER_KEY'), 0, 5));
