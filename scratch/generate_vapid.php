<?php

require __DIR__ . '/../vendor/autoload.php';

use Minishlink\WebPush\VAPID;

try {
    $keys = VAPID::createVapidKeys();
    
    echo "--- GENERATED VAPID KEYS ---\n";
    echo "VAPID_PUBLIC_KEY=" . $keys['publicKey'] . "\n";
    echo "VAPID_PRIVATE_KEY=" . $keys['privateKey'] . "\n";
    echo "----------------------------\n";
    
} catch (\Exception $e) {
    echo "Error generating keys: " . $e->getMessage() . "\n";
}
