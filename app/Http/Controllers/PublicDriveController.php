<?php

namespace App\Http\Controllers;

use App\Models\DriveFile;
use Illuminate\Support\Facades\Storage;

class PublicDriveController extends Controller
{
    public function download($token)
    {
        $file = DriveFile::where('public_token', $token)->where('is_public', true)->firstOrFail();

        if (!Storage::disk('local')->exists($file->file_path)) {
            abort(404, 'File not found on disk.');
        }

        return Storage::disk('local')->download($file->file_path, $file->original_name);
    }
}
