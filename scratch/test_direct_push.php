<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PushSubscription;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

$subscriptions = PushSubscription::all();

echo "--- DIRECT PUSH TEST ---\n";
echo "Found " . $subscriptions->count() . " active subscription(s) in database.\n\n";

if ($subscriptions->isEmpty()) {
    echo "No subscriptions found in the database. Please register a device first.\n";
    exit;
}

$publicKey = config('services.webpush.vapid_public_key');
$privateKey = config('services.webpush.vapid_private_key');

echo "VAPID Public Key: " . ($publicKey ? substr($publicKey, 0, 15) . "..." : "NULL") . "\n";
echo "VAPID Private Key: " . ($privateKey ? substr($privateKey, 0, 15) . "..." : "NULL") . "\n";

if (!$publicKey || !$privateKey) {
    echo "ERROR: VAPID keys are missing from config!\n";
    exit;
}

$auth = [
    'VAPID' => [
        'subject' => 'mailto:admin@salira.com',
        'publicKey' => $publicKey,
        'privateKey' => $privateKey,
    ],
];

try {
    $webPush = new WebPush($auth);
    
    $payload = json_encode([
        'title' => 'Uji Coba Langsung SALIRA',
        'body' => 'Ini adalah notifikasi uji coba langsung tanpa melalui antrean Laravel pada jam ' . date('H:i:s'),
        'action_url' => '/dashboard',
        'icon' => '/images/icon-192.png',
        'badge' => '/favicon.ico',
    ]);

    foreach ($subscriptions as $index => $sub) {
        echo "Sending to Subscriber #" . ($index + 1) . ":\n";
        echo "- Subscribable Type: " . $sub->subscribable_type . "\n";
        echo "- Subscribable ID: " . $sub->subscribable_id . "\n";
        echo "- Endpoint: " . substr($sub->endpoint, 0, 50) . "...\n";
        
        $webPushSubscription = Subscription::create([
            'endpoint' => $sub->endpoint,
            'publicKey' => $sub->p256dh,
            'authToken' => $sub->auth,
        ]);

        $webPush->queueNotification($webPushSubscription, $payload);
    }

    echo "\nFlushing notifications...\n";
    $reports = $webPush->flush();
    
    $successCount = 0;
    foreach ($reports as $index => $report) {
        echo "Report #" . ($index + 1) . ":\n";
        if ($report->isSuccess()) {
            echo "✅ SUCCESS: Notification sent successfully to " . $report->getEndpoint() . "\n";
            $successCount++;
        } else {
            echo "❌ FAILED: " . $report->getReason() . "\n";
            echo "- Endpoint: " . $report->getEndpoint() . "\n";
            echo "- Is expired/gone: " . ($report->isSubscriptionExpired() ? "YES" : "NO") . "\n";
        }
        echo "----------------------------------------\n";
    }

    echo "\nSummary: Sent $successCount of " . count($reports) . " successfully.\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
