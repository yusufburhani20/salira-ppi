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

    public function systemUpdate()
    {
        // Path to the deploy script
        $scriptPath = base_path('deploy.sh');
        $logPath = storage_path('logs/deploy.log');

        if (!file_exists($scriptPath)) {
            return response()->json(['status' => 'error', 'message' => 'Script deploy.sh tidak ditemukan.'], 404);
        }

        // Wipe the old log file and write initial message
        file_put_contents($logPath, "[" . now()->format('H:i:s') . "] Memulai proses pembaruan sistem...\n");

        // Pass GitHub credentials as environment variables to the script
        $githubToken = env('GITHUB_TOKEN', '');
        $githubUser  = env('GITHUB_USER', '');

        // Execute the script in the background, redirect all stdout+stderr to log
        $envPrefix = '';
        if ($githubToken && $githubUser) {
            $envPrefix = "GITHUB_TOKEN=" . escapeshellarg($githubToken) . " GITHUB_USER=" . escapeshellarg($githubUser) . " ";
        }

        exec("{$envPrefix}bash {$scriptPath} >> {$logPath} 2>&1 &");

        return response()->json(['status' => 'success', 'message' => 'Proses pembaruan sedang berjalan di latar belakang.']);
    }

    public function updateLogs()
    {
        $logPath = storage_path('logs/deploy.log');

        if (!file_exists($logPath)) {
            return response()->json(['logs' => 'Belum ada log pembaruan.']);
        }

        // Read file with pure PHP — no shell_exec (more reliable on all servers)
        $content = file_get_contents($logPath);
        
        // Return only the last ~8000 chars to avoid huge payloads
        if (strlen($content) > 8000) {
            $content = '...[log dipotong]...' . substr($content, -8000);
        }

        return response()->json(['logs' => $content ?: 'Log kosong.']);
    }
}
