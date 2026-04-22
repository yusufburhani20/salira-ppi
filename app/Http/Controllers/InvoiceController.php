<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function show($bill_number)
    {
        $bill = Bill::with('student')->where('bill_number', $bill_number)->firstOrFail();

        // Ensure token exists if unpaid
        if ($bill->status !== 'paid' && !$bill->snap_token) {
            $midtransService = new MidtransService();
            $midtransService->getSnapToken($bill);
            $bill->refresh();
        }

        $isProduction = env('MIDTRANS_IS_PRODUCTION', false);

        return Inertia::render('Invoice/Show', [
            'bill' => $bill,
            'isProduction' => $isProduction,
            'clientKey' => env('MIDTRANS_CLIENT_KEY')
        ]);
    }
}
