<?php

namespace App\Http\Controllers;

use App\Models\DriveFolder;
use Illuminate\Http\Request;

class DriveFolderShareController extends Controller
{
    public function store(Request $request, $id)
    {
        $request->validate([
            'shared_to_type' => 'required|string',
            'shared_to_id' => 'required|integer',
        ]);

        $user = $request->user() ?? auth('student')->user();
        $folder = DriveFolder::where('owner_type', get_class($user))
            ->where('owner_id', $user->id)
            ->findOrFail($id);

        // Prevent duplicate share
        $exists = $folder->shares()
            ->where('shared_to_type', $request->shared_to_type)
            ->where('shared_to_id', $request->shared_to_id)
            ->exists();

        if (!$exists) {
            $folder->shares()->create([
                'shared_to_type' => $request->shared_to_type,
                'shared_to_id' => $request->shared_to_id,
            ]);
        }

        return back()->with('success', 'Folder berhasil dibagikan.');
    }

    public function destroy(Request $request, $id, $shareId)
    {
        $user = $request->user() ?? auth('student')->user();
        $folder = DriveFolder::where('owner_type', get_class($user))
            ->where('owner_id', $user->id)
            ->findOrFail($id);

        $share = $folder->shares()->findOrFail($shareId);
        $share->delete();

        return back()->with('success', 'Akses folder berhasil dicabut.');
    }

    public function generatePublicLink(Request $request, $id)
    {
        $user = $request->user() ?? auth('student')->user();
        $folder = DriveFolder::where('owner_type', get_class($user))
            ->where('owner_id', $user->id)
            ->findOrFail($id);

        $folder->update([
            'is_public' => true,
            'public_token' => $folder->public_token ?? $folder->generatePublicToken(),
        ]);

        return back()->with('success', 'Tautan publik folder berhasil dibuat.');
    }

    public function revokePublicLink(Request $request, $id)
    {
        $user = $request->user() ?? auth('student')->user();
        $folder = DriveFolder::where('owner_type', get_class($user))
            ->where('owner_id', $user->id)
            ->findOrFail($id);

        $folder->update([
            'is_public' => false,
            'public_token' => null,
        ]);

        return back()->with('success', 'Tautan publik folder berhasil dicabut.');
    }
}
