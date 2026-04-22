<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use App\Models\Student;

class StudentAuthController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('Portal/Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'nisn' => 'required|string',
            'password' => 'required|string',
        ]);

        $student = Student::where('nisn', $request->nisn)->first();

        if ($student) {
            // First time login fallback: If password is not set, we check against birth_date or '123456'
            if (empty($student->password)) {
                $defaultPassword = $student->birth_date ? $student->birth_date->format('dmY') : '123456';
                if ($request->password === $defaultPassword) {
                    $student->password = Hash::make($defaultPassword);
                    $student->save();
                    Auth::guard('student')->login($student);
                    $request->session()->regenerate();
                    return redirect()->intended(route('portal.dashboard'));
                }
            } else {
                if (Auth::guard('student')->attempt(['nisn' => $request->nisn, 'password' => $request->password], $request->boolean('remember'))) {
                    $request->session()->regenerate();
                    return redirect()->intended(route('portal.dashboard'));
                }
            }
        }

        return back()->withErrors([
            'nisn' => 'Kredensial NISN atau password yang Anda masukkan salah.',
        ])->onlyInput('nisn');
    }

    public function destroy(Request $request)
    {
        Auth::guard('student')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/portal/login');
    }
}
