<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DriveFile;
use App\Models\DriveLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DriveManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = DriveFile::with('owner')->latest();

        if ($request->search) {
            $query->where('original_name', 'like', '%' . $request->search . '%');
        }

        $files = $query->paginate(20);

        // Calculate statistics
        $totalStorageBytes = DriveFile::sum('file_size');
        
        return Inertia::render('Admin/Drive/Management', [
            'files' => $files,
            'filters' => $request->only('search'),
            'statistics' => [
                'total_bytes' => (int) $totalStorageBytes,
            ]
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $file = DriveFile::findOrFail($id);

        // Delete from physical storage
        if (Storage::disk('local')->exists($file->file_path)) {
            Storage::disk('local')->delete($file->file_path);
        }

        // Log action
        DriveLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'deleted_file',
            'target_owner_type' => $file->owner_type,
            'target_owner_id' => $file->owner_id,
            'file_name' => $file->original_name,
            'details' => 'Force deleted by admin',
        ]);

        $file->delete();

        return redirect()->back()->with('success', 'File permanently deleted.');
    }

    public function revokeLink(Request $request, $id)
    {
        $file = DriveFile::findOrFail($id);

        $file->update([
            'is_public' => false,
            'public_token' => null,
        ]);

        // Log action
        DriveLog::create([
            'admin_id' => $request->user()->id,
            'action' => 'revoked_public_link',
            'target_owner_type' => $file->owner_type,
            'target_owner_id' => $file->owner_id,
            'file_name' => $file->original_name,
            'details' => 'Public link force revoked by admin',
        ]);

        return redirect()->back()->with('success', 'Public link forcibly revoked.');
    }
}
