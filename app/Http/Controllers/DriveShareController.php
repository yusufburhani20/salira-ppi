<?php

namespace App\Http\Controllers;

use App\Models\DriveFile;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DriveShareController extends Controller
{
    public function store(Request $request, $id)
    {
        $request->validate([
            'shared_to_type' => 'required|string',
            'shared_to_id' => 'required|integer',
        ]);

        $user = $request->user() ?? auth('student')->user();
        $file = $user->driveFiles()->findOrFail($id);

        // Prevent duplicate share
        $file->shares()->firstOrCreate([
            'shared_to_type' => $request->shared_to_type,
            'shared_to_id' => $request->shared_to_id,
        ]);

        return redirect()->back()->with('success', 'File shared successfully.');
    }

    public function destroy(Request $request, $id, $shareId)
    {
        $user = $request->user() ?? auth('student')->user();
        $file = $user->driveFiles()->findOrFail($id);
        
        $share = $file->shares()->findOrFail($shareId);
        $share->delete();

        return redirect()->back()->with('success', 'Share revoked successfully.');
    }

    public function generatePublicLink(Request $request, $id)
    {
        $user = $request->user() ?? auth('student')->user();
        $file = $user->driveFiles()->findOrFail($id);

        if (!$file->public_token) {
            $file->update([
                'public_token' => Str::uuid()->toString(),
                'is_public' => true,
            ]);
        } else {
            $file->update(['is_public' => true]);
        }

        return redirect()->back()->with('success', 'Public link generated.');
    }

    public function revokePublicLink(Request $request, $id)
    {
        $user = $request->user() ?? auth('student')->user();
        $file = $user->driveFiles()->findOrFail($id);

        $file->update([
            'is_public' => false,
            'public_token' => null,
        ]);

        return redirect()->back()->with('success', 'Public link revoked.');
    }
}
