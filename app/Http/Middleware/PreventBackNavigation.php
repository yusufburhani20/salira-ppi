<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * PreventBackNavigation Middleware
 *
 * Adds Cache-Control: no-store to all authenticated page responses.
 *
 * WHY THIS IS NEEDED FOR PWA:
 * Browsers use a "back-forward cache" (bfcache) that stores a complete
 * visual snapshot of pages for instant restoration when Back is pressed.
 * After logout, pressing Back shows this cached snapshot of authenticated
 * pages (e.g., dashboard, jurnal mengajar) INSTANTLY — before the server
 * even has a chance to respond with a redirect to login.
 *
 * Cache-Control: no-store is the ONLY reliable way to prevent bfcache storage.
 * When set, the browser MUST make a fresh network request on Back navigation,
 * which the server answers with a 302 redirect to /login — preventing any
 * flash of authenticated content.
 */
class PreventBackNavigation
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent bfcache: browser will not store this page for instant back navigation
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        return $response;
    }
}
