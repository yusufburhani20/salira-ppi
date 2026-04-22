<?php

namespace App\Notifications;

use App\Models\Bill;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BillGeneratedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $bill;

    /**
     * Create a new notification instance.
     */
    public function __construct(Bill $bill)
    {
        $this->bill = $bill;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database', 'mail'];
        if ($notifiable->telegram_id || $notifiable->parent_telegram_id) {
            $channels[] = \App\Notifications\Channels\TelegramChannel::class;
        }
        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $amount = number_format($this->bill->amount, 0, ',', '.');
        $url = url('/invoice/' . $this->bill->bill_number);

        return (new MailMessage)
                    ->subject("Tagihan SPP " . $this->bill->title)
                    ->greeting("Halo, Bapak/Ibu dari {$notifiable->name}!")
                    ->line("Ini adalah pengingat bahwa tagihan {$this->bill->title} sebesar Rp {$amount} telah diterbitkan dan belum dibayarkan.")
                    ->action('Bayar Sekarang', $url)
                    ->line('Terima kasih atas partisipasi Anda mendukung pendidikan di institusi kami.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'bill_id' => $this->bill->id,
            'amount' => $this->bill->amount,
            'message' => "Tagihan {$this->bill->title} baru saja diterbitkan.",
        ];
    }

    /**
     * Trigger Telegram Notification
     */
    public function toTelegram(object $notifiable)
    {
        // Handle target telegram_id (bisa dari user/pegawai atau parent/student)
        $targetId = $notifiable->parent_telegram_id ?? $notifiable->telegram_id;
        if (!$targetId) return;

        $amount = number_format($this->bill->amount, 0, ',', '.');
        $url = url('/invoice/' . $this->bill->bill_number);

        $message = "<b>⚠️ TAGIHAN BARU SALIRA</b>\n\n";
        $message .= "Bapak/Ibu wali dari <b>{$notifiable->name}</b>,\n";
        $message .= "Tagihan <b>{$this->bill->title}</b> sebesar <b>Rp {$amount}</b> telah diterbitkan.\n\n";
        $message .= "Harap segera melakukan pembayaran melalui tautan web di bawah ini:\n";
        $message .= "<a href='{$url}'>Lihat & Bayar Tagihan</a>\n\n";
        $message .= "Terima kasih.";

        return app(TelegramService::class)->sendMessage($targetId, $message);
    }
}
