<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\Setting;
use App\Services\MidtransService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function show($bill_number)
    {
        $bill = Bill::with('student')->where('bill_number', $bill_number)->firstOrFail();

        $isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        $midtransService = new MidtransService();

        // For display of payment methods with fees
        $paymentMethods = $midtransService->getPaymentMethodsWithFees((int) $bill->amount);

        // For already-paid bills: show what was charged
        $adminFeeData = null;
        if ($bill->status === 'paid' && $bill->admin_fee > 0) {
            $adminFeeData = [
                'amount' => (int) $bill->admin_fee,
                'label'  => Setting::get('midtrans_fee_label', 'Biaya Layanan Pembayaran'),
            ];
        }

        return Inertia::render('Invoice/Show', [
            'bill'           => $bill,
            'isProduction'   => $isProduction,
            'clientKey'      => env('MIDTRANS_CLIENT_KEY'),
            'paymentMethods' => $paymentMethods,
            'adminFee'       => $adminFeeData, // only for paid bills
        ]);
    }

    /**
     * Prepare a snap token for a specific payment method group.
     * Called when user selects a payment method on the invoice page.
     */
    public function preparePayment($bill_number, Request $request)
    {
        $request->validate([
            'method_group' => 'required|string|in:qris,gopay,shopeepay,bank_transfer,cstore',
        ]);

        $bill = Bill::with('student')->where('bill_number', $bill_number)->firstOrFail();

        if ($bill->status === 'paid') {
            return response()->json(['error' => 'Tagihan ini sudah lunas.'], 422);
        }

        $midtransService = new MidtransService();
        $result = $midtransService->getSnapTokenForMethod($bill, $request->method_group);

        if (!$result) {
            return response()->json(['error' => 'Gagal membuat sesi pembayaran. Periksa konfigurasi Midtrans.'], 500);
        }

        return response()->json($result);
    }

    public function downloadPdf($bill_number)
    {
        $bill = Bill::with('student.academicClasses')->where('bill_number', $bill_number)->firstOrFail();

        $midtransService = new MidtransService();
        $logoPath   = Setting::get('school_logo', null);
        $schoolName = Setting::get('school_name', 'SALIRA');

        $adminFeeData = $bill->admin_fee > 0
            ? ['amount' => (int) $bill->admin_fee, 'label' => Setting::get('midtrans_fee_label', 'Biaya Layanan Pembayaran')]
            : null;

        $pdf = Pdf::loadView('reports.invoice_pdf', [
            'bill'        => $bill,
            'logo'        => $logoPath,
            'school_name' => $schoolName,
            'admin_fee'   => $adminFeeData,
        ])->setPaper('a4', 'portrait');

        $filename = 'Invoice-' . $bill->bill_number . '.pdf';

        return $pdf->download($filename);
    }
}
