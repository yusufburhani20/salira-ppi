<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\StudentAttendanceController;
use App\Http\Controllers\Api\V1\DeviceTokenController;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/device-token', [DeviceTokenController::class, 'store']);

        // Presensi Diri Sendiri (Pegawai / Siswa)
        Route::get('/attendance', [AttendanceController::class, 'index']);
        Route::get('/attendance/today', [AttendanceController::class, 'today']);
        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);

        // Manajemen Presensi Murid (Khusus Guru/Pegawai)
        Route::get('/students/attendance', [StudentAttendanceController::class, 'index']);
        Route::post('/students/attendance', [StudentAttendanceController::class, 'store']);
    });
});
