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
            'user_id' => 'required|exists:users,id',
            'proof' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        try {
            $event = Event::findOrFail($request->event_id);

            if (!$event->is_active) {
                return back()->withErrors(['event_id' => 'Event ini sedang tidak aktif.']);
            }

            // Pengecekan absen ganda
            $exists = EventAttendance::where('event_id', $request->event_id)
                ->where('user_id', $request->user_id)
                ->exists();

            if ($exists) {
                return back()->with('error', 'Anda sudah melakukan absensi untuk event ini.');
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
                'user_id' => $request->user_id,
                'proof_path' => $path,
                'status' => 'hadir',
            ]);

            return back()->with('success', 'Absensi event berhasil dikirim!');
        } catch (\Exception $e) {
            \Log::error('Event Attendance Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return back()->with('error', 'Gagal memproses absensi: ' . $e->getMessage());
        }
    }
}
