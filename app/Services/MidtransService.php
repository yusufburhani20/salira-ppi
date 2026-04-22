<?php

namespace App\Services;

use App\Models\Bill;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    protected $serverKey;
    protected $isProduction;
    protected $baseUrl;

    public function __construct()
    {
        $this->serverKey = env('MIDTRANS_SERVER_KEY');
        $this->isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        $this->baseUrl = $this->isProduction 
            ? 'https://app.midtrans.com/snap/v1/transactions' 
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    /**
     * Create snap token for a bill.
     */
    public function getSnapToken(Bill $bill)
    {
        // If already has snap token, return it
        if ($bill->snap_token) {
            return $bill->snap_token;
        }

        if (empty($this->serverKey)) {
            Log::warning('Midtrans Server Key is not set.');
            return null; // or throw exception
        }

        $student = $bill->student;

        // Payload for Midtrans
        $params = [
            'transaction_details' => [
                'order_id' => $bill->bill_number,
                'gross_amount' => (int) $bill->amount,
            ],
            'customer_details' => [
                'first_name' => $student->name,
                'email' => $student->parent_email ?? 'nomail@example.com',
                'phone' => $student->parent_phone ?? '08111111111',
            ],
            'item_details' => [
                [
                    'id' => 'SPP-' . $bill->month . '-' . $bill->year,
                    'price' => (int) $bill->amount,
                    'quantity' => 1,
                    'name' => $bill->title,
                ]
            ]
        ];

        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->post($this->baseUrl, $params);

            if ($response->successful()) {
                $snapToken = $response->json('token');
                $bill->update(['snap_token' => $snapToken]);
                return $snapToken;
            }

            Log::error('Midtrans API Error: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Midtrans API Exception: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Check transaction status directly to Midtrans API.
     */
    public function checkTransactionStatus(Bill $bill)
    {
        if (empty($this->serverKey)) {
            return false;
        }

        $apiUrl = $this->isProduction 
            ? "https://api.midtrans.com/v2/{$bill->bill_number}/status" 
            : "https://api.sandbox.midtrans.com/v2/{$bill->bill_number}/status";

        try {
            $response = Http::withBasicAuth($this->serverKey, '')->get($apiUrl);

            if ($response->successful()) {
                $payload = $response->json();
                $transactionStatus = $payload['transaction_status'] ?? null;
                $fraudStatus = $payload['fraud_status'] ?? null;

                if ($transactionStatus == 'capture') {
                    if ($fraudStatus == 'challenge') {
                        $bill->update(['status' => 'pending']);
                    } else if ($fraudStatus == 'accept') {
                        return 'paid';
                    }
                } else if ($transactionStatus == 'settlement') {
                    return 'paid';
                } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
                    $bill->update(['status' => 'expired']);
                    return 'expired';
                } else if ($transactionStatus == 'pending') {
                    $bill->update(['status' => 'pending']);
                    return 'pending';
                }
            }
        } catch (\Exception $e) {
            Log::error('Midtrans Status Check Exception: ' . $e->getMessage());
        }

        return false;
    }
}
