<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Student;
use App\Notifications\AnnouncementNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => Announcement::latest()->paginate(15)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|string|in:info,warning,success,important',
            'target' => 'required|string|in:students,all',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $announcement = Announcement::create($validated);

        // Notify Target Students
        if ($validated['target'] === 'all' || $validated['target'] === 'students') {
            Student::chunk(100, function ($students) use ($announcement) {
                foreach ($students as $student) {
                    $student->notify(new AnnouncementNotification($announcement));
                }
            });
        }

        return back()->with('success', 'Pengumuman berhasil diterbitkan.');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|string|in:info,warning,success,important',
            'target' => 'required|string|in:students,all',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $announcement->update($validated);

        return back()->with('success', 'Pengumuman berhasil diperbarui.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}
