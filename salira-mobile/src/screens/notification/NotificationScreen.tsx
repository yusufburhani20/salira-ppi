import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Platform, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../../services/api/notification';
import { AppNotification } from '../../types';

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = useCallback(async () => {
        try {
            const data = await notificationService.getAll();
            setNotifications(data.data);
            setUnreadCount(data.unread_count);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadNotifications(); }, []);

    const handleMarkRead = async (id: string) => {
        await notificationService.markAsRead(id);
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(c => Math.max(0, c - 1));
    };

    const handleMarkAll = async () => {
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        setUnreadCount(0);
    };

    const renderItem = ({ item }: { item: AppNotification }) => (
        <TouchableOpacity
            style={[styles.notifCard, !item.read_at && styles.unread]}
            onPress={() => !item.read_at && handleMarkRead(item.id)}
        >
            <View style={[styles.dot, item.read_at ? styles.dotRead : styles.dotUnread]} />
            <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.notifTime}>
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifikasi</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={handleMarkAll}>
                        <Text style={styles.markAllText}>Tandai semua dibaca</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotifications(); }} colors={['#2563eb']} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="notifications-off-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Belum ada notifikasi</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: {
        backgroundColor: '#2563eb',
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    markAllText: { color: '#bfdbfe', fontSize: 13 },
    list: { padding: 16 },
    notifCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    unread: { borderLeftWidth: 3, borderLeftColor: '#2563eb' },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 10 },
    dotUnread: { backgroundColor: '#2563eb' },
    dotRead: { backgroundColor: '#d1d5db' },
    notifContent: { flex: 1 },
    notifTitle: { fontSize: 14, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
    notifBody: { fontSize: 13, color: '#6b7280', marginBottom: 6, lineHeight: 18 },
    notifTime: { fontSize: 11, color: '#9ca3af' },
    empty: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#9ca3af', marginTop: 12, fontSize: 14 },
});
