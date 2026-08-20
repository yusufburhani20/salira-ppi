<?php

namespace App\Http\Controllers;

use App\Models\DriveFolder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicDriveFolderController extends Controller
{
    public function show(Request $request, $token)
    {
        $folder = DriveFolder::where('public_token', $token)
            ->where('is_public', true)
            ->firstOrFail();

        $currentFolderId = $request->query('folder_id');
        $currentFolder = $folder;

        if ($currentFolderId && $currentFolderId != $folder->id) {
            $currentFolder = DriveFolder::findOrFail($currentFolderId);
            
            // Validate that currentFolder is a descendant of the shared folder
            $isDescendant = false;
            $parent = $currentFolder->parent;
            while ($parent) {
                if ($parent->id === $folder->id) {
                    $isDescendant = true;
                    break;
                }
                $parent = $parent->parent;
            }

            if (!$isDescendant) {
                abort(403, 'Unauthorized access to this folder.');
            }
        }

        // Fetch children
        $subfolders = $currentFolder->children()->orderBy('name')->get();
        $files = $currentFolder->files()->orderBy('original_name')->get();

        // Build breadcrumbs for UI
        $breadcrumbs = [];
        if ($currentFolder->id !== $folder->id) {
            $curr = $currentFolder;
            while ($curr && $curr->id !== $folder->id) {
                array_unshift($breadcrumbs, [
                    'id' => $curr->id,
                    'name' => $curr->name,
                ]);
                $curr = $curr->parent;
            }
            // Add the root shared folder
            array_unshift($breadcrumbs, [
                'id' => $folder->id,
                'name' => $folder->name,
            ]);
        } else {
            $breadcrumbs[] = [
                'id' => $folder->id,
                'name' => $folder->name,
            ];
        }

        // Get owner info
        $owner = $folder->owner;

        return Inertia::render('Drive/PublicFolder', [
            'sharedFolder' => $folder,
            'currentFolder' => $currentFolder,
            'subfolders' => $subfolders,
            'files' => $files,
            'breadcrumbs' => $breadcrumbs,
            'ownerName' => $owner ? $owner->name : 'Unknown',
            'token' => $token,
        ]);
    }

    public function downloadFile(Request $request, $token, $file_id)
    {
        $folder = DriveFolder::where('public_token', $token)
            ->where('is_public', true)
            ->firstOrFail();

        $file = \App\Models\DriveFile::findOrFail($file_id);

        // Validate that the file belongs to the shared folder or its descendants
        $isDescendant = false;
        $parent = $file->folder;
        while ($parent) {
            if ($parent->id === $folder->id) {
                $isDescendant = true;
                break;
            }
            $parent = $parent->parent;
        }

        if (!$isDescendant) {
            abort(403, 'Unauthorized access to this file.');
        }

        if (!\Illuminate\Support\Facades\Storage::disk('local')->exists($file->file_path)) {
            abort(404, 'File not found on disk.');
        }

        return \Illuminate\Support\Facades\Storage::disk('local')->download($file->file_path, $file->original_name);
    }
}
