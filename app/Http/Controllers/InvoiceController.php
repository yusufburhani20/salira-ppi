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

        // For display of payment methods with fees (only needed when not paid)
        $paymentMethods = $bill->status !== 'paid'
            ? $midtransService->getPaymentMethodsWithFees((int) $bill->amount)
            : null;

        // Map payment_type from Midtrans to a readable method label
        $methodLabels = [
            'gopay'        => 'GoPay',
            'shopeepay'    => 'ShopeePay',
            'qris'         => 'QRIS',
            'bank_transfer'=> 'Transfer Bank (Virtual Account)',
            'bca_va'       => 'Transfer BCA Virtual Account',
            'bni_va'       => 'Transfer BNI Virtual Account',
            'bri_va'       => 'Transfer BRI Virtual Account',
            'mandiri_bill' => 'Transfer Mandiri',
            'permata_va'   => 'Transfer Permata Virtual Account',
            'echannel'     => 'Mandiri Bill Payment',
            'other_va'     => 'Virtual Account Lainnya',
            'cstore'       => 'Gerai (Alfamart/Indomaret)',
            'alfamart'     => 'Alfamart',
            'indomaret'    => 'Indomaret',
            'credit_card'  => 'Kartu Kredit',
        ];

        // For already-paid bills: show what was charged
        $adminFeeData = null;
        if ($bill->admin_fee > 0) {
            $methodKey   = $bill->payment_method ?? null;
            $methodLabel = $methodKey ? ($methodLabels[$methodKey] ?? ucwords(str_replace('_', ' ', $methodKey))) : 'Pembayaran Digital';
            $adminFeeData = [
                'amount' => (int) $bill->admin_fee,
                'label'  => 'Biaya Layanan ' . $methodLabel,
            ];
        }

        return Inertia::render('Invoice/Show', [
            'bill'           => $bill,
            'isProduction'   => $isProduction,
            'clientKey'      => env('MIDTRANS_CLIENT_KEY'),
            'paymentMethods' => $paymentMethods,
            'adminFee'       => $adminFeeData,
            'methodLabels'   => $methodLabels,
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

        $logoPath   = Setting::get('school_logo', null);
        $schoolName = Setting::get('school_name', 'SALIRA');

        $methodLabels = [
            'gopay'        => 'GoPay',
            'shopeepay'    => 'ShopeePay',
            'qris'         => 'QRIS',
            'bank_transfer'=> 'Transfer Bank (Virtual Account)',
            'bca_va'       => 'Transfer BCA Virtual Account',
            'bni_va'       => 'Transfer BNI Virtual Account',
            'bri_va'       => 'Transfer BRI Virtual Account',
            'mandiri_bill' => 'Transfer Mandiri',
            'permata_va'   => 'Transfer Permata Virtual Account',
            'echannel'     => 'Mandiri Bill Payment',
            'other_va'     => 'Virtual Account Lainnya',
            'cstore'       => 'Gerai (Alfamart/Indomaret)',
            'alfamart'     => 'Alfamart',
            'indomaret'    => 'Indomaret',
            'credit_card'  => 'Kartu Kredit',
            'manual'       => 'Tunai (Cash)',
        ];

        $adminFeeData = null;
        if ($bill->admin_fee > 0) {
            $methodKey   = $bill->payment_method ?? null;
            $methodLabel = $methodKey ? ($methodLabels[$methodKey] ?? ucwords(str_replace('_', ' ', $methodKey))) : 'Pembayaran Digital';
            $adminFeeData = [
                'amount' => (int) $bill->admin_fee,
                'label'  => 'Biaya Layanan ' . $methodLabel,
            ];
        }

        $pdf = Pdf::loadView('reports.invoice_pdf', [
            'bill'         => $bill,
            'logo'         => $logoPath,
            'school_name'  => $schoolName,
            'admin_fee'    => $adminFeeData,
            'method_labels'=> $methodLabels,
        ])->setPaper('a4', 'portrait');

        $filename = 'Invoice-' . $bill->bill_number . '.pdf';

        return $pdf->stream($filename);
    }
}
