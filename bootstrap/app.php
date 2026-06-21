<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectUsersTo(fn () => \Illuminate\Support\Facades\Auth::guard('student')->check() 
            ? route('portal.dashboard') 
            : route('dashboard')
        );

        $middleware->redirectGuestsTo(fn () => request()->is('portal/*') || request()->is('portal')
            ? route('portal.login')
            : route('login')
        );

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\EnsureUserIsActive::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            '/webhook/telegram',
            '/webhook/midtrans',
            '/portal/attendance/scan',
            '/invoice/*/prepare-payment',
            '/public/computer-issues/report',
            'public/computer-issues/report',
            '/public/computer-issues/report*',
            'public/computer-issues/report*',
        ]);

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'no_back' => \App\Http\Middleware\PreventBackNavigation::class,
        ]);

        // Apply no-store cache headers to all authenticated routes
        // to prevent bfcache from caching pages after logout
        $middleware->appendToGroup('auth', [
            \App\Http\Middleware\PreventBackNavigation::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
