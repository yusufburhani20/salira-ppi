import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import api from '../services/api';

// expo-notifications & expo-device are native-only — skip on web
const isWeb = Platform.OS === 'web';

export const usePushNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<any>(false);

    useEffect(() => {
        if (isWeb) return; // Push notifications not supported on web

        // Lazy-load native modules only on native platforms
        const setup = async () => {
            try {
                const Constants = (await import('expo-constants')).default;
                
                // Expo Go SDK 53+ crashes completely when expo-notifications is imported on Android
                if (Constants.appOwnership === 'expo') {
                    console.log('Skipping expo-notifications in Expo Go (not supported).');
                    return () => {};
                }

                const Device = await import('expo-device');
                const Notifications = await import('expo-notifications');

                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: true,
                    }),
                });

                const token = await registerForPushNotificationsAsync(Notifications, Device, Constants);
                if (token) setExpoPushToken(token);

                const sub1 = Notifications.addNotificationReceivedListener(n => setNotification(n));
                const sub2 = Notifications.addNotificationResponseReceivedListener(r => console.log(r));

                return () => {
                    Notifications.removeNotificationSubscription(sub1);
                    Notifications.removeNotificationSubscription(sub2);
                };
            } catch (error) {
                console.log('Push notifications not available in this environment.', error);
                return () => {};
            }
        };

        let cleanup: (() => void) | undefined;
        setup().then(fn => { cleanup = fn; });
        return () => { cleanup?.(); };
    }, []);

    // Function to manually submit the token to the server
    const submitPushToken = async (token: string) => {
        if (isWeb) return;
        try {
            await api.post('/device-token', {
                token: token,
                device_type: Platform.OS
            });
            console.log('Push token successfully registered with server');
        } catch (error) {
            console.error('Failed to register push token with server', error);
        }
    };

    return {
        expoPushToken,
        notification,
        submitPushToken
    };
};

async function registerForPushNotificationsAsync(Notifications: any, Device: any, Constants: any) {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;

        try {
            const tokenResponse = await Notifications.getExpoPushTokenAsync({
                projectId: projectId || 'dummy-project-id',
            });
            token = tokenResponse.data;
        } catch (e) {
            console.log('Could not get push token', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
