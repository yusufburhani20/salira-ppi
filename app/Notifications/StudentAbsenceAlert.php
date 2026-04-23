<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use NotificationChannels\Telegram\TelegramMessage;

class StudentAbsenceAlert extends Notification
{
    use Queueable;

    protected $student;
    protected $date;

    public function __construct($student, $date)
    {
        $this->student = $student;
        $this->date = $date;
    }

    public function via($notifiable): array
    {
        $channels = ['database'];
        // parent_telegram_id ada langsung di model Student
        if ($notifiable->parent_telegram_id) {
            $channels[] = 'telegram';
        }
        return $channels;
    }

    public function toTelegram($notifiable)
    {
        $schoolName = \App\Models\Setting::where('key', 'school_name')->value('value') ?? 'Sekolah';
        
        return TelegramMessage::create()
            ->to($notifiable->parent_telegram_id) // Kirim ke Telegram WALI
            ->content("*Peringatan Kehadiran Siswa*\n\n" .
                "Bapak/Ibu Orang Tua dari *{$this->student->name}*,\n\n" .
                "Hingga saat ini (Pukul " . date('H:i') . "), anak Anda tercatat *BELUM* melakukan pemindaian kartu kehadiran di {$schoolName}.\n\n" .
                "Mohon segera lakukan konfirmasi jika anak Anda berhalangan hadir melalui Portal Siswa.\n\n" .
                "Terima kasih.");
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'Peringatan Kehadiran',
            'message' => "Siswa {$this->student->name} belum tercatat hadir hari ini.",
            'type' => 'warning',
            'student_id' => $this->student->id,
        ];
    }
}
