<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserStatus;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->latest()->get();
        $roles = Role::pluck('name');
        
        $statuses = [];
        foreach(UserStatus::cases() as $case) {
            $statuses[] = ['value' => $case->value, 'label' => $case->label()];
        }

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'statuses' => $statuses,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'nip' => 'nullable|string|max:50',
            'status' => ['required', Rule::enum(UserStatus::class)],
            'roles' => 'nullable|array',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'nip' => $request->nip,
            'password' => Hash::make('password'),
            'status' => $request->status,
        ]);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        return back()->with('success', 'User created successfully with default password "password".');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'nip' => 'nullable|string|max:50',
            'status' => ['required', Rule::enum(UserStatus::class)],
            'roles' => 'nullable|array',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'nip' => $request->nip,
            'status' => $request->status,
        ]);

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }
        
        if ($request->reset_password_default) {
            $user->update(['password' => Hash::make('password')]);
        } elseif ($request->reset_password_email) {
            \Illuminate\Support\Facades\Password::broker()->sendResetLink(
                ['email' => $user->email]
            );
        }

        $msg = 'User updated successfully.';
        if ($request->reset_password_default) $msg .= ' Password reset to default.';
        if ($request->reset_password_email) $msg .= ' Password reset link sent to email.';

        return back()->with('success', $msg);
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return back()->with('error', 'You cannot delete yourself.');
        }

        $user->delete();
        return back()->with('success', 'User deleted successfully.');
    }
}
