<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\PermissionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Enums\PermissionType;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $permissions = $request->user()->permissionRequests()->latest()->get();
        
        $types = [];
        foreach(PermissionType::cases() as $case) {
            $types[] = ['value' => $case->value, 'label' => $case->label()];
        }

        return Inertia::render('User/Permissions/Index', [
            'permissions' => $permissions,
            'types' => $types,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::enum(PermissionType::class)],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|max:1000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'task_description' => 'nullable|string|max:500',
            'task_file' => 'nullable|file|mimes:doc,docx,pdf,jpg,jpeg,png|max:5120',
        ]);

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('permissions', 'public');
        }

        $taskPath = null;
        if ($request->hasFile('task_file')) {
            $taskPath = $request->file('task_file')->store('permissions', 'public');
        }

        $request->user()->permissionRequests()->create([
            'type' => $validated['type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
            'attachment_path' => $path,
            'task_description' => $validated['task_description'] ?? null,
            'task_file_path' => $taskPath,
        ]);

        return back()->with('success', 'Permission request submitted successfully. Awaiting approval.');
    }

    public function destroy(Request $request, PermissionRequest $permission)
    {
        // Users can only delete their own pending requests
        if ($permission->user_id !== $request->user()->id || $permission->status->value !== 'pending') {
            abort(403, 'Unauthorized or request cannot be deleted.');
        }

        if ($permission->attachment_path) {
            Storage::disk('public')->delete($permission->attachment_path);
        }

        $permission->delete();

        return back()->with('success', 'Permission request cancelled.');
    }
}
