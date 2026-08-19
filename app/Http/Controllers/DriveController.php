<?php

namespace App\Http\Controllers;

use App\Models\DriveFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DriveController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user() ?? auth('student')->user();

        // Files owned by the user
        $myFiles = $user->driveFiles()->latest()->get();

        // Files shared with the user
        $sharedFiles = $user->sharedDriveFiles()->with('driveFile.owner')->latest()->get()->map(function ($share) {
            return $share->driveFile;
        });

        // Also fetch all users and students to allow sharing
        $users = \App\Models\User::select('id', 'name')->get()->map(function ($u) {
            return ['id' => $u->id, 'type' => \App\Models\User::class, 'name' => $u->name . ' (Staff/Guru)'];
        });

        $students = \App\Models\Student::select('id', 'name')->get()->map(function ($s) {
            return ['id' => $s->id, 'type' => \App\Models\Student::class, 'name' => $s->name . ' (Siswa)'];
        });

        $shareableUsers = $users->merge($students)->values();

        return Inertia::render('Drive/Index', [
            'myFiles' => $myFiles,
            'sharedFiles' => $sharedFiles,
            'shareableUsers' => $shareableUsers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480', function ($attribute, $value, $fail) {
                // Prevent executable files
                $blockedExtensions = ['exe', 'php', 'sh', 'bat', 'cmd', 'js'];
                if (in_array(strtolower($value->getClientOriginalExtension()), $blockedExtensions)) {
                    $fail('File type not allowed.');
                }
            }],
        ]);

        $user = $request->user() ?? auth('student')->user();
        $file = $request->file('file');
        
        $path = $file->storeAs(
            'drive/' . class_basename($user) . '_' . $user->id,
            Str::random(40) . '.' . $file->getClientOriginalExtension(),
            'local'
        );

        $user->driveFiles()->create([
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return redirect()->back()->with('success', 'File uploaded successfully.');
    }

    public function download(Request $request, $id)
    {
        $user = $request->user() ?? auth('student')->user();
        $file = DriveFile::findOrFail($id);

        // Check if user is owner
        $isOwner = $file->owner_type === get_class($user) && $file->owner_id === $user->id;
        
        // Check if shared to user
        $isShared = $file->shares()->where('shared_to_type', get_class($user))->where('shared_to_id', $user->id)->exists();

        if (!$isOwner && !$isShared) {
            abort(403, 'Unauthorized access to this file.');
        }

        if (!Storage::disk('local')->exists($file->file_path)) {
            abort(404, 'File not found on disk.');
        }

        return Storage::disk('local')->download($file->file_path, $file->original_name);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'original_name' => 'required|string|max:255',
        ]);

        $user = $request->user() ?? auth('student')->user();
        $file = $user->driveFiles()->findOrFail($id);

        $file->update([
            'original_name' => $request->original_name,
        ]);

        return redirect()->back()->with('success', 'File renamed successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user() ?? auth('student')->user();
        $file = $user->driveFiles()->findOrFail($id);

        if (Storage::disk('local')->exists($file->file_path)) {
            Storage::disk('local')->delete($file->file_path);
        }

        $file->delete();

        return redirect()->back()->with('success', 'File deleted successfully.');
    }
}
