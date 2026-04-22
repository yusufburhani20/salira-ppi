<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin Group
    Route::middleware(['role:Super Admin|Admin|Pimpinan'])->prefix('admin')->name('admin.')->group(function () {
        // Students
        Route::get('/students', [\App\Http\Controllers\Admin\StudentController::class, 'index'])->name('students.index');
        Route::post('/students', [\App\Http\Controllers\Admin\StudentController::class, 'store'])->name('students.store');
        Route::put('/students/{student}', [\App\Http\Controllers\Admin\StudentController::class, 'update'])->name('students.update');
        Route::delete('/students/{student}', [\App\Http\Controllers\Admin\StudentController::class, 'destroy'])->name('students.destroy');
        Route::get('/students/export', [\App\Http\Controllers\Admin\StudentController::class, 'export'])->name('students.export');
        Route::post('/students/import', [\App\Http\Controllers\Admin\StudentController::class, 'import'])->name('students.import');
        Route::get('/students/template', [\App\Http\Controllers\Admin\StudentController::class, 'template'])->name('students.template');
        Route::get('/students/print-cards/{academic_class_id}', [\App\Http\Controllers\Admin\StudentController::class, 'printCards'])->name('students.print-cards');

        // Settings
        Route::get('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [\App\Http\Controllers\Admin\SettingController::class, 'update'])->name('settings.update');

        // Classes
        Route::get('/classes', [\App\Http\Controllers\Admin\AcademicClassController::class, 'index'])->name('classes.index');
        Route::post('/classes', [\App\Http\Controllers\Admin\AcademicClassController::class, 'store'])->name('classes.store');
        Route::put('/classes/{class}', [\App\Http\Controllers\Admin\AcademicClassController::class, 'update'])->name('classes.update');
        Route::delete('/classes/{class}', [\App\Http\Controllers\Admin\AcademicClassController::class, 'destroy'])->name('classes.destroy');
        Route::get('/classes/export', [\App\Http\Controllers\Admin\AcademicClassController::class, 'export'])->name('classes.export');
        Route::post('/classes/import', [\App\Http\Controllers\Admin\AcademicClassController::class, 'import'])->name('classes.import');
        Route::get('/classes/template', [\App\Http\Controllers\Admin\AcademicClassController::class, 'template'])->name('classes.template');

        // Subjects (Mata Pelajaran)
        Route::get('/subjects', [\App\Http\Controllers\Admin\SubjectController::class, 'index'])->name('subjects.index');
        Route::post('/subjects', [\App\Http\Controllers\Admin\SubjectController::class, 'store'])->name('subjects.store');
        Route::put('/subjects/{subject}', [\App\Http\Controllers\Admin\SubjectController::class, 'update'])->name('subjects.update');
        Route::delete('/subjects/{subject}', [\App\Http\Controllers\Admin\SubjectController::class, 'destroy'])->name('subjects.destroy');
        Route::get('/subjects/export', [\App\Http\Controllers\Admin\SubjectController::class, 'export'])->name('subjects.export');
        Route::get('/subjects/template', [\App\Http\Controllers\Admin\SubjectController::class, 'template'])->name('subjects.template');
        Route::post('/subjects/import', [\App\Http\Controllers\Admin\SubjectController::class, 'import'])->name('subjects.import');

        // Geofences
        Route::apiResource('geofences', \App\Http\Controllers\Admin\GeofenceController::class)->except(['show']);
        
        // Attendances (Admin View)
        Route::get('/attendances', [\App\Http\Controllers\Admin\AttendanceController::class, 'index'])->name('attendances.index');
        Route::get('/attendances/export/excel', [\App\Http\Controllers\Admin\AttendanceController::class, 'exportExcel'])->name('attendances.export.excel');
        Route::get('/attendances/export/pdf', [\App\Http\Controllers\Admin\AttendanceController::class, 'exportPdf'])->name('attendances.export.pdf');
        
        // Users (Super Admin Only)
        Route::middleware(['role:Super Admin'])->resource('users', \App\Http\Controllers\Admin\UserController::class)->except(['show']);
        
        // Approvals (Pimpinan & Admin)
        Route::get('/approvals', [\App\Http\Controllers\Admin\ApprovalController::class, 'index'])->name('approvals.index');
        Route::put('/approvals/{approval}', [\App\Http\Controllers\Admin\ApprovalController::class, 'update'])->name('approvals.update');

        // Reports / Rekapitulasi
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\RecapController::class, 'index'])->name('index');
            
            // Attendance
            Route::get('/attendance/data', [\App\Http\Controllers\Admin\RecapController::class, 'attendanceData'])->name('attendance.data');
            Route::get('/attendance/export', [\App\Http\Controllers\Admin\RecapController::class, 'attendanceExport'])->name('attendance.export');
            Route::get('/attendance/pdf', [\App\Http\Controllers\Admin\RecapController::class, 'attendancePdf'])->name('attendance.pdf');
            
            // Attendance per Subject (Mapel)
            Route::get('/attendance-subject/data', [\App\Http\Controllers\Admin\RecapController::class, 'attendanceSubjectData'])->name('attendance-subject.data');
            Route::get('/attendance-subject/export', [\App\Http\Controllers\Admin\RecapController::class, 'attendanceSubjectExport'])->name('attendance-subject.export');
            Route::get('/attendance-subject/pdf', [\App\Http\Controllers\Admin\RecapController::class, 'attendanceSubjectPdf'])->name('attendance-subject.pdf');
            
            // Assessments (Penilaian)
            Route::get('/assessments/data', [\App\Http\Controllers\Admin\RecapController::class, 'assessmentData'])->name('assessments.data');
            Route::get('/assessments/export', [\App\Http\Controllers\Admin\RecapController::class, 'assessmentExport'])->name('assessments.export');
            Route::get('/assessments/pdf', [\App\Http\Controllers\Admin\RecapController::class, 'assessmentPdf'])->name('assessments.pdf');
            
            // Agendas (Jurnal)
            Route::get('/agendas/data', [\App\Http\Controllers\Admin\RecapController::class, 'agendaData'])->name('agendas.data');
            Route::get('/agendas/export', [\App\Http\Controllers\Admin\RecapController::class, 'agendaExport'])->name('agendas.export');
            Route::get('/agendas/pdf', [\App\Http\Controllers\Admin\RecapController::class, 'agendaPdf'])->name('agendas.pdf');
            
            // Consultations (Bimbingan)
            Route::get('/consultations/data', [\App\Http\Controllers\Admin\RecapController::class, 'consultationData'])->name('consultations.data');
            Route::get('/consultations/export', [\App\Http\Controllers\Admin\RecapController::class, 'consultationExport'])->name('consultations.export');
            Route::get('/consultations/pdf', [\App\Http\Controllers\Admin\RecapController::class, 'consultationPdf'])->name('consultations.pdf');

            // Student Resume (Laporan Orang Tua)
            Route::get('/student-resume', [\App\Http\Controllers\Admin\StudentReportController::class, 'resume'])->name('student-resume');
            Route::get('/student-resume/data', [\App\Http\Controllers\Admin\StudentReportController::class, 'resumeData'])->name('student-resume.data');
            Route::get('/student-resume/pdf', [\App\Http\Controllers\Admin\StudentReportController::class, 'resumePdf'])->name('student-resume.pdf');
        });

        // Bills / Financial
        Route::get('/bills', [\App\Http\Controllers\Admin\BillController::class, 'index'])->name('bills.index');
        Route::get('/bills/create', [\App\Http\Controllers\Admin\BillController::class, 'create'])->name('bills.create');
        Route::post('/bills', [\App\Http\Controllers\Admin\BillController::class, 'store'])->name('bills.store');
        Route::post('/bills/sync/{id?}', [\App\Http\Controllers\Admin\BillController::class, 'checkStatus'])->name('bills.sync');
        Route::post('/bills/settings', [\App\Http\Controllers\Admin\BillController::class, 'updateSettings'])->name('bills.settings');

        // Announcements
        Route::resource('/announcements', \App\Http\Controllers\Admin\AnnouncementController::class)->names('announcements');

        // Finance Analytics
        Route::get('/finance', [\App\Http\Controllers\Admin\FinanceController::class, 'index'])->name('finance.index');

        // Inventory Management
        Route::prefix('inventory')->name('inventory.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\InventoryController::class, 'index'])->name('index');
            Route::get('/export/excel', [\App\Http\Controllers\Admin\InventoryController::class, 'exportExcel'])->name('export.excel');
            Route::get('/export/pdf', [\App\Http\Controllers\Admin\InventoryController::class, 'exportPdf'])->name('export.pdf');
            Route::post('/', [\App\Http\Controllers\Admin\InventoryController::class, 'store'])->name('store');
            Route::get('/logs', [\App\Http\Controllers\Admin\InventoryController::class, 'logs'])->name('logs');
            Route::get('/scanner', [\App\Http\Controllers\Admin\InventoryBarcodeController::class, 'scanner'])->name('scanner');
            Route::post('/scan', [\App\Http\Controllers\Admin\InventoryBarcodeController::class, 'scan'])->name('scan');
            Route::post('/action', [\App\Http\Controllers\Admin\InventoryBarcodeController::class, 'action'])->name('action');
            Route::post('/categories', [\App\Http\Controllers\Admin\InventoryController::class, 'storeCategory'])->name('categories.store');
            Route::post('/{item}/barcodes', [\App\Http\Controllers\Admin\InventoryBarcodeController::class, 'store'])->name('barcodes.store');
            Route::delete('/barcodes/{barcode}', [\App\Http\Controllers\Admin\InventoryBarcodeController::class, 'destroy'])->name('barcodes.destroy');
            Route::get('/{item}', [\App\Http\Controllers\Admin\InventoryController::class, 'show'])->name('show');
            Route::put('/{item}', [\App\Http\Controllers\Admin\InventoryController::class, 'update'])->name('update');
            Route::delete('/{item}', [\App\Http\Controllers\Admin\InventoryController::class, 'destroy'])->name('destroy');
        });
    });

    // Staff / User Routes
    Route::get('/attendances/scanner', function (Illuminate\Http\Request $request) {
        $todayAttendance = \App\Models\Attendance::where('user_id', $request->user()->id)
            ->whereDate('date', today())
            ->first();
        $geofences = \App\Models\Geofence::where('is_active', true)->get();
        return Inertia::render('User/Attendances/Scanner', [
            'todayAttendance' => $todayAttendance,
            'geofences' => $geofences
        ]);
    })->name('attendances.scanner');
    
    Route::post('/attendances/check-in', [\App\Http\Controllers\AttendanceController::class, 'checkIn'])->name('attendances.check-in');
    Route::post('/attendances/check-out', [\App\Http\Controllers\AttendanceController::class, 'checkOut'])->name('attendances.check-out');
    
    // User Permissions (Izin/Cuti)
    Route::resource('permissions', \App\Http\Controllers\User\PermissionController::class)->names('user.permissions')->only(['index', 'store', 'destroy']);
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::patch('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');

    // Teacher Routes
    Route::middleware(['auth', 'role:Super Admin|Admin|Guru/Dosen'])->prefix('teacher')->name('teacher.')->group(function () {
        // Class Agendas
        Route::get('/agendas', [\App\Http\Controllers\Teacher\ClassAgendaController::class, 'index'])->name('agendas.index');
        Route::get('/agendas/create', [\App\Http\Controllers\Teacher\ClassAgendaController::class, 'create'])->name('agendas.create');
        Route::get('/agendas/students/{classId}', [\App\Http\Controllers\Teacher\ClassAgendaController::class, 'getStudents'])->name('agendas.students');
        Route::get('/agendas/{id}', [\App\Http\Controllers\Teacher\ClassAgendaController::class, 'show'])->name('agendas.show');
        Route::get('/agendas/{id}/edit', [\App\Http\Controllers\Teacher\ClassAgendaController::class, 'edit'])->name('agendas.edit');
        Route::post('/agendas', [\App\Http\Controllers\Teacher\ClassAgendaController::class, 'store'])->name('agendas.store');
        Route::put('/agendas/{id}', [\App\Http\Controllers\Teacher\ClassAgendaController::class, 'update'])->name('agendas.update');
        Route::delete('/agendas/{id}', [\App\Http\Controllers\Teacher\ClassAgendaController::class, 'destroy'])->name('agendas.destroy');

        // Daily Assessments (Scores)
        Route::resource('assessments', \App\Http\Controllers\Teacher\DailyAssessmentController::class);
        
        // Student Guidance (Guru Wali)
        Route::get('/consultations', [\App\Http\Controllers\Teacher\ConsultationController::class, 'index'])->name('consultations.index');
        Route::post('/consultations', [\App\Http\Controllers\Teacher\ConsultationController::class, 'store'])->name('consultations.store');
        Route::put('/consultations/{consultation}', [\App\Http\Controllers\Teacher\ConsultationController::class, 'update'])->name('consultations.update');
        Route::delete('/consultations/{consultation}', [\App\Http\Controllers\Teacher\ConsultationController::class, 'destroy'])->name('consultations.destroy');
        Route::get('/consultations/students/{classId}', [\App\Http\Controllers\Teacher\ConsultationController::class, 'getStudents'])->name('consultations.students');
    });
});

// Telegram Webhook
Route::post('/webhook/telegram', [\App\Http\Controllers\TelegramController::class, 'handle']);

// Midtrans Webhook (S2S)
Route::post('/webhook/midtrans', [\App\Http\Controllers\Webhook\MidtransController::class, 'handle']);

// Public Invoice Page
Route::get('/invoice/{bill_number}', [\App\Http\Controllers\InvoiceController::class, 'show'])->name('invoice.show');

// Student Portal Routes
Route::prefix('portal')->name('portal.')->group(function () {
    Route::middleware('guest:student')->group(function () {
        Route::get('/login', [\App\Http\Controllers\Portal\StudentAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [\App\Http\Controllers\Portal\StudentAuthController::class, 'login']);
    });

    // Public Presence Scanner (Kiosk Mode)
    Route::get('/attendance/scanner', [\App\Http\Controllers\Portal\PresenceScannerController::class, 'index'])->name('attendance.scanner');
    Route::post('/attendance/scan', [\App\Http\Controllers\Portal\PresenceScannerController::class, 'scan'])->name('attendance.scan');

    Route::middleware('auth:student')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Portal\PortalController::class, 'dashboard'])->name('dashboard');
        Route::get('/bills', [\App\Http\Controllers\Portal\PortalController::class, 'bills'])->name('bills');
        Route::get('/attendance', [\App\Http\Controllers\Portal\PortalController::class, 'attendance'])->name('attendance');
        Route::get('/scores', [\App\Http\Controllers\Portal\PortalController::class, 'scores'])->name('scores');
        Route::get('/id-card', [\App\Http\Controllers\Portal\PortalController::class, 'idCard'])->name('id-card');
        
        // Presence Scanner (Old location - removed as it's now public)

        
        Route::get('/profile', [\App\Http\Controllers\Portal\ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [\App\Http\Controllers\Portal\ProfileController::class, 'update'])->name('profile.update');

        Route::get('/report', [\App\Http\Controllers\Portal\PortalController::class, 'reportPdf'])->name('report');

        // Notifications
        Route::get('/notifications', [\App\Http\Controllers\Portal\PortalController::class, 'notifications'])->name('notifications.index');
        Route::patch('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
        Route::patch('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');

        Route::post('/logout', [\App\Http\Controllers\Portal\StudentAuthController::class, 'destroy'])->name('logout');
    });
});

require __DIR__.'/auth.php';
