<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Permission as LeavePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $query = LeavePermission::where('user_id', Auth::id());

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $leaves = $query->latest()->paginate(20);

        return response()->json([
            'data' => $leaves->map(fn($l) => $this->formatLeave($l)),
            'meta' => [
                'current_page' => $leaves->currentPage(),
                'last_page'    => $leaves->lastPage(),
                'total'        => $leaves->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'        => 'required|string|in:izin,sakit,dinas_luar,cuti',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'reason'      => 'required|string|max:1000',
        ]);

        $leave = LeavePermission::create(array_merge($validated, [
            'user_id' => Auth::id(),
            'status'  => 'pending',
        ]));

        return response()->json([
            'message' => 'Perizinan berhasil diajukan',
            'data'    => $this->formatLeave($leave),
        ], 201);
    }

    public function destroy($id)
    {
        $leave = LeavePermission::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->findOrFail($id);
        $leave->delete();
        return response()->json(['message' => 'Perizinan berhasil dibatalkan']);
    }

    private function formatLeave(LeavePermission $l): array
    {
        return [
            'id'         => $l->id,
            'type'       => $l->type,
            'start_date' => $l->start_date,
            'end_date'   => $l->end_date,
            'reason'     => $l->reason,
            'status'     => $l->status,
            'created_at' => $l->created_at?->toDateString(),
        ];
    }
}
