<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Inertia History Encryption
    |--------------------------------------------------------------------------
    |
    | History encryption is a security feature in Inertia.js 2.0+ that encrypts
    | the page data stored in the browser's history state.
    |
    | When enabled, page state is encrypted using the browser's Crypto API.
    | Calling Inertia::clearHistory() on logout rotates the encryption key,
    | making previously stored history states unreadable. If a user presses
    | the Back button after logging out, the browser cannot decrypt the old
    | state and is forced to perform a clean network request (which redirects
    | them to the login page).
    |
    */

    'history' => [
        'encrypt' => true,
    ],

];
