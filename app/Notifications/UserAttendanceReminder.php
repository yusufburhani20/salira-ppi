<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class UserAttendanceReminder extends Notification implements ShouldQueue
{
    use Queueable;

    protected $type;

    /**
     * Create a new notification instance.
     *
     * @param string $type Either 'check_in' or 'check_out'
     */
    public function __construct(string $type)
    {
        $this->type = $type;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];
        if (\App\Models\Setting::get('notif_channel_webpush', '1') === '1' && \App\Models\Setting::get('user_attendance_reminder_enabled', '1') === '1') {
            $channels[] = \App\Notifications\Channels\WebPushChannel::class;
        }
        return $channels;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        if ($this->type === 'check_in') {
            $message = "Halo {$notifiable->name}, waktu menunjukkan pukul 07:30. Anda belum tercatat melakukan check-in hari ini. Silakan lakukan absensi sekarang.";
        } else {
            $message = "Halo {$notifiable->name}, waktu menunjukkan pukul 15:00. Jangan lupa untuk melakukan check-out sebelum pulang hari ini.";
        }

        return [
            'title' => $this->type === 'check_in' ? 'Pengingat Absensi Masuk' : 'Pengingat Absensi Pulang',
            'message' => $message,
            'type' => 'info',
            'action_url' => '/attendances/scanner',
        ];
    }

    /**
     * Get the web push representation of the notification.
     */
    public function toWebPush(object $notifiable): array
    {
        if ($this->type === 'check_in') {
            $title = 'Pengingat Absensi Masuk';
            $body = "Halo {$notifiable->name}, jam sudah menunjukkan pukul 07:30. Anda belum tercatat melakukan check-in hari ini. Silakan absensi sekarang.";
        } else {
            $title = 'Pengingat Absensi Pulang';
            $body = "Halo {$notifiable->name}, jam sudah menunjukkan pukul 15:00. Jangan lupa melakukan check-out sebelum pulang.";
        }

        return [
            'title' => $title,
            'body' => $body,
            'action_url' => '/attendances/scanner',
            'icon' => '/images/icon-192.png',
        ];
    }
}
