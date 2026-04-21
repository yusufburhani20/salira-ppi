<?php

namespace App\Notifications;

use App\Models\PermissionRequest;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PermissionStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    protected $permission;

    /**
     * Create a new notification instance.
     */
    public function __construct(PermissionRequest $permission)
    {
        $this->permission = $permission;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database', 'mail'];

        if ($notifiable->telegram_id) {
            $channels[] = \App\Notifications\Channels\TelegramChannel::class;
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $statusStr = strtoupper($this->permission->status->label());
        $typeLabel = $this->permission->type->label();
        $reason = $this->permission->rejection_reason ? "\nAlasan: " . $this->permission->rejection_reason : "";

        return (new MailMessage)
                    ->subject("Status Pengajuan Izin: {$statusStr}")
                    ->greeting("Halo, {$notifiable->name}!")
                    ->line("Status pengajuan izin Anda ({$typeLabel}) pada tanggal " . $this->permission->start_date->format('d/m/Y') . " telah diperbarui.")
                    ->line("Status Saat Ini: **{$statusStr}**")
                    ->line($reason)
                    ->action('Lihat Detail', url('/permissions'))
                    ->line('Terima kasih telah menggunakan aplikasi SALIRA!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'permission_id' => $this->permission->id,
            'type' => $this->permission->type->value,
            'status' => $this->permission->status->value,
            'message' => "Pengajuan izin " . $this->permission->type->label() . " Anda telah " . strtolower($this->permission->status->label()),
        ];
    }

    /**
     * Send the notification via Telegram.
     */
    public function toTelegram(object $notifiable)
    {
        if (!$notifiable->telegram_id) return;

        $statusStr = $this->permission->status->value === 'approved' ? '✅ DITERIMA' : '❌ DITOLAK';
        $typeLabel = $this->permission->type->label();
        $reason = $this->permission->rejection_reason ? "\n<b>Alasan:</b> " . $this->permission->rejection_reason : "";

        $message = "<b>🔔 NOTIFIKASI SALIRA</b>\n\n";
        $message .= "Halo {$notifiable->name},\n";
        $message .= "Pengajuan izin <b>{$typeLabel}</b> Anda telah diperbarui.\n\n";
        $message .= "<b>Status:</b> {$statusStr}{$reason}\n\n";
        $message .= "Silakan cek dashboard untuk detail lebih lanjut.";

        return app(TelegramService::class)->sendMessage($notifiable->telegram_id, $message);
    }
}
