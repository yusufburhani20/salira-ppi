<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAttendance;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;

class EventAttendanceController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_id' => 'nullable|exists:users,id',
            'guest_name' => 'nullable|string|max:255',
            'proof' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if (empty($request->user_id) && empty($request->guest_name)) {
            return back()->withErrors(['user_id' => 'Silakan pilih nama Anda atau masukkan nama manual.']);
        }

        try {
            $event = Event::findOrFail($request->event_id);

            if (!$event->is_active) {
                return back()->withErrors(['event_id' => 'Event ini sedang tidak aktif.']);
            }

            // Pengecekan absen ganda
            $query = EventAttendance::where('event_id', $request->event_id);
            if (!empty($request->user_id)) {
                $query->where('user_id', $request->user_id);
            } else {
                $query->where('guest_name', trim($request->guest_name));
            }

            if ($query->exists()) {
                return back()->with('error', 'Nama ini sudah melakukan absensi untuk event ini.');
            }

            // Simpan dan kompres foto bukti kehadiran menggunakan ImageCompressionService
            $path = ImageCompressionService::compressAndStore(
                $request->file('proof'),
                'event_attendances',
                1024,
                75
            );

            EventAttendance::create([
                'event_id' => $request->event_id,
                'user_id' => $request->user_id ?: null,
                'guest_name' => empty($request->user_id) ? trim($request->guest_name) : null,
                'proof_path' => $path,
                'status' => 'hadir',
            ]);

            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => 'Absensi event berhasil dikirim!'
                ]);
            }

            return back()->with('success', 'Absensi event berhasil dikirim!');
        } catch (\Throwable $e) {
            \Log::error('Event Attendance Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'error' => 'Gagal memproses absensi: ' . $e->getMessage()
                ], 500);
            }

            return back()->with('error', 'Gagal memproses absensi: ' . $e->getMessage());
        }
    }
}
