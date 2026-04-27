<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Notifications\BillPaidNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->all();
        Log::info('Midtrans Webhook Received: ', $payload);

        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;

        if (!$orderId) {
            return response()->json(['status' => 'ignore']);
        }

        // order_id dari Midtrans formatnya: INV-YYYYMM-XXXXXX-1714207452
        // Kita perlu membuang suffix timestamp (bagian terakhir setelah dash ke-3)
        $parts = explode('-', $orderId);
        if (count($parts) >= 3) {
            $baseBillNumber = $parts[0] . '-' . $parts[1] . '-' . $parts[2];
        } else {
            $baseBillNumber = $orderId;
        }

        $bill = Bill::where('bill_number', $baseBillNumber)->first();
        if (!$bill) {
            Log::warning('Midtrans Webhook: Bill not found for order_id ' . $orderId);
            return response()->json(['status' => 'not_found']);
        }

        // Basic verification (in production, verify signature key)
        $serverKey = env('MIDTRANS_SERVER_KEY');
        if (!empty($serverKey)) {
            $signatureKey = hash('sha512', $orderId . $payload['status_code'] . $payload['gross_amount'] . $serverKey);
            if ($signatureKey !== $payload['signature_key']) {
                Log::error('Midtrans Webhook: Invalid Signature Key');
                return response()->json(['status' => 'unauthorized'], 401);
            }
        }

        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                $bill->update(['status' => 'pending']);
            } else if ($fraudStatus == 'accept') {
                $this->markAsPaid($bill, $payload);
            }
        } else if ($transactionStatus == 'settlement') {
            $this->markAsPaid($bill, $payload);
        } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
            $bill->update(['status' => 'expired']);
        } else if ($transactionStatus == 'pending') {
            $bill->update(['status' => 'pending']);
        }

        return response()->json(['status' => 'ok']);
    }

    protected function markAsPaid(Bill $bill, array $payload = [])
    {
        if ($bill->status !== 'paid') {
            $paymentMethod = $payload['payment_type'] ?? null;

            $bill->update([
                'status'         => 'paid',
                'paid_at'        => now(),
                'payment_method' => $paymentMethod,
            ]);

            // Notify via Telegram & Email
            $bill->student->notify(new BillPaidNotification($bill));
        }
    }
}
