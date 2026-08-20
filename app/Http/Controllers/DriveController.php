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

        // 1. Dapatkan breadcrumbs
        $breadcrumbs = [];
        $currentFolder = null;

        // Root level: My folders and shared root folders
        $folders = \App\Models\DriveFolder::where('owner_type', get_class($user))
            ->where('owner_id', $user->id)
            ->whereNull('parent_id')
            ->get();

        // Include root shared folders
        $sharedFolderIds = \App\Models\DriveFolderShare::where('shared_to_type', get_class($user))
            ->where('shared_to_id', $user->id)
            ->pluck('drive_folder_id');
        
        if ($sharedFolderIds->isNotEmpty()) {
            $sharedFolders = \App\Models\DriveFolder::whereIn('id', $sharedFolderIds)->get();
            $folders = $folders->merge($sharedFolders)->unique('id')->values();
        }

        // Root files (My files only for now, since shared files could be anywhere)
        $files = $user->driveFiles()->whereNull('folder_id')->latest()->get();
        // Alias for backwards compatibility with old frontend (in case build fails)
        $myFiles = $user->driveFiles()->latest()->get();

        // Files shared with the user (for the "Shared With Me" tab)
        // Add filter() to remove nulls in case the original file was deleted but the share record remained
        $sharedFiles = $user->sharedDriveFiles()->with('driveFile.owner')->latest()->get()->map(function ($share) {
            return $share->driveFile;
        })->filter()->values();

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
            'initialFolders' => $folders,
            'initialFiles' => $files,
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
            'folder_id' => 'nullable|exists:drive_folders,id',
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
            'folder_id' => $request->folder_id,
        ]);

        return redirect()->back()->with('success', 'File uploaded successfully.');
    }

    public function download(Request $request, $id)
    {
        $user = $request->user() ?? auth('student')->user();
        $file = DriveFile::with('folder')->findOrFail($id);

        // Check if user is owner
        $isOwner = $file->owner_type === get_class($user) && $file->owner_id === $user->id;
        
        // Check if file is shared to user directly
        $isShared = $file->shares()->where('shared_to_type', get_class($user))->where('shared_to_id', $user->id)->exists();

        // Check if parent folder (or grand-parent) is shared to user
        if (!$isOwner && !$isShared && $file->folder_id) {
            $checkFolder = $file->folder;
            while ($checkFolder) {
                if ($checkFolder->shares()->where('shared_to_type', get_class($user))->where('shared_to_id', $user->id)->exists()) {
                    $isShared = true;
                    break;
                }
                $checkFolder = $checkFolder->parent;
            }
        }

        if (!$isOwner && !$isShared) {
            abort(403, 'Unauthorized access to this file.');
        }

        if (!Storage::disk('local')->exists($file->file_path)) {
            abort(404, 'File not found on disk.');
        }

        // Always use inline for PDF and images, attachment for others (unless forced by query string)
        $mime = $file->mime_type;
        $isViewable = str_contains($mime, 'pdf') || str_contains($mime, 'image') || str_contains($mime, 'text');
        
        // Force attachment if requested, or if not natively viewable
        $disposition = ($isViewable && !$request->has('download')) ? 'inline' : 'attachment';

        $headers = [
            'Content-Type' => $file->mime_type,
            'Content-Disposition' => $disposition . '; filename="' . $file->original_name . '"',
        ];

        return Storage::disk('local')->response($file->file_path, $file->original_name, $headers);
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
