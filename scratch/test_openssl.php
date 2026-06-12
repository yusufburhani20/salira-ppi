<?php

$config = array(
    "config" => __DIR__ . '/openssl.cnf',
    "private_key_bits" => 2048,
    "private_key_type" => OPENSSL_KEYTYPE_EC,
    "curve_name" => "prime256v1",
);

$res = openssl_pkey_new($config);
if (!$res) {
    echo "Failed to generate key.\n";
    while ($msg = openssl_error_string()) {
        echo "Error: " . $msg . "\n";
    }
} else {
    echo "Successfully generated key!\n";
}
