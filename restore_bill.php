<?php
require __DIR__ . "/vendor/autoload.php";
$app = require_once __DIR__ . "/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$bill = App\Models\Bill::where('bill_number', 'INV-202604-000012')->first();

if (!$bill) {
    echo "Bill tidak ditemukan!\n";
    exit(1);
}

echo "Status sebelum: " . $bill->status . "\n";

$bill->update([
    'status'  => 'paid',
    'paid_at' => $bill->paid_at ?? now(),
]);

echo "Status sekarang: " . $bill->fresh()->status . "\n";
echo "Berhasil dipulihkan ke PAID!\n";
