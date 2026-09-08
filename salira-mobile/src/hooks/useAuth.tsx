import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { User, AuthResponse } from '../types';
import api from '../services/api';
import { usePushNotifications } from './usePushNotifications';

// Cross-platform storage: SecureStore on native, localStorage on web
const storage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        const SecureStore = await import('expo-secure-store');
        return SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        const SecureStore = await import('expo-secure-store');
        return SecureStore.setItemAsync(key, value);
    },
    deleteItem: async (key: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
            return;
        }
        const SecureStore = await import('expo-secure-store');
        return SecureStore.deleteItemAsync(key);
    },
};

interface AuthContextData {
    user: User | null;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { expoPushToken, submitPushToken } = usePushNotifications();

    useEffect(() => {
        loadStorageData();

        // Setup Axios Interceptor for 401
        const interceptor = api.interceptors.response.use(
            response => response,
            async (error) => {
                if (error.response?.status === 401 && !error.config?.url?.endsWith('/logout') && !error.config?.url?.endsWith('/login')) {
                    await logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, []);

    const loadStorageData = async () => {
        try {
            const token = await storage.getItem('userToken');
            if (token) {
                // Verify token by fetching me
                const response = await api.get('/me');
                setUser(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load user info', error);
            await storage.deleteItem('userToken');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (identifier: string, password: string) => {
        const response = await api.post<AuthResponse>('/login', { identifier, password });
        const { access_token, user: userData } = response.data;

        await storage.setItem('userToken', access_token);
        setUser(userData);
        
        // After setting user, if we have an expo push token, send it to backend
        if (expoPushToken) {
            // We set a small timeout to let the token be applied to interceptor
            setTimeout(() => {
                submitPushToken(expoPushToken);
            }, 500);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            // ignore if already invalid
        }
        await storage.deleteItem('userToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
