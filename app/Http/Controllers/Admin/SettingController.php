<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'school_name' => Setting::get('school_name', 'SALIRA ACADEMY'),
                'school_logo' => Setting::get('school_logo') ? Storage::url(Setting::get('school_logo')) : null,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'school_name' => 'required|string|max:255',
            'school_logo' => 'nullable|image|max:2048',
        ]);

        Setting::set('school_name', $request->school_name);

        if ($request->hasFile('school_logo')) {
            // Delete old logo
            $oldLogo = Setting::get('school_logo');
            if ($oldLogo) {
                Storage::disk('public')->delete($oldLogo);
            }

            $path = $request->file('school_logo')->store('settings', 'public');
            Setting::set('school_logo', $path);
        }

        return back()->with('success', 'Pengaturan berhasil diperbarui');
    }
}
