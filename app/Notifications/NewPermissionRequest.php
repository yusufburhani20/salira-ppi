<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\PermissionRequest;

class NewPermissionRequest extends Notification implements ShouldQueue
{
    use Queueable;

    public $permissionRequest;

    /**
     * Create a new notification instance.
     */
    public function __construct(PermissionRequest $permissionRequest)
    {
        $this->permissionRequest = $permissionRequest;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $typeLabel = $this->permissionRequest->type instanceof \App\Enums\PermissionType 
            ? $this->permissionRequest->type->label() 
            : $this->permissionRequest->type;

        return (new MailMessage)
            ->subject('Pengajuan Izin Baru: ' . $this->permissionRequest->user->name)
            ->greeting('Halo ' . $notifiable->name . ',')
            ->line('Terdapat pengajuan ' . $typeLabel . ' baru dari ' . $this->permissionRequest->user->name . '.')
            ->line('Alasan: ' . $this->permissionRequest->reason)
            ->action('Lihat Pengajuan', url('/admin/approvals'))
            ->line('Terima kasih telah menggunakan sistem SALIRA!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $typeLabel = $this->permissionRequest->type instanceof \App\Enums\PermissionType 
            ? $this->permissionRequest->type->label() 
            : $this->permissionRequest->type;

        return [
            'permission_id' => $this->permissionRequest->id,
            'user_name' => $this->permissionRequest->user->name,
            'type' => $typeLabel,
            'message' => $this->permissionRequest->user->name . ' mengajukan ' . $typeLabel . ' baru.',
        ];
    }
}
