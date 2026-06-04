<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    /**
     * Cache key untuk semua settings.
     * Cache di-invalidate otomatis saat setting diubah via set().
     */
    const CACHE_KEY = 'app_settings_all';
    const CACHE_TTL = 3600; // 1 jam

    /**
     * Ambil satu setting berdasarkan key.
     * Semua setting di-load sekaligus dalam satu query dan di-cache.
     * Query ke DB hanya terjadi 1x per jam, bukan setiap pemanggilan.
     */
    public static function get($key, $default = null)
    {
        $all = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return self::pluck('value', 'key')->toArray();
        });

        return $all[$key] ?? $default;
    }

    /**
     * Simpan setting dan invalidate cache agar perubahan langsung terlihat.
     */
    public static function set($key, $value)
    {
        $result = self::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget(self::CACHE_KEY);
        return $result;
    }

    /**
     * Ambil semua settings sekaligus (untuk halaman Pengaturan).
     */
    public static function all($columns = ['*'])
    {
        return Cache::remember(self::CACHE_KEY . '_collection', self::CACHE_TTL, function () {
            return parent::all();
        });
    }
}
