<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FinanceController extends Controller
{
    public function index()
    {
        // 1. Revenue by Month (Last 12 months)
        $revenueByMonth = Bill::where('status', 'paid')
            ->where('paid_at', '>=', Carbon::now()->subYear())
            ->select(
                DB::raw('DATE_FORMAT(paid_at, "%Y-%m") as month_year'),
                DB::raw('SUM(amount) as total')
            )
            ->groupBy('month_year')
            ->orderBy('month_year')
            ->get();

        // 2. Status Distribution (Volume)
        $statusDistribution = Bill::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // 3. Collection Ratio (Value)
        $collectionRatio = Bill::select('status', DB::raw('SUM(amount) as total_value'))
            ->groupBy('status')
            ->get();

        // 4. Revenue by Bill Title (Top 5)
        $revenueByType = Bill::where('status', 'paid')
            ->select('title', DB::raw('SUM(amount) as total'))
            ->groupBy('title')
            ->orderByDesc('total')
            ->take(5)
            ->get();

        // 5. KPIs
        $kpis = [
            'total_collected' => (float) Bill::where('status', 'paid')->sum('amount'),
            'total_outstanding' => (float) Bill::where('status', '!=', 'paid')->sum('amount'),
            'total_bills_count' => Bill::count(),
            'paid_bills_count' => Bill::where('status', 'paid')->count(),
        ];

        return Inertia::render('Admin/Finance/Index', [
            'revenueByMonth' => $revenueByMonth,
            'statusDistribution' => $statusDistribution,
            'collectionRatio' => $collectionRatio,
            'revenueByType' => $revenueByType,
            'kpis' => $kpis
        ]);
    }
}
