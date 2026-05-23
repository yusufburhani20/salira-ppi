<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Rename 'Guru/Dosen' to 'Guru'
        $guruDosenRole = Role::where('name', 'Guru/Dosen')->first();
        if ($guruDosenRole) {
            $guruDosenRole->update(['name' => 'Guru']);
        } else {
            Role::firstOrCreate(['name' => 'Guru']);
        }

        // 2. Rename 'Pimpinan' to 'Kepala Sekolah'
        $pimpinanRole = Role::where('name', 'Pimpinan')->first();
        if ($pimpinanRole) {
            $pimpinanRole->update(['name' => 'Kepala Sekolah']);
        } else {
            Role::firstOrCreate(['name' => 'Kepala Sekolah']);
        }

        // 3. Delete 'Admin' role
        $adminRole = Role::where('name', 'Admin')->first();
        if ($adminRole) {
            $adminRole->delete(); // This will automatically cascade and detach from model_has_roles
        }

        // Clear Spatie permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Revert 'Guru' to 'Guru/Dosen'
        $guruRole = Role::where('name', 'Guru')->first();
        if ($guruRole) {
            $guruRole->update(['name' => 'Guru/Dosen']);
        }

        // 2. Revert 'Kepala Sekolah' to 'Pimpinan'
        $kepalaSekolahRole = Role::where('name', 'Kepala Sekolah')->first();
        if ($kepalaSekolahRole) {
            $kepalaSekolahRole->update(['name' => 'Pimpinan']);
        }

        // 3. Re-create 'Admin' role
        Role::firstOrCreate(['name' => 'Admin']);

        // Clear Spatie permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
