<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TelegramController extends Controller
{
    protected $telegram;

    public function __construct(TelegramService $telegram)
    {
        $this->telegram = $telegram;
    }

    /**
     * Handle incoming Webhook from Telegram.
     */
    public function handle(Request $request)
    {
        $update = $request->all();
        Log::info('Telegram Update Received:', $update);

        if (!isset($update['message'])) {
            return response()->json(['status' => 'ok']);
        }

        $message = $update['message'];
        $chatId = $message['chat']['id'];
        $text = $message['text'] ?? '';

        // 1. Handle /start command
        if (strpos($text, '/start') === 0) {
            Log::info("Handling /start for ChatID: {$chatId}");
            return $this->sendWelcomeMessage($chatId);
        }

        // 2. Handle Contact Sharing
        if (isset($message['contact'])) {
            Log::info("Handling Contact Sharing for ChatID: {$chatId}");
            return $this->handleContactSharing($chatId, $message['contact']);
        }

        return response()->json(['status' => 'ok']);
    }

    protected function sendWelcomeMessage($chatId)
    {
        $token = config('services.telegram.bot_token');
        $baseUrl = "https://api.telegram.org/bot{$token}";

        $keyboard = [
            'keyboard' => [
                [
                    ['text' => '📲 Verifikasi Nomor HP Saya', 'request_contact' => true]
                ]
            ],
            'resize_keyboard' => true,
            'one_time_keyboard' => true
        ];

        $response = \Illuminate\Support\Facades\Http::post("{$baseUrl}/sendMessage", [
            'chat_id' => $chatId,
            'text' => "Selamat datang di Bot SALIRA!\n\nSilakan klik tombol di bawah untuk memverifikasi nomor HP Anda.",
            'reply_markup' => json_encode($keyboard)
        ]);

        if (!$response->successful()) {
            Log::error('Telegram Send Error: ' . $response->body());
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * Match phone number and save Chat ID.
     */
    protected function handleContactSharing($chatId, $contact)
    {
        // Ambil nomor HP dan bersihkan karakter non-digit
        $phoneNumber = preg_replace('/[^0-9]/', '', $contact['phone_number']);
        
        // Buang awalan '62' atau '0' untuk mendapatkan nomor inti (core number)
        $coreNumber = preg_replace('/^(62|0)/', '', $phoneNumber);

        // Jika nomor kurang dari 8 digit setelah dipotong (sangat tidak wajar), kita gunakan aslinya sebagai fallback
        if (strlen($coreNumber) < 8) {
            $coreNumber = $phoneNumber;
        }

        Log::info("Attempting to match phone: {$phoneNumber} (Core: {$coreNumber})");

        // Search in Users (Teachers/Staff)
        $user = User::where('phone', 'like', "%{$coreNumber}")->first();
        if ($user) {
            $user->update(['telegram_id' => $chatId]);
            $this->telegram->sendMessage($chatId, "✅ Berhasil! Akun Guru/Staff <b>{$user->name}</b> telah terhubung dengan Bot SALIRA.");
            return response()->json(['status' => 'ok']);
        }

        // Search in Students (Parents) - Matching by parent_phone
        $student = Student::where('parent_phone', 'like', "%{$coreNumber}")->first();
        if ($student) {
            $student->update(['parent_telegram_id' => $chatId]);
            $this->telegram->sendMessage($chatId, "✅ Berhasil! Anda telah terhubung sebagai Orang Tua dari <b>{$student->name}</b>. Anda akan menerima notifikasi otomatis dari sekolah.");
            return response()->json(['status' => 'ok']);
        }

        $this->telegram->sendMessage($chatId, "❌ Maaf, nomor HP Anda ({$phoneNumber}) belum terdaftar di sistem SALIRA.\n\nPastikan nomor di database Admin sudah benar dan tidak ada salah ketik (sedang mencocokkan: {$coreNumber}).");
        return response()->json(['status' => 'ok']);
    }
}
