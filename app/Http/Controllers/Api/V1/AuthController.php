<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\StudentResource;
use App\Models\User;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string', // bisa email, NIS, atau NISN
            'password' => 'required|string',
        ]);

        $identifier = $request->identifier;
        $user = null;
        $isStudent = false;

        // Jika mengandung '@', asumsikan email (Pegawai/Guru)
        if (str_contains($identifier, '@')) {
            $user = User::where('email', $identifier)->first();
        } else {
            // Jika bukan email, asumsikan NISN (Siswa/Wali Murid)
            $user = Student::where('nisn', $identifier)->first();
            $isStudent = true;
        }

        // Validasi login
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['Kredensial yang diberikan tidak cocok dengan data kami.'],
            ]);
        }

        // Cek status aktif
        $status = $user->status->value ?? clone $user->status;
        if (strtolower($status) !== 'active') {
            throw ValidationException::withMessages([
                'identifier' => ['Akun Anda tidak aktif.'],
            ]);
        }

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $isStudent ? new StudentResource($user) : new UserResource($user)
        ]);
    }

    public function logout(Request $request)
    {
        // Menghapus token yang sedang digunakan saat request ini
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        if ($user instanceof Student) {
            $user->load(['academicClasses']); // Eager load relasi siswa
            return response()->json([
                'data' => new StudentResource($user)
            ]);
        }

        // Untuk User (Guru/Staff)
        $user->load(['roles', 'classTeacherContexts', 'programHeadContexts']);
        
        return response()->json([
            'data' => new UserResource($user)
        ]);
    }
}
