<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$name = "Laely Rizki Amelia";
$user = \App\Models\User::where('name', 'like', "%{$name}%")->first();

if ($user) {
    echo "User Ditemukan!\n";
    echo "Nama: " . $user->name . "\n";
    echo "Phone di DB: [" . $user->phone . "]\n";
    echo "Telegram ID: " . ($user->telegram_id ?? 'Belum ada') . "\n";
} else {
    echo "User '{$name}' tidak ditemukan di tabel users.\n";
}

$student = \App\Models\Student::where('name', 'like', "%{$name}%")->first();
if ($student) {
    echo "\nSiswa Ditemukan!\n";
    echo "Nama: " . $student->name . "\n";
    echo "Phone Ortu di DB: [" . $student->parent_phone . "]\n";
}
