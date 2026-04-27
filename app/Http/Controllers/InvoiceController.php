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

    public function downloadPdf($bill_number)
    {
        $bill = Bill::with('student.academicClasses')->where('bill_number', $bill_number)->firstOrFail();

        $logoPath = Setting::get('school_logo', null);
        $schoolName = Setting::get('school_name', 'SALIRA');

        $pdf = Pdf::loadView('reports.invoice_pdf', [
            'bill'        => $bill,
            'logo'        => $logoPath,
            'school_name' => $schoolName,
        ])->setPaper('a4', 'portrait');

        $filename = 'Invoice-' . $bill->bill_number . '.pdf';

        return $pdf->download($filename);
    }
}
