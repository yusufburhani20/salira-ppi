import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// ─── PWA Back-Button Guard ────────────────────────────────────────────────────
// Problem: After logout (native form POST → full page reload to /login),
// pressing the Android Back button navigates through the browser's history stack.
// Old Inertia history entries (dashboard, jurnal-mengajar, etc.) are still there.
// Inertia's popstate handler fires, renders those pages, and the user sees
// an "access denied" screen or a flash of authenticated content before login.
//
// Primary fix: router.on('before') intercepts ALL navigations including popstate.
// If the target URL is an authenticated route and auth.user is null (logged out),
// we cancel the Inertia navigation and do window.location.replace() to login.
// This fires BEFORE Inertia renders anything — zero flicker.
//
// Secondary fix: pageshow handler for bfcache snapshots.
if (typeof window !== 'undefined') {
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            window.location.reload();
        }
    });
}

// ─── Auth-required URL detection ─────────────────────────────────────────────
const AUTHENTICATED_PREFIXES = [
    '/dashboard',
    '/profile',
    '/admin',
    '/guru',
    '/user',
    '/jurnal',
    '/agenda',
    '/attendance',
    '/report',
    '/notification',
    '/schedule',
    '/academic',
    '/student',
    '/class',
    '/subject',
    '/score',
    '/assessment',
    '/permission',
    '/telegram',
    '/bill',
    '/invoice',
    '/portal/dashboard',
    '/portal/bills',
    '/portal/attendance',
    '/portal/scores',
    '/portal/id-card',
    '/portal/profile',
    '/portal/report',
    '/portal/permissions',
    '/portal/notifications',
];

function isAuthenticatedRoute(url: string): boolean {
    try {
        const path = new URL(url, window.location.origin).pathname;
        return AUTHENTICATED_PREFIXES.some((prefix) => path.startsWith(prefix));
    } catch {
        return false;
    }
}

function getLoginUrlForRoute(url: string): string {
    try {
        const path = new URL(url, window.location.origin).pathname;
        return path.startsWith('/portal') ? '/portal/login' : '/login';
    } catch {
        return '/login';
    }
}

// Primary PWA back-button guard: intercept BEFORE Inertia renders anything.
// Reads the current auth state from the Inertia page data embedded in the DOM.
// When the current page is the login page (auth.user === null) and the user
// tries to navigate back to an authenticated URL, we block it immediately.
router.on('before', (event) => {
    const visit = event.detail.visit;
    const targetUrl = typeof visit.url === 'string'
        ? visit.url
        : (visit.url as URL | undefined)?.toString() ?? '';

    if (!isAuthenticatedRoute(targetUrl)) return; // Public page — allow

    // Read current auth state from the Inertia page data in the DOM
    const pageEl = document.getElementById('app');
    let authUser = null;
    try {
        const pageData = pageEl?.dataset?.page ? JSON.parse(pageEl.dataset.page) : null;
        authUser = pageData?.props?.auth?.user ?? null;
    } catch {
        // If parse fails, treat as not authenticated (safe default)
        authUser = null;
    }

    if (!authUser) {
        // No user → navigating to auth route while logged out → block + redirect
        event.preventDefault();
        window.location.replace(getLoginUrlForRoute(targetUrl));
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <App {...props} />
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
