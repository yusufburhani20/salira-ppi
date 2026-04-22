<?php

namespace App\Notifications;

use App\Models\Bill;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BillPaidNotification extends Notification implements ShouldQueue
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
                    ->subject("Bukti Lunas SPP " . $this->bill->title)
                    ->greeting("Halo, Bapak/Ibu dari {$notifiable->name}!")
                    ->line("Terima kasih! Pembayaran untuk tagihan {$this->bill->title} sebesar Rp {$amount} telah kami terima.")
                    ->line("Status Tagihan saat ini: LUNAS pada " . ($this->bill->paid_at ? $this->bill->paid_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i')))
                    ->action('Lihat Kuitansi', $url)
                    ->line('Terima kasih atas partisipasi Anda.');
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
            'message' => "Tagihan {$this->bill->title} telah dilonasi.",
        ];
    }

    /**
     * Trigger Telegram Notification
     */
    public function toTelegram(object $notifiable)
    {
        $targetId = $notifiable->parent_telegram_id ?? $notifiable->telegram_id;
        if (!$targetId) return;

        $amount = number_format($this->bill->amount, 0, ',', '.');
        $url = url('/invoice/' . $this->bill->bill_number);
        $dateStr = $this->bill->paid_at ? $this->bill->paid_at->format('d/m/Y H:i') : now()->format('d/m/Y H:i');

        $message = "<b>✅ PEMBAYARAN BERHASIL</b>\n\n";
        $message .= "Bapak/Ibu wali dari <b>{$notifiable->name}</b>,\n";
        $message .= "Terima kasih, pembayaran tagihan <b>{$this->bill->title}</b> sebesar <b>Rp {$amount}</b> telah berhasil dan berstatus <b>LUNAS</b>.\n\n";
        $message .= "Waktu lunas: {$dateStr}\n";
        $message .= "<a href='{$url}'>Lihat Kuitansi</a>\n\n";

        return app(TelegramService::class)->sendMessage($targetId, $message);
    }
}
