<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $events = Event::with('creator')
            ->withCount('attendances')
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Events/Index', [
            'events' => $events
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['is_active'] = true;

        Event::create($validated);

        return back()->with('success', 'Event baru berhasil dibuat.');
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'is_active' => 'required|boolean',
        ]);

        $event->update($validated);

        return back()->with('success', 'Event berhasil diperbarui.');
    }

    public function destroy(Event $event)
    {
        $event->delete();

        return back()->with('success', 'Event berhasil dihapus.');
    }

    public function attendances(Event $event)
    {
        $attendances = $event->attendances()
            ->with('user')
            ->latest()
            ->get()
            ->map(function ($att) {
                return [
                    'id' => $att->id,
                    'user_name' => $att->user->name ?? 'N/A',
                    'user_nip' => $att->user->nip ?? 'N/A',
                    'check_in_time' => $att->created_at->timezone('Asia/Jakarta')->format('d/m/Y H:i:s'),
                    'proof_url' => asset('storage/' . $att->proof_path),
                ];
            });

        return response()->json($attendances);
    }
}
