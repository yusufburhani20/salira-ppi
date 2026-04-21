<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = new \App\Services\TelegramService();
$testId = 'PUT_TEST_CHAT_ID_HERE'; // I should ask the user to provide a real ID or use a log

echo "Testing Telegram API...\n";
$result = $service->sendMessage($testId, "Test Message from Salira");

if ($result) {
    echo "Success!\n";
} else {
    echo "Failed! Check laravel.log\n";
}
