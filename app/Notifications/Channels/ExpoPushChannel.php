<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;

class ExpoPushChannel
{
    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        // Get the expo push tokens from the notifiable model
        if (!method_exists($notifiable, 'deviceTokens')) {
            return;
        }

        $tokens = $notifiable->deviceTokens()->pluck('token')->toArray();

        if (empty($tokens)) {
            return;
        }

        // Get the payload from the notification class
        if (method_exists($notification, 'toExpoPush')) {
            $message = $notification->toExpoPush($notifiable);
        } else {
            // Default payload fallback if not specified
            $message = [
                'title' => 'Notifikasi Baru',
                'body' => 'Anda mendapatkan pesan baru.',
            ];
        }

        // Prepare the payload for Expo Push API (chunking for multiple tokens)
        // Note: Expo accepts an array of messages
        $messages = [];
        foreach ($tokens as $token) {
            $messages[] = array_merge([
                'to' => $token,
                'sound' => 'default',
            ], $message);
        }

        // Send to Expo Push API
        try {
            Http::withHeaders([
                'Accept' => 'application/json',
                'Accept-Encoding' => 'gzip, deflate',
                'Content-Type' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', $messages);
        } catch (\Exception $e) {
            // Log error
            \Log::error('Expo Push Notification Error: ' . $e->getMessage());
        }
    }
}
