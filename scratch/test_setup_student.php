<?php

use App\Models\Student;
use App\Models\AcademicClass;
use Illuminate\Support\Facades\Hash;
use App\Enums\StudentStatus;
use App\Enums\Gender;

// get class ID 2 that we created earlier
$class = AcademicClass::find(2);

// Create a test student
$student = Student::create([
    'name' => 'Budi Santoso',
    'nis' => '123456',
    'nisn' => '0098765432',
    'gender' => Gender::L, // Assuming L means Laki-Laki
    'status' => App\Enums\StudentStatus::active,
    'password' => Hash::make('password123'), // Students use password
    'parent_name' => 'Bapak Budi',
    'parent_phone' => '08123456789',
]);

// attach student to class
$student->academicClasses()->attach($class->id, ['is_active' => true]);

echo "Test student created! NISN: 0098765432, Password: password123\n";
