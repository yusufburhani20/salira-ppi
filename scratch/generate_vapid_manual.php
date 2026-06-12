<?php

$config = array(
    "config" => __DIR__ . '/openssl.cnf',
    "private_key_bits" => 2048,
    "private_key_type" => OPENSSL_KEYTYPE_EC,
    "curve_name" => "prime256v1",
);

$res = openssl_pkey_new($config);
if (!$res) {
    die("Failed to generate key.\n");
}

$details = openssl_pkey_get_details($res);
if (!isset($details['ec'])) {
    die("Not an EC key.\n");
}

$x = $details['ec']['x'];
$y = $details['ec']['y'];
$d = $details['ec']['d'];

// VAPID public key is 0x04 + x + y (65 bytes)
$publicKeyBinary = "\x04" . $x . $y;
$privateKeyBinary = $d;

// Base64URL helper
function base64url_encode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

$publicKeyBase64 = base64url_encode($publicKeyBinary);
$privateKeyBase64 = base64url_encode($privateKeyBinary);

echo "--- GENERATED VAPID KEYS (MANUAL) ---\n";
echo "VAPID_PUBLIC_KEY=" . $publicKeyBase64 . "\n";
echo "VAPID_PRIVATE_KEY=" . $privateKeyBase64 . "\n";
echo "Public Key Length: " . strlen(base64_decode(str_replace(['-', '_'], ['+', '/'], $publicKeyBase64))) . " bytes\n";
echo "Private Key Length: " . strlen(base64_decode(str_replace(['-', '_'], ['+', '/'], $privateKeyBase64))) . " bytes\n";
echo "-------------------------------------\n";
