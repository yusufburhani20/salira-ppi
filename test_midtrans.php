<?php
require __DIR__ . "/vendor/autoload.php";
$app = require_once __DIR__ . "/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = new App\Services\MidtransService();
$bill = App\Models\Bill::first();

// Dump payload before sending
$methodGroup = 'cstore';
$student = $bill->student;
$method = App\Services\MidtransService::PAYMENT_METHODS[$methodGroup];

$sppAmount = (int) $bill->amount;
$fee = $service->calculateFeeForMethod($methodGroup, $sppAmount);
$feeAmount = $fee ? $fee['amount'] : 0;
$total = $sppAmount + $feeAmount;

$itemDetails = [
    [
        'id'       => 'SPP-' . $bill->month . '-' . $bill->year,
        'price'    => $sppAmount,
        'quantity' => 1,
        'name'     => $bill->title,
    ]
];

if ($feeAmount > 0) {
    $itemDetails[] = [
        'id'       => 'ADMIN-FEE',
        'price'    => $feeAmount,
        'quantity' => 1,
        'name'     => $fee['label'],
    ];
}

$params = [
    'transaction_details' => [
        'order_id'     => $bill->bill_number . '-' . time(),
        'gross_amount' => $total,
    ],
    'customer_details' => [
        'first_name' => substr($student->name, 0, 50),
        'email'      => $student->parent_email ?? 'nomail@example.com',
        'phone'      => $student->parent_phone ?? '08111111111',
    ],
    'item_details'      => $itemDetails,
    'enabled_payments'  => $method['enabled_payments'],
    'shopeepay' => [
        'callback_url' => route('invoice.show', $bill->bill_number),
    ],
    'gopay' => [
        'enable_callback' => true,
        'callback_url' => route('invoice.show', $bill->bill_number),
    ],
];

dump("Params:", $params);

// Send to Midtrans to see the exact response
$baseUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
$serverKey = env('MIDTRANS_SERVER_KEY');
$response = Illuminate\Support\Facades\Http::withBasicAuth($serverKey, '')->post($baseUrl, $params);

dump("Status:", $response->status());
dump("Body:", $response->json());
