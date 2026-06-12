<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Attendance;
use App\Notifications\UserAttendanceReminder;
use Carbon\Carbon;

class SendUserAttendanceReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'salira:send-user-attendance-reminders {type}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim notifikasi otomatis pengingat absensi check-in/check-out ke Guru dan Pegawai.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $type = $this->argument('type');

        if (!in_array($type, ['check_in', 'check_out'])) {
            $this->error('Tipe pengingat harus "check_in" atau "check_out".');
            return 1;
        }

        // Jangan kirim notifikasi di hari Minggu (hari libur sekolah)
        if (Carbon::today()->isSunday()) {
            $this->info('Hari Minggu libur. Tidak ada pengingat absensi yang dikirim.');
            return 0;
        }

        $today = Carbon::today()->toDateString();
        $users = User::where('status', 'active')->get();
        $count = 0;

        foreach ($users as $user) {
            if ($type === 'check_in') {
                // Periksa apakah user belum melakukan check-in hari ini
                $hasCheckIn = Attendance::where('user_id', $user->id)
                    ->whereDate('date', $today)
                    ->whereNotNull('check_in')
                    ->exists();

                if (!$hasCheckIn) {
                    $user->notify(new UserAttendanceReminder('check_in'));
                    $count++;
                }
            } else {
                // Periksa apakah user sudah check-in hari ini, tapi belum check-out
                $attendance = Attendance::where('user_id', $user->id)
                    ->whereDate('date', $today)
                    ->first();

                if ($attendance && $attendance->check_in && !$attendance->check_out) {
                    $user->notify(new UserAttendanceReminder('check_out'));
                    $count++;
                }
            }
        }

        $this->info("Berhasil mengirim {$type} pengingat absensi ke {$count} pegawai.");
        return 0;
    }
}
