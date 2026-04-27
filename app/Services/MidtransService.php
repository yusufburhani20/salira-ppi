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
     * Calculate admin fee based on settings.
     * Returns ['amount' => int, 'label' => string] or null if no fee.
     */
    public function calculateAdminFee(int $billAmount): ?array
    {
        $feeType  = \App\Models\Setting::get('midtrans_fee_type', 'none');
        $feeValue = (float) \App\Models\Setting::get('midtrans_fee_value', 0);
        $feeLabel = \App\Models\Setting::get('midtrans_fee_label', 'Biaya Layanan Pembayaran');

        if ($feeType === 'none' || $feeValue <= 0) {
            return null;
        }

        if ($feeType === 'fixed') {
            return ['amount' => (int) $feeValue, 'label' => $feeLabel];
        }

        if ($feeType === 'percent') {
            return ['amount' => (int) round($billAmount * $feeValue / 100), 'label' => "{$feeLabel} ({$feeValue}%)"];
        }

        return null;
    }

    /**
     * Create snap token for a bill.
     */
    public function getSnapToken(Bill $bill)
    {
        // If already has snap token and not expired, return it
        if ($bill->snap_token && $bill->snap_token_expires_at && now()->lt($bill->snap_token_expires_at)) {
            return $bill->snap_token;
        }

        if (empty($this->serverKey)) {
            Log::warning('Midtrans Server Key is not set.');
            return null;
        }

        $student = $bill->student;
        $sppAmount = (int) $bill->amount;

        // Calculate admin fee
        $adminFee = $this->calculateAdminFee($sppAmount);
        $totalAmount = $sppAmount + ($adminFee ? $adminFee['amount'] : 0);

        // Build item_details
        $itemDetails = [
            [
                'id'       => 'SPP-' . $bill->month . '-' . $bill->year,
                'price'    => $sppAmount,
                'quantity' => 1,
                'name'     => $bill->title,
            ]
        ];

        if ($adminFee) {
            $itemDetails[] = [
                'id'       => 'ADMIN-FEE',
                'price'    => $adminFee['amount'],
                'quantity' => 1,
                'name'     => $adminFee['label'],
            ];
        }

        // Payload for Midtrans
        $params = [
            'transaction_details' => [
                'order_id'     => $bill->bill_number . '-' . time(),
                'gross_amount' => $totalAmount,
            ],
            'customer_details' => [
                'first_name' => $student->name,
                'email'      => $student->parent_email ?? 'nomail@example.com',
                'phone'      => $student->parent_phone ?? '08111111111',
            ],
            'item_details' => $itemDetails,
        ];

        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->post($this->baseUrl, $params);

            if ($response->successful()) {
                $snapToken = $response->json('token');
                $bill->update([
                    'snap_token'            => $snapToken,
                    'snap_token_expires_at' => now()->addHours(24),
                    'admin_fee'             => $adminFee ? $adminFee['amount'] : 0,
                ]);
                return $snapToken;
            }

            Log::error('Midtrans API Error: ' . $response->body());
        } catch (\Exception $e) {
            Log::error('Midtrans API Exception: ' . $e->getMessage());
        }

        return null;
    }


    public function regenerateSnapToken(Bill $bill): ?string
    {
        // Force clear old token so getSnapToken creates a new one
        $bill->update(['snap_token' => null, 'snap_token_expires_at' => null]);
        return $this->getSnapToken($bill);
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
