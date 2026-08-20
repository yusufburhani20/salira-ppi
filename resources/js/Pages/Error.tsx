import { Head, Link } from '@inertiajs/react';

export default function Error({ status }: { status: number }) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
    }[status] || 'Error';

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
    }[status] || 'An unexpected error occurred.';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title={title} />
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                        {title}
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        {description}
                    </p>
                </div>
                <div className="mt-5">
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
