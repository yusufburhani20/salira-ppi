<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserStatus;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Array roles
        $roles = [
            'Super Admin',
            'Pimpinan',
            'Admin',
            'Guru/Dosen',
            'Staff/TU'
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // Create Super Admin User
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@salira.com'],
            [
                'name' => 'System Administrator',
                'nip' => '000000',
                'password' => Hash::make('password'),
                'status' => UserStatus::active->value,
                'email_verified_at' => now(),
            ]
        );
        
        $superAdmin->assignRole('Super Admin');

        // Create Demo Pimpinan
        $pimpinan = User::firstOrCreate(
            ['email' => 'pimpinan@salira.com'],
            [
                'name' => 'Bapak Pimpinan',
                'nip' => '111111',
                'password' => Hash::make('password'),
                'status' => UserStatus::active->value,
                'email_verified_at' => now(),
            ]
        );
        $pimpinan->assignRole('Pimpinan');

        // Create Demo Guru
        $guru = User::firstOrCreate(
            ['email' => 'guru@salira.com'],
            [
                'name' => 'Bapak Guru',
                'nip' => '222222',
                'password' => Hash::make('password'),
                'status' => UserStatus::active->value,
                'email_verified_at' => now(),
            ]
        );
        $guru->assignRole('Guru/Dosen');
    }
}
