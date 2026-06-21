<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * ImageCompressionService
 *
 * Provides GD-based image compression and storage.
 * Falls back to raw store if GD is unavailable.
 */
class ImageCompressionService
{
    /**
     * Compress and store an image, maintaining aspect ratio (no crop).
     * Max width/height = $maxDim px.
     *
     * @param  UploadedFile|string $file    Uploaded file or local path string
     * @param  string              $directory Storage subdirectory (e.g. 'evening_studies')
     * @param  int                 $maxDim  Max width or height in pixels
     * @param  int                 $quality JPEG/WebP quality (1-100)
     * @return string              Storage path relative to disk root
     */
    public static function compressAndStore($file, string $directory, int $maxDim = 1200, int $quality = 80): string
    {
        $isUpload = $file instanceof UploadedFile;
        $rawPath  = $isUpload ? $file->getRealPath() : $file;

        if (!function_exists('imagecreatefromstring') || !file_exists($rawPath)) {
            // GD not available — store as-is
            return $isUpload
                ? $file->store($directory, 'public')
                : self::storeRaw($rawPath, $directory);
        }

        $content  = file_get_contents($rawPath);
        $src      = @imagecreatefromstring($content);

        if (!$src) {
            return $isUpload
                ? $file->store($directory, 'public')
                : self::storeRaw($rawPath, $directory);
        }

        [$origW, $origH] = [imagesx($src), imagesy($src)];

        // Calculate new dimensions maintaining aspect ratio
        if ($origW <= $maxDim && $origH <= $maxDim) {
            $newW = $origW;
            $newH = $origH;
        } elseif ($origW >= $origH) {
            $newW = $maxDim;
            $newH = (int) round($origH * ($maxDim / $origW));
        } else {
            $newH = $maxDim;
            $newW = (int) round($origW * ($maxDim / $origH));
        }

        $dst = imagecreatetruecolor($newW, $newH);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

        $storedPath = self::saveImage($dst, $directory, $quality);

        imagedestroy($src);
        imagedestroy($dst);

        return $storedPath;
    }

    /**
     * Compress, center-crop to square, and store an image.
     * Useful for profile photos / avatars.
     *
     * @param  UploadedFile|string $file
     * @param  string              $directory
     * @param  int                 $size    Target square size in pixels
     * @param  int                 $quality JPEG/WebP quality
     * @return string
     */
    public static function compressAndStoreCropped($file, string $directory, int $size = 400, int $quality = 80): string
    {
        $isUpload = $file instanceof UploadedFile;
        $rawPath  = $isUpload ? $file->getRealPath() : $file;

        if (!function_exists('imagecreatefromstring') || !file_exists($rawPath)) {
            return $isUpload
                ? $file->store($directory, 'public')
                : self::storeRaw($rawPath, $directory);
        }

        $content = file_get_contents($rawPath);
        $src     = @imagecreatefromstring($content);

        if (!$src) {
            return $isUpload
                ? $file->store($directory, 'public')
                : self::storeRaw($rawPath, $directory);
        }

        [$w, $h] = [imagesx($src), imagesy($src)];

        $minDim = min($w, $h);
        $cropX  = (int) (($w - $minDim) / 2);
        $cropY  = (int) (($h - $minDim) / 2);

        $dst = imagecreatetruecolor($size, $size);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagecopyresampled($dst, $src, 0, 0, $cropX, $cropY, $size, $size, $minDim, $minDim);

        $storedPath = self::saveImage($dst, $directory, $quality);

        imagedestroy($src);
        imagedestroy($dst);

        return $storedPath;
    }

    /**
     * Save a GD image resource to storage (WebP preferred, falls back to JPEG).
     */
    private static function saveImage($gd, string $directory, int $quality): string
    {
        $tempPath = tempnam(sys_get_temp_dir(), 'img_compress_');
        $useWebP  = function_exists('imagewebp');

        $ext      = $useWebP ? 'webp' : 'jpg';
        $filename = uniqid('img_') . '.' . $ext;
        $success  = false;

        if ($useWebP) {
            $success = imagewebp($gd, $tempPath, $quality);
        }
        if (!$success) {
            $success = imagejpeg($gd, $tempPath, $quality);
            $ext     = 'jpg';
            $filename = uniqid('img_') . '.jpg';
        }

        if ($success && file_exists($tempPath)) {
            $storedPath = $directory . '/' . $filename;
            Storage::disk('public')->put($storedPath, file_get_contents($tempPath));
            @unlink($tempPath);
            return $storedPath;
        }

        // Fallback — return a dummy path if everything fails
        return $directory . '/fallback_' . uniqid() . '.jpg';
    }

    /**
     * Store a raw file (string path) without compression.
     */
    private static function storeRaw(string $filePath, string $directory): string
    {
        $ext      = pathinfo($filePath, PATHINFO_EXTENSION) ?: 'jpg';
        $filename = uniqid('raw_') . '.' . $ext;
        $stored   = $directory . '/' . $filename;
        Storage::disk('public')->put($stored, file_get_contents($filePath));
        return $stored;
    }
}
