<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PermissionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Enums\PermissionStatus;

class ApprovalController extends Controller
{
    public function index()
    {
        // View all permissions with user details
        $permissions = PermissionRequest::with(['user', 'approvedBy'])
                        ->latest()
                        ->get();

        return Inertia::render('Admin/Approvals/Index', [
            'permissions' => $permissions
        ]);
    }

    public function update(Request $request, PermissionRequest $approval)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string|max:1000'
        ]);

        $approval->update([
            'status' => $request->status,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
        ]);

        return back()->with('success', 'Permission request has been ' . $request->status . '.');
    }
}
