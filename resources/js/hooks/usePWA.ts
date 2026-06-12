import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Helper function to convert VAPID Base64URL key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function usePWA(vapidPublicKey?: string) {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState<boolean>(false);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(true);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
        typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
    );

    // 1. Connection status monitoring
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // 2. Custom PWA Install prompt interceptor
    useEffect(() => {
        const handleBeforeInstall = (e: any) => {
            // Prevent browser standard install banner
            e.preventDefault();
            // Stash the event so we can trigger it later
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstallable(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    // 3. Check current push subscription status on mount/worker ready
    const checkSubscription = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setSubscriptionLoading(false);
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            setIsSubscribed(!!subscription);
            setPermissionStatus(Notification.permission);
        } catch (error) {
            console.error('[PWA usePWA] Error checking push subscription:', error);
        } finally {
            setSubscriptionLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    // Install app function
    const installApp = useCallback(async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA usePWA] User response to install prompt: ${outcome}`);
        
        // Reset deferred prompt
        setDeferredPrompt(null);
        setIsInstallable(false);
    }, [deferredPrompt]);

    // Subscribe user to Web Push
    const subscribeUser = useCallback(async () => {
        if (!vapidPublicKey) {
            console.warn('[PWA usePWA] Cannot subscribe, missing VAPID public key');
            return false;
        }

        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert('Push notification tidak didukung di perangkat/browser ini.');
            return false;
        }

        setSubscriptionLoading(true);
        try {
            // Request permission
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);

            if (permission !== 'granted') {
                alert('Izin notifikasi ditolak. Aktifkan izin notifikasi di pengaturan browser Anda.');
                setSubscriptionLoading(false);
                return false;
            }

            const registration = await navigator.serviceWorker.ready;
            
            // Subscribe options
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            };

            const subscription = await registration.pushManager.subscribe(subscribeOptions);
            
            // Send to Laravel backend
            const subscriptionJson = subscription.toJSON();
            await axios.post('/api/push-subscriptions', {
                endpoint: subscriptionJson.endpoint,
                keys: {
                    p256dh: subscriptionJson.keys?.p256dh,
                    auth: subscriptionJson.keys?.auth
                }
            });

            setIsSubscribed(true);
            return true;
        } catch (error) {
            console.error('[PWA usePWA] Subscription failed:', error);
            alert('Gagal mengaktifkan push notifikasi.');
            return false;
        } finally {
            setSubscriptionLoading(false);
        }
    }, [vapidPublicKey]);

    // Unsubscribe user from Web Push
    const unsubscribeUser = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return false;
        }

        setSubscriptionLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                const endpoint = subscription.endpoint;
                
                // Cancel on browser push service
                await subscription.unsubscribe();

                // Call backend API to delete from DB
                await axios.post('/api/push-subscriptions/unsubscribe', {
                    endpoint: endpoint
                });
            }

            setIsSubscribed(false);
            return true;
        } catch (error) {
            console.error('[PWA usePWA] Unsubscription failed:', error);
            alert('Gagal mematikan push notifikasi.');
            return false;
        } finally {
            setSubscriptionLoading(false);
        }
    }, []);

    return {
        isOnline,
        isInstallable,
        installApp,
        isSubscribed,
        subscriptionLoading,
        permissionStatus,
        subscribe: subscribeUser,
        unsubscribe: unsubscribeUser,
        checkSubscription
    };
}
