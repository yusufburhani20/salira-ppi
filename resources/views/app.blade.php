<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <link rel="icon" href="{{ \App\Models\Setting::get('school_favicon') ? \Illuminate\Support\Facades\Storage::url(\App\Models\Setting::get('school_favicon')) : asset('favicon.ico') }}" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- PWA Meta & manifest -->
        <meta name="theme-color" content="#4f46e5">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/images/icon-192.png">

        <!-- Registrasi Service Worker PWA -->
        <script>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                        .then(reg => console.log('Service Worker PWA berhasil didaftarkan:', reg.scope))
                        .catch(err => console.log('Pendaftaran Service Worker PWA gagal:', err));
                });
            }
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
