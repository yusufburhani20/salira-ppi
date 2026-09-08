<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\StudentAttendanceController;
use App\Http\Controllers\Api\V1\DeviceTokenController;
use App\Http\Controllers\Api\V1\LeaveController;
use App\Http\Controllers\Api\V1\AgendaController;
use App\Http\Controllers\Api\V1\AssessmentController;
use App\Http\Controllers\Api\V1\ConsultationController;
use App\Http\Controllers\Api\V1\NotificationController;

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

        // Perizinan (Leave Requests)
        Route::get('/leaves', [LeaveController::class, 'index']);
        Route::post('/leaves', [LeaveController::class, 'store']);
        Route::delete('/leaves/{id}', [LeaveController::class, 'destroy']);

        // Jurnal Mengajar / Agenda Kelas
        Route::get('/agendas', [AgendaController::class, 'index']);
        Route::post('/agendas', [AgendaController::class, 'store']);
        Route::get('/agendas/form-data', [AgendaController::class, 'getClasses']);
        Route::get('/agendas/{id}', [AgendaController::class, 'show']);
        Route::get('/agendas/{id}/students', [AgendaController::class, 'getStudents']);
        Route::delete('/agendas/{id}', [AgendaController::class, 'destroy']);

        // Penilaian Harian (Daily Assessments)
        Route::get('/assessments', [AssessmentController::class, 'index']);
        Route::post('/assessments', [AssessmentController::class, 'store']);
        Route::get('/assessments/form-data', [AssessmentController::class, 'getFormData']);
        Route::get('/assessments/students/{classId}', [AssessmentController::class, 'getStudents']);
        Route::delete('/assessments/{id}', [AssessmentController::class, 'destroy']);

        // Konsultasi / Bimbingan Siswa
        Route::get('/consultations', [ConsultationController::class, 'index']);
        Route::post('/consultations', [ConsultationController::class, 'store']);
        Route::put('/consultations/{id}', [ConsultationController::class, 'update']);
        Route::delete('/consultations/{id}', [ConsultationController::class, 'destroy']);
        Route::get('/consultations/form-data', [ConsultationController::class, 'getFormData']);
        Route::get('/consultations/students/{classId}', [ConsultationController::class, 'getStudents']);

        // Notifikasi
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    });
});
