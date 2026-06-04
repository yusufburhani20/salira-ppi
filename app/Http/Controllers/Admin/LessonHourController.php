<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LessonHourController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/LessonHours/Index', [
            'lesson_hours' => json_decode(Setting::get('lesson_hours_by_day', '{}'), true)
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'lesson_hours' => 'required|array'
        ]);

        Setting::set('lesson_hours_by_day', json_encode($request->input('lesson_hours', [])));

        return back()->with('success', 'Master jam pelajaran berdasarkan hari berhasil disimpan.');
    }
}
