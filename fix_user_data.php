<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$u = \App\Models\User::where('name', 'like', '%Laely%')->first();
if ($u) {
    $u->phone = '085282228750';
    $u->telegram_id = null;
    $u->save();
    echo "Fixed user data for {$u->name}\n";
} else {
    echo "User not found\n";
}
