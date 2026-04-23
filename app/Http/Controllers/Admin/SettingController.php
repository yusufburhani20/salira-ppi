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
                'school_name'              => Setting::get('school_name', 'SALIRA ACADEMY'),
                'school_address'           => Setting::get('school_address', ''),
                'school_phone'             => Setting::get('school_phone', ''),
                'school_email'             => Setting::get('school_email', ''),
                'report_location'          => Setting::get('report_location', 'Kota'),
                'school_logo'              => Setting::get('school_logo') ? Storage::url(Setting::get('school_logo')) : null,
                'school_favicon'           => Setting::get('school_favicon') ? Storage::url(Setting::get('school_favicon')) : null,
                'attendance_alert_enabled' => Setting::get('attendance_alert_enabled', '0') === '1',
                'attendance_alert_time'    => Setting::get('attendance_alert_time', '08:00'),
            ]
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'school_name' => 'required|string|max:255',
            'school_address' => 'nullable|string',
            'school_phone' => 'nullable|string|max:50',
            'school_email' => 'nullable|email|max:100',
            'report_location' => 'nullable|string|max:100',
            'school_logo' => 'nullable|image|max:2048',
            'school_favicon' => 'nullable|image|mimes:ico,png,jpg,jpeg,svg|max:1024',
        ]);

        Setting::set('school_name', $request->school_name);
        Setting::set('school_address', $request->school_address);
        Setting::set('school_phone', $request->school_phone);
        Setting::set('school_email', $request->school_email);
        Setting::set('report_location', $request->report_location);
        Setting::set('attendance_alert_enabled', $request->boolean('attendance_alert_enabled') ? '1' : '0');
        Setting::set('attendance_alert_time', $request->attendance_alert_time ?? '08:00');

        if ($request->hasFile('school_logo')) {
            // Delete old logo
            $oldLogo = Setting::get('school_logo');
            if ($oldLogo) {
                Storage::disk('public')->delete($oldLogo);
            }

            $path = $request->file('school_logo')->store('settings', 'public');
            Setting::set('school_logo', $path);
        }

        if ($request->hasFile('school_favicon')) {
            $oldFavicon = Setting::get('school_favicon');
            if ($oldFavicon) {
                Storage::disk('public')->delete($oldFavicon);
            }

            $path = $request->file('school_favicon')->store('settings', 'public');
            Setting::set('school_favicon', $path);
        }

        return back()->with('success', 'Pengaturan berhasil diperbarui');
    }
}
