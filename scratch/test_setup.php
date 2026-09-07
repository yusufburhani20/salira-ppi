<?php

use App\Models\User;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Semester;
use App\Models\Program;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserStatus;

// 1. Run seeders first
// Artisan::call('db:seed'); // Commented out to avoid duplicates

// 2. Create basic data for context
$year = AcademicYear::create([
    'name' => '2026/2027', 
    'is_active' => true,
    'start_date' => '2026-07-01',
    'end_date' => '2027-06-30'
]);
$semester = Semester::create([
    'academic_year_id' => $year->id, 
    'name' => 'Ganjil', 
    'is_active' => true,
    'start_date' => '2026-07-01',
    'end_date' => '2026-12-31'
]);

$class = AcademicClass::create([
    'academic_year_id' => $year->id,
    'name' => 'X PPLG 1',
    'level' => 'X'
]);

$program = Program::create([
    'name' => 'Pengembangan Perangkat Lunak dan Gim'
]);

// 3. Create a test user
$user = User::create([
    'name' => 'Test Guru',
    'email' => 'guru@test.com',
    'password' => 'password', // will be hashed by model cast
    'status' => UserStatus::active // lowercase 'active'
]);

// 4. Assign roles
$user->assignRole(['Guru', 'Wali Kelas', 'Kepala Program']);

// 5. Assign contexts
$user->classTeacherContexts()->attach($class->id);
$user->programHeadContexts()->attach($program->id);

echo "Test user created! Email: guru@test.com, Password: password\n";
