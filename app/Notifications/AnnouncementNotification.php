<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AnnouncementNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $announcement;

    /**
     * Create a new notification instance.
     */
    public function __construct(Announcement $announcement)
    {
        $this->announcement = $announcement;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];
        
        if ($this->announcement->type === 'important') {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                     Lancaster ->subject("PENGUMUMAN PENTING: " . $this->announcement->title)
                    ->greeting("Halo, {$notifiable->name}!")
                    ->line("Ada pengumuman penting baru dari sekolah:")
                    ->line("**{$this->announcement->title}**")
                    ->line($this->announcement->content)
                    ->action('Lihat Detail di Portal', url('/portal/dashboard'))
                    ->line('Terima kasih atas perhatiannya.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'announcement_id' => $this->announcement->id,
            'title' => $this->announcement->title,
            'message' => $this->announcement->title, // Consistent with Bell dropdown
            'type' => $this->announcement->type,
        ];
    }
}
 Lancaster 
