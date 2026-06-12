<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use App\Models\PushSubscription;
use Illuminate\Support\Facades\Log;

class WebPushChannel
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
        // 1. Get subscriptions for this user/student
        $subscriptions = $notifiable->pushSubscriptions;
        if ($subscriptions->isEmpty()) {
            return;
        }

        // 2. Prepare payload data
        if (method_exists($notification, 'toWebPush')) {
            $data = $notification->toWebPush($notifiable);
        } elseif (method_exists($notification, 'toArray')) {
            $arrayData = $notification->toArray($notifiable);
            $data = [
                'title' => config('app.name', 'SALIRA'),
                'body' => $arrayData['message'] ?? 'Notifikasi baru diterima.',
                'action_url' => $arrayData['action_url'] ?? '/dashboard',
                'icon' => '/images/icon-192.png',
            ];
        } else {
            return;
        }

        if (!$data) {
            return;
        }

        $payload = json_encode([
            'title' => $data['title'] ?? config('app.name', 'SALIRA'),
            'body' => $data['body'] ?? '',
            'action_url' => $data['action_url'] ?? '/dashboard',
            'icon' => $data['icon'] ?? '/images/icon-192.png',
            'badge' => $data['badge'] ?? '/favicon.ico',
        ]);

        // 3. Initialize WebPush client
        $publicKey = env('VAPID_PUBLIC_KEY');
        $privateKey = env('VAPID_PRIVATE_KEY');

        if (!$publicKey || !$privateKey) {
            Log::warning('WebPush is missing VAPID keys. Notification not sent.');
            return;
        }

        try {
            $auth = [
                'VAPID' => [
                    'subject' => 'mailto:admin@salira.com',
                    'publicKey' => $publicKey,
                    'privateKey' => $privateKey,
                ],
            ];

            $webPush = new WebPush($auth);

            // 4. Queue notifications for all user's browser endpoints
            foreach ($subscriptions as $sub) {
                $webPushSubscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->p256dh,
                    'authToken' => $sub->auth,
                ]);

                $webPush->queueNotification($webPushSubscription, $payload);
            }

            // 5. Send and flush
            foreach ($webPush->flush() as $report) {
                if (!$report->isSuccess()) {
                    Log::info("WebPush dispatch failed for endpoint: {$report->getEndpoint()}. Reason: {$report->getReason()}");
                    
                    // If the subscription is expired or unsubscribed, delete it from our DB
                    if ($report->isSubscriptionExpired()) {
                        PushSubscription::where('endpoint', $report->getEndpoint())->delete();
                        Log::info("Deleted expired push subscription for endpoint: {$report->getEndpoint()}");
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error("WebPush Channel Error: " . $e->getMessage());
        }
    }
}
