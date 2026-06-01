import { usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

/**
 * LogoutButton performs a REAL HTML form POST (non-Inertia) for logout.
 *
 * Why: Inertia's <Link method="post"> uses AJAX fetch under the hood,
 * which keeps the SPA alive and the browser's history stack intact.
 * When the user presses the Android Back button after logout, the browser
 * navigates back through its native history entries (e.g. /dashboard, /agendas)
 * and Inertia re-renders those pages from its internal cache.
 *
 * A real form POST triggers a full HTTP redirect cycle, which:
 *  1. Destroys the entire Inertia SPA state in memory.
 *  2. Forces the browser to start a fresh page load at the redirect target.
 *  3. Effectively makes the login page the new "root" of the browser history,
 *     so Back on the login page closes/minimizes the PWA instead of going back.
 */
export default function LogoutButton({
    action,
    className = '',
    children,
}: PropsWithChildren<{ action: string; className?: string }>) {
    const { props } = usePage();
    // Ziggy's csrf_token is available via the page props shared by HandleInertiaRequests
    const csrfToken = (props as any).csrf_token as string;

    const handleLogout = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = action;

        // CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken || (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
        form.appendChild(csrfInput);

        // Method spoofing not needed — POST is correct for logout
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            className={className}
        >
            {children}
        </button>
    );
}
