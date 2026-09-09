import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useAttendance } from '../../hooks/useAttendance';
import { AttendanceData } from '../../types/attendance';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
    primary: '#006194',
    secondary: '#006c49',
    tertiary: '#825100',
    surface: '#faf8ff',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f2f3ff',
    onSurface: '#131b2e',
    onSurfaceVariant: '#3f4850',
    outline: '#707881',
    error: '#ba1a1a',
};

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'hadir': return colors.secondary;
        case 'terlambat': return '#f59e0b';
        case 'izin': return colors.primary;
        case 'sakit': return colors.tertiary;
        case 'alpha': return colors.error;
        default: return colors.outline;
    }
};

export default function AttendanceHistoryScreen({ navigation }: any) {
    const { history, isLoading, isRefreshing, isFetchingMore, fetchInitialData, refreshData, loadMore } = useAttendance();

    useEffect(() => {
        fetchInitialData();
    }, []);

    const renderItem = ({ item }: { item: AttendanceData }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.dateText}>{item.date}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                {item.photo_url ? (
                    <Image source={{ uri: process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') + '/storage/' + item.photo_url }} style={styles.photo} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <MaterialIcons name="image-not-supported" size={24} color={colors.outline} />
                    </View>
                )}
                
                <View style={styles.details}>
                    <View style={styles.timeRow}>
                        <View style={styles.timeBox}>
                            <MaterialIcons name="login" size={14} color={colors.secondary} />
                            <Text style={styles.timeLabel}>Masuk</Text>
                            <Text style={styles.timeValue}>{item.check_in || '--:--'}</Text>
                        </View>
                        <View style={styles.timeBox}>
                            <MaterialIcons name="logout" size={14} color={colors.tertiary} />
                            <Text style={styles.timeLabel}>Pulang</Text>
                            <Text style={styles.timeValue}>{item.check_out || '--:--'}</Text>
                        </View>
                    </View>

                    {(item.latitude && item.longitude) && (
                        <View style={styles.locationRow}>
                            <MaterialIcons name="location-on" size={14} color={colors.primary} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Riwayat Absensi</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading && !isRefreshing && history.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={refreshData} colors={[colors.primary]} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color={colors.primary} style={{ margin: 16 }} /> : null}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Belum ada riwayat absensi.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.surfaceContainerLowest,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceContainerLow,
    },
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceContainerLow,
    },
    dateText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 99,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardBody: {
        flexDirection: 'row',
        gap: 12,
    },
    photo: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: colors.surfaceContainerLow,
    },
    photoPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 8,
        backgroundColor: colors.surfaceContainerLow,
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    timeRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    timeBox: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 10,
        color: colors.onSurfaceVariant,
        marginTop: 2,
    },
    timeValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.surfaceContainerLow,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    locationText: {
        fontSize: 10,
        color: colors.onSurfaceVariant,
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        color: colors.outline,
        marginTop: 32,
    },
});
