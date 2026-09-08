import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Platform, Alert, Modal } from 'react-native';
import { useAttendance } from '../../hooks/useAttendance';
import { AttendanceData } from '../../types/attendance';
import { useAuth } from '../../hooks/useAuth';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function AttendanceScreen({ navigation }: any) {
    const { 
        todayStatus, 
        history, 
        isLoading, 
        isRefreshing, 
        isFetchingMore, 
        error, 
        fetchInitialData, 
        refreshData, 
        loadMore,
        submitCheckIn
    } = useAttendance();
    
    const { user } = useAuth();
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const cameraRef = useRef<any>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleStartCheckIn = async () => {
        if (Platform.OS !== 'web') {
            if (!cameraPermission?.granted) {
                const perm = await requestCameraPermission();
                if (!perm.granted) {
                    Alert.alert("Izin Ditolak", "Izin kamera diperlukan untuk presensi.");
                    return;
                }
            }
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Izin Ditolak", "Izin lokasi diperlukan untuk verifikasi check-in.");
                return;
            }
            setShowCamera(true);
        } else {
            // For web, bypass camera for now if not supported or just submit
            handleCheckInSubmit();
        }
    };

    const handleCheckInSubmit = async () => {
        setIsCheckingIn(true);
        try {
            let locationData = {};
            if (Platform.OS !== 'web') {
                let location = await Location.getCurrentPositionAsync({});
                locationData = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };
            }
            // If camera is used, we could take a picture here:
            // if (cameraRef.current) { await cameraRef.current.takePictureAsync(); }

            await submitCheckIn(locationData);
            setShowCamera(false);
            if (Platform.OS !== 'web') {
                Alert.alert("Berhasil", "Check-In berhasil.");
            } else {
                alert("Check-In berhasil.");
            }
        } catch (err: any) {
            const errMsg = err?.response?.data?.message || 'Gagal melakukan check-in.';
            if (Platform.OS !== 'web') {
                Alert.alert("Gagal", errMsg);
            } else {
                alert("Gagal: " + errMsg);
            }
        } finally {
            setIsCheckingIn(false);
        }
    };

    const renderTodayStatus = () => {
        if (isLoading && !isRefreshing) return <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 20 }} />;
        
        return (
            <View style={styles.todayCard}>
                <Text style={styles.todayTitle}>Status Hari Ini</Text>
                {todayStatus ? (
                    <View style={styles.statusRow}>
                        <View style={styles.statusBox}>
                            <Text style={styles.statusLabel}>Check In</Text>
                            <Text style={styles.statusValue}>{todayStatus.check_in || '-'}</Text>
                        </View>
                        <View style={styles.statusBox}>
                            <Text style={styles.statusLabel}>Status</Text>
                            <Text style={[styles.statusValue, { color: todayStatus.status === 'hadir' ? '#10b981' : '#f59e0b' }]}>
                                {todayStatus.status.toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.statusBox}>
                            <Text style={styles.statusLabel}>Check Out</Text>
                            <Text style={styles.statusValue}>{todayStatus.check_out || '-'}</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.checkInContainer}>
                        <Text style={styles.noStatusText}>Anda belum melakukan check-in hari ini.</Text>
                        {Platform.OS === 'web' ? (
                            <TouchableOpacity
                                style={[styles.checkInBtn, isCheckingIn && { opacity: 0.6 }]}
                                onPress={handleStartCheckIn}
                                disabled={isCheckingIn}
                            >
                                {isCheckingIn ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkInBtnText}>Check-In Sekarang</Text>}
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                style={[styles.checkInBtn, isCheckingIn && { opacity: 0.6 }]} 
                                onPress={handleStartCheckIn}
                                disabled={isCheckingIn}
                            >
                                {isCheckingIn ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkInBtnText}>Check-In Sekarang</Text>}
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        );
    };

    const renderHistoryItem = ({ item }: { item: AttendanceData }) => (
        <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={[styles.historyStatus, { color: item.status === 'hadir' ? '#10b981' : '#f59e0b' }]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>
            <View style={styles.historyBody}>
                <Text style={styles.historyTime}>Masuk: {item.check_in || '-'}</Text>
                <Text style={styles.historyTime}>Pulang: {item.check_out || '-'}</Text>
            </View>
        </View>
    );

    const renderEmpty = () => {
        if (isLoading) return null;
        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={refreshData}>
                        <Text style={styles.retryText}>Coba Lagi</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return <Text style={styles.emptyText}>Tidak ada riwayat presensi.</Text>;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {navigation.canGoBack() && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={styles.headerTitle}>Presensi {user?.roles?.includes('Guru') ? 'Pegawai' : 'Siswa'}</Text>
                <View style={{ width: 60 }} />
            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderHistoryItem}
                ListHeaderComponent={() => (
                    <View>
                        {renderTodayStatus()}
                        <Text style={styles.sectionTitle}>Riwayat Presensi</Text>
                    </View>
                )}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={refreshData} colors={['#2563eb']} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color="#2563eb" style={{ padding: 16 }} /> : null}
            />

            <Modal visible={showCamera} animationType="slide" transparent={false}>
                <View style={styles.cameraContainer}>
                    <View style={styles.cameraHeader}>
                        <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.cameraCloseBtn}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.cameraTitle}>Presensi Wajah</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    
                    {showCamera && (
                        <View style={{ flex: 1 }}>
                            <CameraView 
                                ref={cameraRef}
                                style={styles.camera} 
                                facing="front"
                            />
                            {/* Overlay diletakkan di luar CameraView (bersifat absolute positioning) */}
                            <View style={[StyleSheet.absoluteFill, styles.cameraOverlayWrapper]}>
                                <View style={styles.cameraOverlay}>
                                    <View style={styles.cameraBox} />
                                    <Text style={styles.cameraInstruction}>Posisikan wajah Anda di dalam kotak</Text>
                                </View>
                                <View style={styles.cameraControls}>
                                    <TouchableOpacity 
                                        style={[styles.captureBtn, isCheckingIn && { opacity: 0.5 }]} 
                                        onPress={handleCheckInSubmit}
                                        disabled={isCheckingIn}
                                    >
                                        {isCheckingIn ? (
                                            <ActivityIndicator color="#2563eb" size="large" />
                                        ) : (
                                            <Ionicons name="camera" size={36} color="#2563eb" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        backgroundColor: '#2563eb',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: { padding: 4 },
    listContainer: {
        padding: 16,
    },
    todayCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    todayTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusBox: {
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    noStatusText: {
        color: '#6b7280',
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 12,
    },
    historyCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb',
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    historyDate: {
        fontWeight: 'bold',
        color: '#1f2937',
    },
    historyStatus: {
        fontWeight: 'bold',
    },
    historyBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    historyTime: {
        color: '#6b7280',
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 24,
    },
    errorContainer: {
        alignItems: 'center',
        marginTop: 24,
    },
    errorText: {
        color: '#ef4444',
        marginBottom: 12,
        textAlign: 'center',
    },
    retryBtn: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    checkInContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    checkInBtn: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 12,
        width: '100%',
        alignItems: 'center',
    },
    checkInBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingHorizontal: 20, paddingBottom: 10, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
    cameraCloseBtn: { padding: 8 },
    cameraTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    camera: { flex: 1 },
    cameraOverlayWrapper: { zIndex: 10, elevation: 10 },
    cameraOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    cameraBox: { width: 250, height: 250, borderWidth: 2, borderColor: '#fff', borderRadius: 12, backgroundColor: 'transparent', marginBottom: 20 },
    cameraInstruction: { color: '#fff', fontSize: 14, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    cameraControls: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
    captureBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' },
});
