import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../hooks/useAuth';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';

// Main Tabs
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import AgendaScreen from '../screens/agenda/AgendaScreen';
import AssessmentScreen from '../screens/assessment/AssessmentScreen';
import CounselingScreen from '../screens/counseling/CounselingScreen';
import NotificationScreen from '../screens/notification/NotificationScreen';

// Stack screens (pushed from tabs)
import ProfileScreen from '../screens/profile/ProfileScreen';
import LeaveScreen from '../screens/leave/LeaveScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#2563eb',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    borderRadius: 24,
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopWidth: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                    marginTop: -4,
                    marginBottom: 4,
                },
                tabBarIcon: ({ color, size, focused }) => {
                    const icons: Record<string, { focused: any; outline: any }> = {
                        Beranda:    { focused: 'home',              outline: 'home-outline' },
                        Presensi:   { focused: 'finger-print',      outline: 'finger-print-outline' },
                        Jurnal:     { focused: 'book',              outline: 'book-outline' },
                        Penilaian:  { focused: 'clipboard',         outline: 'clipboard-outline' },
                        Bimbingan:  { focused: 'chatbubbles',       outline: 'chatbubbles-outline' },
                        Notifikasi: { focused: 'notifications',     outline: 'notifications-outline' },
                    };
                    const icon = icons[route.name];
                    return (
                        <View style={{
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: focused ? '#eff6ff' : 'transparent',
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            marginTop: 4
                        }}>
                            <Ionicons name={focused ? icon?.focused : icon?.outline} size={22} color={color} />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Beranda" component={DashboardScreen} />
            <Tab.Screen name="Presensi" component={AttendanceScreen} />
            <Tab.Screen name="Jurnal" component={AgendaScreen} />
            <Tab.Screen name="Penilaian" component={AssessmentScreen} />
            <Tab.Screen name="Bimbingan" component={CounselingScreen} />
            <Tab.Screen name="Notifikasi" component={NotificationScreen} />
        </Tab.Navigator>
    );
}

import AttendanceHistoryScreen from '../screens/attendance/AttendanceHistoryScreen';

function AuthenticatedStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Leave" component={LeaveScreen} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
        </Stack.Navigator>
    );
}

export default function Router() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <Stack.Screen name="Authenticated" component={AuthenticatedStack} />
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
