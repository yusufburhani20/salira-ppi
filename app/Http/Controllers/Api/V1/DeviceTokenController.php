<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DeviceToken;

class DeviceTokenController extends Controller
{
    /**
     * Store a new device token for the authenticated user/student.
     */
    public function store(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'device_type' => 'nullable|string',
        ]);

        $user = $request->user();

        // Check if token already exists for this specific user
        $exists = $user->deviceTokens()->where('token', $request->token)->exists();

        if (!$exists) {
            $user->deviceTokens()->create([
                'token' => $request->token,
                'device_type' => $request->device_type,
            ]);
        }

        return response()->json([
            'message' => 'Device token saved successfully.'
        ]);
    }
}
