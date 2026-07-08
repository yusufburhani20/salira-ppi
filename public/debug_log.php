<?php
if (($_GET['key'] ?? '') !== 'salira123') {
    die('Unauthorized');
}
$logPath = dirname(__DIR__) . '/storage/logs/laravel.log';
if (file_exists($logPath)) {
    $content = file_get_contents($logPath);
    echo "<h3>Last 100 lines of laravel.log:</h3>";
    echo "<pre>" . htmlspecialchars(implode("\n", array_slice(explode("\n", $content), -100))) . "</pre>";
} else {
    echo "Log file not found at " . $logPath;
}
