<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$student = \App\Models\Student::first();
if ($student) {
    if (empty($student->password)) {
        echo "First login logic:\n";
        $defaultPassword = $student->birth_date ? $student->birth_date->format('dmY') : '123456';
        echo "Default password expected: " . $defaultPassword . "\n";
        $student->password = \Illuminate\Support\Facades\Hash::make($defaultPassword);
        $student->save();
        echo "Password updated!\n";
    }

    echo "Attempting login with guard 'student'...\n";
    $result = \Illuminate\Support\Facades\Auth::guard('student')->attempt([
        'nisn' => $student->nisn,
        'password' => '123456'
    ]);
    echo "Login result: " . ($result ? "SUCCESS" : "FAILED") . "\n";
}
