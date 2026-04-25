<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\PermissionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentPermissionController extends Controller
{
    public function index()
    {
        $student = Auth::guard('student')->user();
        $permissions = PermissionRequest::where('student_id', $student->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('Portal/Permissions/Index', [
            'permissions' => $permissions
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:izin,sakit,cuti',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string|min:10',
            'attachment' => 'nullable|image|max:2048', // Max 2MB
        ]);

        $student = Auth::guard('student')->user();

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('permissions/students', 'public');
        }

        $permission = PermissionRequest::create([
            'student_id' => $student->id,
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'attachment_path' => $attachmentPath,
            'status' => 'pending',
        ]);

        // Send Notification to Admins and Pimpinan
        try {
            $admins = \App\Models\User::role(['Super Admin', 'Admin', 'Pimpinan'])->get();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\NewPermissionRequest($permission));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gagal mengirim notif izin siswa: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Permohonan izin berhasil dikirim.');
    }

    public function destroy(PermissionRequest $permission)
    {
        $student = Auth::guard('student')->user();

        if ($permission->student_id !== $student->id) {
            abort(403);
        }

        if ($permission->status !== 'pending') {
            return redirect()->back()->with('error', 'Permohonan yang sudah diproses tidak dapat dihapus.');
        }

        if ($permission->attachment_path) {
            Storage::disk('public')->delete($permission->attachment_path);
        }

        $permission->delete();

        return redirect()->back()->with('success', 'Permohonan izin berhasil dihapus.');
    }
}
