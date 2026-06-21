import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// ─── PWA Back-Button Guard ────────────────────────────────────────────────────
// Problem: After logout (native form POST → full page reload to /login),
// pressing Back navigates through the old browser history stack. Inertia's
// popstate fires, trying to render pages like /jurnal-mengajar, causing
// "access denied" or error 500.
//
// Root-cause of previous fix failure:
// Reading auth from `data-page` DOM attribute only has the INITIAL server-rendered
// data (the login page). After Inertia SPA navigates (e.g. to dashboard), that
// attribute is NOT updated by Inertia. So our guard always saw auth.user = null
// and blocked ALL navigation to authenticated routes — causing error 500.
//
// Correct approach: Track auth state in a module-level variable, updated on
// every Inertia 'navigate' event. This always reflects the CURRENT page state.
// ─────────────────────────────────────────────────────────────────────────────

// Module-level variable — always reflects the current Inertia page's auth user.
// Initialized from the server-rendered page data (accurate at first load).
let currentAuthUser: unknown = null;

// Initialize from the initial server-rendered page data embedded in the DOM.
// At the very first page load (e.g. /login after logout), this is correct.
if (typeof window !== 'undefined') {
    try {
        const pageEl = document.getElementById('app');
        const initialPage = pageEl?.dataset?.page ? JSON.parse(pageEl.dataset.page) : null;
        currentAuthUser = initialPage?.props?.auth?.user ?? null;
    } catch {
        currentAuthUser = null;
    }

    // Secondary defense: reload bfcache snapshots
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            window.location.reload();
        }
    });
}

// Keep currentAuthUser in sync with Inertia's actual current page state.
// This fires on EVERY Inertia navigation — initial load, link clicks, popstate.
router.on('navigate', (event) => {
    currentAuthUser = (event.detail.page.props as any)?.auth?.user ?? null;
});

// ─── Auth-required URL detection ─────────────────────────────────────────────
const PUBLIC_OR_GUEST_PATHS = [
    '/login',
    '/portal/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/portal/attendance/scanner',
    '/portal/attendance/scan',
    '/',
];

function isAuthenticatedRoute(url: string): boolean {
    try {
        const path = new URL(url, window.location.origin).pathname;
        
        // Exclude static assets or direct file requests
        if (path.includes('.') || path.startsWith('/build/') || path.startsWith('/vendor/')) {
            return false;
        }

        // Check if the path matches or starts with reset-password token
        if (path.startsWith('/reset-password/')) {
            return false;
        }

        // Exclude public computer issues reporting path
        if (path.startsWith('/public/computer-issues/report')) {
            return false;
        }

        // Exclude public invoice paths
        if (path.startsWith('/invoice/')) {
            return false;
        }

        return !PUBLIC_OR_GUEST_PATHS.includes(path);
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

// Primary PWA back-button guard.
// Fires BEFORE Inertia renders anything for each navigation.
// Uses currentAuthUser (module variable kept in sync by 'navigate' event).
router.on('before', (event) => {
    const visit = event.detail.visit;
    const targetUrl = typeof visit.url === 'string'
        ? visit.url
        : (visit.url as URL | undefined)?.toString() ?? '';

    // Only block navigation to authenticated routes when the user is NOT logged in
    if (!isAuthenticatedRoute(targetUrl)) return;

    if (!currentAuthUser) {
        // Logged out → trying to go back to an authenticated page → block it
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
