import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
        './resources/js/**/*.ts',
    ],

    safelist: [
        '-translate-x-full',
        'translate-x-0',
        'opacity-0',
        'opacity-100',
        'invisible',
        'visible',
        'pointer-events-none',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: '#4f46e5',
                'primary-hover': '#4338ca',
                // Primary
                indigo: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    500: '#6366f1', // Primary Core
                    600: '#4f46e5',
                    900: '#312e81',
                },
                violet: {
                    500: '#8b5cf6', // Primary Accent
                    600: '#7c3aed',
                },
                // Background Colors
                slate: {
                    50: '#f8fafc',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                // Semantic Colors
                emerald: {
                    500: '#10b981', // Success
                    600: '#059669',
                },
                amber: {
                    500: '#f59e0b', // Warning
                    600: '#d97706',
                },
                red: {
                    500: '#ef4444', // Danger
                    600: '#dc2626',
                }
            },
        },
    },

    plugins: [forms],
};
