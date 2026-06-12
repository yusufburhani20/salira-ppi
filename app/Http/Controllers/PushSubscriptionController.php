<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PushSubscription;

class PushSubscriptionController extends Controller
{
    /**
     * Store or update a push subscription.
     */
    public function store(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|string',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $user = $request->user('web') ?: $request->user('student');

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user->pushSubscriptions()->updateOrCreate(
            ['endpoint' => $request->endpoint],
            [
                'p256dh' => $request->input('keys.p256dh'),
                'auth' => $request->input('keys.auth'),
            ]
        );

        return response()->json(['message' => 'Subscription saved successfully.']);
    }

    /**
     * Remove a push subscription.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|string',
        ]);

        $user = $request->user('web') ?: $request->user('student');

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user->pushSubscriptions()->where('endpoint', $request->endpoint)->delete();

        return response()->json(['message' => 'Subscription removed successfully.']);
    }
}
