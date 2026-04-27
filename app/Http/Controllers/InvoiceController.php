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

        $midtransService = new MidtransService();

        // Ensure token exists and is valid if unpaid
        if ($bill->status !== 'paid') {
            if (!$bill->snap_token || ($bill->snap_token_expires_at && now()->gt($bill->snap_token_expires_at))) {
                $midtransService->regenerateSnapToken($bill);
                $bill->refresh();
            }
        }

        $isProduction    = env('MIDTRANS_IS_PRODUCTION', false);
        $snapTokenExpired = $bill->snap_token_expires_at && now()->gt($bill->snap_token_expires_at);

        // Calculate fee for display (even if already paid, show what was charged)
        $adminFeeData = $bill->admin_fee > 0
            ? ['amount' => (int) $bill->admin_fee, 'label' => Setting::get('midtrans_fee_label', 'Biaya Layanan Pembayaran')]
            : $midtransService->calculateAdminFee((int) $bill->amount);

        return Inertia::render('Invoice/Show', [
            'bill'             => $bill,
            'isProduction'     => $isProduction,
            'clientKey'        => env('MIDTRANS_CLIENT_KEY'),
            'snapTokenExpired' => $snapTokenExpired,
            'adminFee'         => $adminFeeData,
        ]);
    }


    public function regenerateToken($bill_number)
    {
        $bill = Bill::with('student')->where('bill_number', $bill_number)->firstOrFail();

        if ($bill->status === 'paid') {
            return response()->json(['error' => 'Tagihan sudah lunas.'], 422);
        }

        $midtransService = new MidtransService();
        $token = $midtransService->regenerateSnapToken($bill);

        if (!$token) {
            return response()->json(['error' => 'Gagal membuat token baru. Periksa konfigurasi Midtrans.'], 500);
        }

        return response()->json(['snap_token' => $token]);
    }

    public function downloadPdf($bill_number)
    {
        $bill = Bill::with('student.academicClasses')->where('bill_number', $bill_number)->firstOrFail();

        $midtransService = new MidtransService();
        $logoPath  = Setting::get('school_logo', null);
        $schoolName = Setting::get('school_name', 'SALIRA');

        $adminFeeData = $bill->admin_fee > 0
            ? ['amount' => (int) $bill->admin_fee, 'label' => Setting::get('midtrans_fee_label', 'Biaya Layanan Pembayaran')]
            : $midtransService->calculateAdminFee((int) $bill->amount);

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
