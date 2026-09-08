<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $notifications = $user->notifications()->latest()->paginate(30);

        return response()->json([
            'data' => $notifications->map(fn($n) => [
                'id'         => $n->id,
                'type'       => class_basename($n->type),
                'title'      => $n->data['title'] ?? 'Notifikasi',
                'body'       => $n->data['body'] ?? ($n->data['message'] ?? ''),
                'url'        => $n->data['url'] ?? null,
                'read_at'    => $n->read_at?->toISOString(),
                'created_at' => $n->created_at->toISOString(),
            ]),
            'unread_count' => $user->unreadNotifications()->count(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'total'        => $notifications->total(),
            ],
        ]);
    }

    public function markAsRead($id)
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return response()->json(['message' => 'Notifikasi ditandai sudah dibaca']);
    }

    public function markAllAsRead()
    {
        Auth::user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'Semua notifikasi ditandai sudah dibaca']);
    }
}
