<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Enums\UserStatus;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->status !== UserStatus::active) {
            auth()->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $statusLabel = $request->user()->status->label();
            
            return redirect()->route('login')->with('error', "Your account is {$statusLabel}. Please contact administrator.");
        }

        return $next($request);
    }
}
