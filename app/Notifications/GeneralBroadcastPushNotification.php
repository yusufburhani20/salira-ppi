<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class GeneralBroadcastPushNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $title;
    protected $body;
    protected $actionUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $title, string $body, string $actionUrl)
    {
        $this->title = $title;
        $this->body = $body;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [\App\Notifications\Channels\WebPushChannel::class, 'database'];
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'action_url' => $this->actionUrl,
            'icon' => '/images/icon-192.png',
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->body,
            'type' => 'info',
            'action_url' => $this->actionUrl,
        ];
    }
}
