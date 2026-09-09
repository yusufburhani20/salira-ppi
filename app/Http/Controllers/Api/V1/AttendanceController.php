<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\StudentAttendanceResource;
use App\Models\Attendance;
use App\Models\StudentAttendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Jika user adalah Student, tarik dari tabel student_attendances
        if (class_basename($user) === 'Student') {
            $attendances = StudentAttendance::where('student_id', $user->id)
                ->orderBy('date', 'desc')
                ->paginate(15);
            return StudentAttendanceResource::collection($attendances);
        }

        // Jika user adalah Guru/Staff, tarik dari tabel attendances
        $attendances = Attendance::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->paginate(15);
        
        return AttendanceResource::collection($attendances);
    }

    public function today(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        if (class_basename($user) === 'Student') {
            $attendance = StudentAttendance::where('student_id', $user->id)
                ->whereDate('date', $today)
                ->first();
            return response()->json([
                'data' => $attendance ? new StudentAttendanceResource($attendance) : null
            ]);
        }

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        return response()->json([
            'data' => $attendance ? new AttendanceResource($attendance) : null
        ]);
    }

    public function checkIn(Request $request)
    {
        $user = $request->user();

        // Hanya Guru/Staff yang bisa check-in pribadi via endpoint ini
        if (class_basename($user) === 'Student') {
            return response()->json(['message' => 'Siswa tidak dapat melakukan check-in mandiri di sini.'], 403);
        }

        $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'notes' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        $today = Carbon::today()->toDateString();
        $attendance = Attendance::firstOrCreate(
            ['user_id' => $user->id, 'date' => $today],
            [
                'check_in' => Carbon::now()->toTimeString(),
                'status' => 'hadir',
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'notes' => $request->notes,
            ]
        );

        if ($attendance->wasRecentlyCreated) {
            // Ini adalah check-in
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('attendances', 'public');
                $attendance->update(['photo_path' => $path]);
            }
        } else {
            // Ini adalah check-out (absen kedua di hari yang sama)
            $updateData = [
                'check_out' => Carbon::now()->toTimeString()
            ];
            
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('attendances/checkout', 'public');
                $updateData['checkout_photo_path'] = $path;
            }
            
            $attendance->update($updateData);
        }

        return response()->json([
            'message' => $attendance->wasRecentlyCreated ? 'Check-in berhasil' : 'Check-out berhasil',
            'data' => new AttendanceResource($attendance)
        ]);
    }
}
