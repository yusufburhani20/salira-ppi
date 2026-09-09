import React, { useEffect, useState, useRef } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, RefreshControl, 
    ActivityIndicator, TouchableOpacity, Platform, Alert, 
    Dimensions, ImageBackground, StatusBar, Modal, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const colors = {
    primary: '#006194',
    primaryDark: '#004a73',
    surface: '#faf8ff',
    surfaceContainerLowest: '#ffffff',
    onSurface: '#131b2e',
    onSurfaceVariant: '#3f4850',
    outline: '#707881',
    success: '#006c49',
    error: '#ba1a1a',
    textDark: '#131b2e',
};

type ViewState = 'DASHBOARD' | 'CAMERA' | 'PREVIEW';

export default function AttendanceScreen({ navigation }: any) {
    const { user } = useAuth();
    const { 
        todayStatus, 
        history,
        isLoading, 
        isRefreshing, 
        fetchInitialData, 
        refreshData, 
        submitCheckIn
    } = useAttendance();

    // UI States
    const [view, setView] = useState<ViewState>('DASHBOARD');
    const [showGpsModal, setShowGpsModal] = useState(false);
    
    // Camera & Location States
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [locationPerm, setLocationPerm] = useState<Location.PermissionStatus | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
    const [takingPhoto, setTakingPhoto] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cameraRef = useRef<any>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const getInitials = (name?: string) => {
        if (!name) return 'S';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleRecordTimePress = () => {
        setShowGpsModal(true);
    };

    const confirmGpsAndOpenCamera = async () => {
        setShowGpsModal(false);
        
        if (Platform.OS !== 'web') {
            // Request Camera
            if (!cameraPermission?.granted) {
                const { granted } = await requestCameraPermission();
                if (!granted) {
                    Alert.alert("Izin Ditolak", "Kamera dibutuhkan untuk absensi.");
                    return;
                }
            }

            // Request Location
            let { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPerm(status);
            if (status !== 'granted') {
                Alert.alert("Izin Ditolak", "Lokasi (GPS) wajib diaktifkan.");
                return;
            }

            // Show loading or just transition
            setView('CAMERA');
            
            // Fetch location quietly while camera opens
            try {
                let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                setLocation(loc);
            } catch (e) {
                console.log("Failed to get location immediately", e);
            }
        } else {
            setView('CAMERA');
        }
    };

    const handleRefineLocation = async () => {
        try {
            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            setLocation(loc);
        } catch (e) {
            console.log("Failed to refine location", e);
        }
    };

    const handleTakePhoto = async () => {
        if (!cameraReady || !cameraRef.current) return;
        setTakingPhoto(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
            if (photo && photo.uri) {
                setCapturedPhotoUri(photo.uri);
                setView('PREVIEW');
            }
        } catch (e) {
            Alert.alert("Error", "Gagal mengambil foto");
        } finally {
            setTakingPhoto(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            let locationData: { latitude?: number; longitude?: number; photoUri?: string } = {};
            if (Platform.OS !== 'web') {
                if (!location) {
                    let loc = await Location.getCurrentPositionAsync({});
                    setLocation(loc);
                    locationData.latitude = loc.coords.latitude;
                    locationData.longitude = loc.coords.longitude;
                } else {
                    locationData.latitude = location.coords.latitude;
                    locationData.longitude = location.coords.longitude;
                }
                locationData.photoUri = capturedPhotoUri || undefined;
            }

            await submitCheckIn(locationData);
            setCapturedPhotoUri(null);
            setView('DASHBOARD');
            fetchInitialData();
            
            if (Platform.OS !== 'web') {
                Alert.alert("Berhasil", "Presensi berhasil disimpan.");
            } else {
                alert("Presensi berhasil dikirim.");
            }
        } catch (err: any) {
            const errMsg = err?.response?.data?.message || 'Gagal mengirim presensi.';
            if (Platform.OS !== 'web') {
                Alert.alert("Gagal", errMsg);
            } else {
                alert("Gagal: " + errMsg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDashboard = () => {
        const isCheckInCompleted = !!todayStatus?.check_in;
        const isCheckOutCompleted = !!todayStatus?.check_out;
        const isActionDisabled = isCheckInCompleted && isCheckOutCompleted;

        // Mock date string "Today (Wed, 09 Sep 2026)"
        const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

        return (
            <View style={styles.dashboardContainer}>
                <SafeAreaView style={styles.headerSafe}>
                    <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
                    <View style={styles.header}>
                        {navigation.canGoBack() && (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
                                <MaterialIcons name="arrow-back-ios-new" size={22} color={colors.onSurface} />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.companyName}>Presensi Kehadiran</Text>
                        <View style={{ flex: 1 }} />
                    </View>
                </SafeAreaView>

                <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshData} colors={[colors.primary]} />}>
                    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                        {/* Top Context & Quick Stats Banner */}
                        <LinearGradient
                            colors={[colors.primary, colors.primaryDark]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.banner}
                        >
                            <View style={styles.bannerHeader}>
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <MaterialIcons name="assignment-ind" size={16} color={colors.surface} />
                                        <Text style={styles.bannerSub}>GURU & PEGAWAI</Text>
                                    </View>
                                    <Text style={styles.bannerTitle}>Kehadiran Anda</Text>
                                    <Text style={styles.bannerDesc}>Pantau log kehadiran dan status secara real-time.</Text>
                                </View>
                            </View>
                            
                            <View style={styles.statsRow}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statBoxLabel}>Total Presensi</Text>
                                    <Text style={styles.statBoxVal}>{history.length}</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statBoxLabel}>Terlambat</Text>
                                    <Text style={[styles.statBoxVal, { color: '#ffb95f' }]}>0</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statBoxLabel}>Lembur</Text>
                                    <Text style={[styles.statBoxVal, { color: '#6ffbbe' }]}>0</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Main Attendance Card */}
                    <View style={[styles.card, { marginTop: 8 }]}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.shiftDateLabel}>Hari Ini ({todayStr})</Text>
                                <Text style={styles.shiftName}>Jadwal Presensi Masuk & Pulang</Text>
                            </View>
                            <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
                        </View>

                        <View style={styles.timeRow}>
                            <View style={styles.timeCol}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <View style={styles.smallAvatar}><MaterialIcons name="login" size={16} color={colors.primary} /></View>
                                    <View>
                                        <Text style={styles.timeLabel}>Absen Masuk</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Text style={[styles.timeVal, isCheckInCompleted ? { color: colors.success } : {}]}>
                                                {todayStatus?.check_in || '--:--'}
                                            </Text>
                                            {isCheckInCompleted && <MaterialIcons name="verified" size={16} color={colors.success} />}
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.timeDivider} />
                            <View style={styles.timeCol}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <View style={styles.smallAvatar}><MaterialIcons name="logout" size={16} color={colors.error} /></View>
                                    <View>
                                        <Text style={styles.timeLabel}>Absen Pulang</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Text style={[styles.timeVal, isCheckOutCompleted ? { color: colors.success } : { color: colors.error }]}>
                                                {todayStatus?.check_out || '--:--'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[styles.recordBtn, isActionDisabled && { opacity: 0.5, backgroundColor: colors.outline }]} 
                            onPress={handleRecordTimePress}
                            disabled={isActionDisabled}
                        >
                            <Text style={styles.recordBtnTxt}>Ambil Presensi Kamera</Text>
                        </TouchableOpacity>

                        {/* Recent History */}
                        <View style={styles.historySection}>
                            {history.slice(0, 4).map((item) => {
                                const dateObj = new Date(item.date);
                                const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
                                
                                return (
                                    <View key={item.id} style={styles.historyItem}>
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={styles.historyDate}>{dateStr}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 }}>
                                                {item.check_in && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                        <MaterialIcons name="login" size={14} color={colors.primary} />
                                                        <Text style={styles.historyTime}>{item.check_in}</Text>
                                                    </View>
                                                )}
                                                {item.check_out && (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                        <MaterialIcons name="logout" size={14} color={colors.error} />
                                                        <Text style={styles.historyTime}>{item.check_out}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        <Text style={styles.historyStatus}>Terkirim</Text>
                                        <MaterialIcons name="check-circle" size={20} color={colors.success} />
                                    </View>
                                );
                            })}
                        </View>

                        <TouchableOpacity style={styles.viewMoreBtn} onPress={() => navigation.navigate('AttendanceHistory')}>
                            <Text style={styles.viewMoreTxt}>View History & Photos</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* GPS Validation Modal */}
                <Modal visible={showGpsModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>Confirm</Text>
                            <Text style={styles.modalDesc}>Please activate GPS</Text>
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowGpsModal(false)}>
                                    <Text style={styles.modalCancelTxt}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalOkBtn} onPress={confirmGpsAndOpenCamera}>
                                    <Text style={styles.modalOkTxt}>OK</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    const renderCamera = () => {
        return (
            <SafeAreaView style={styles.cameraContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <View style={styles.camHeader}>
                    <TouchableOpacity style={styles.camBackBtn} onPress={() => setView('DASHBOARD')}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.camTitle}>Salira<Text style={{ fontWeight: 'normal', fontSize: 12 }}>HR</Text></Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: '#fff', fontSize: 12 }}>Cam 1</Text>
                        <MaterialIcons name="cameraswitch" size={20} color="#fff" />
                    </View>
                </View>
                
                <View style={styles.cameraWrapper}>
                    <CameraView 
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill} 
                        facing="front"
                        onCameraReady={() => setCameraReady(true)}
                    />
                    
                    {/* Portrait Outline Mock */}
                    <View style={styles.portraitOutline}>
                        <View style={styles.headSilhouette} />
                        <View style={styles.shoulderSilhouette} />
                    </View>
                </View>

                <View style={styles.camFooter}>
                    <MaterialCommunityIcons name="flash-off" size={24} color="#fff" />
                    <TouchableOpacity style={styles.shutterRing} onPress={handleTakePhoto} disabled={takingPhoto}>
                        {takingPhoto ? <ActivityIndicator color="#fff" /> : <View style={styles.shutterInner} />}
                    </TouchableOpacity>
                    <View style={{ width: 24 }} />
                </View>
            </SafeAreaView>
        );
    };

    const renderPreview = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return (
            <SafeAreaView style={styles.previewContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <View style={styles.prevHeader}>
                    <TouchableOpacity onPress={() => setView('CAMERA')} style={styles.prevBackBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={colors.textDark} />
                    </TouchableOpacity>
                    <Text style={styles.prevTitle}>Preview</Text>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Interactive Map View */}
                    <View style={styles.mapVisual}>
                        {location ? (
                            <WebView
                                style={styles.mapBg}
                                source={{ html: `
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                                        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                                        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                                        <style>
                                            body { padding: 0; margin: 0; }
                                            #map { height: 100vh; width: 100vw; }
                                        </style>
                                    </head>
                                    <body>
                                        <div id="map"></div>
                                        <script>
                                            var map = L.map('map', { zoomControl: false }).setView([${location.coords.latitude}, ${location.coords.longitude}], 16);
                                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                                            L.marker([${location.coords.latitude}, ${location.coords.longitude}]).addTo(map);
                                            L.circle([${location.coords.latitude}, ${location.coords.longitude}], {
                                                color: '#006194',
                                                fillColor: '#006194',
                                                fillOpacity: 0.2,
                                                radius: ${location.coords.accuracy || 16}
                                            }).addTo(map);
                                        </script>
                                    </body>
                                    </html>
                                ` }}
                            />
                        ) : (
                            <View style={[styles.mapBg, { justifyContent: 'center', alignItems: 'center' }]}>
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        )}
                        <View style={styles.accuracyTag}>
                            <Text style={styles.accuracyTxt}>Akurasi: {location?.coords.accuracy?.toFixed(1) || '-'} m</Text>
                        </View>
                        <TouchableOpacity style={styles.btnRefineLocation} onPress={handleRefineLocation}>
                            <MaterialIcons name="my-location" size={16} color="#fff" />
                            <Text style={styles.btnRefineTxt}>Akuratkan</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.previewContent}>
                        <Text style={styles.prevUserName}>{user?.name}</Text>
                        <Text style={styles.prevDateTime}>{dateStr}, <Text style={{ color: colors.primary }}>{timeStr}</Text></Text>

                        {/* Photo Box */}
                        <View style={styles.photoLayout}>
                            <View style={styles.photoBox}>
                                {capturedPhotoUri ? (
                                    <Image source={{ uri: capturedPhotoUri }} style={styles.previewImg} />
                                ) : (
                                    <View style={styles.previewImgPlaceholder} />
                                )}
                                <Text style={styles.photoLabel}>Attendance Photo</Text>
                            </View>
                        </View>

                        {/* Validation Alert */}
                        <View style={styles.validationRow}>
                            <MaterialIcons name="gps-fixed" size={20} color={colors.primary} />
                            <Text style={styles.valText}>Status GPS : <Text style={{ color: colors.success }}>Koordinat Terbaca</Text></Text>
                        </View>

                        <View style={styles.valCardSuccess}>
                            <MaterialIcons name="info-outline" size={24} color={colors.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.valCardTitle, { color: colors.primary }]}>Menunggu Validasi Server</Text>
                                <Text style={[styles.valCardDesc, { color: colors.primary }]}>Koordinat Anda telah didapatkan. Tekan Save untuk memvalidasi jarak Anda dengan sekolah.</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.prevActions}>
                            <TouchableOpacity style={styles.btnRetake} onPress={() => { setCapturedPhotoUri(null); setView('CAMERA'); }}>
                                <Text style={styles.btnRetakeTxt}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btnSave, isSubmitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSaveTxt}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    };

    if (view === 'CAMERA') return renderCamera();
    if (view === 'PREVIEW') return renderPreview();
    return renderDashboard();
}

const styles = StyleSheet.create({
    // --- DASHBOARD STYLES ---
    dashboardContainer: { flex: 1, backgroundColor: colors.surface },
    headerSafe: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.outline },
    header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
    companyName: { fontSize: 18, fontWeight: 'bold', color: colors.textDark },
    headerIcons: { flexDirection: 'row' },
    
    // Banner
    banner: { borderRadius: 16, padding: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 16 },
    bannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bannerSub: { fontSize: 10, fontWeight: 'bold', color: '#cce5ff', letterSpacing: 0.5 },
    bannerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
    bannerDesc: { fontSize: 12, color: '#cce5ff', maxWidth: '85%' },
    statsRow: { flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 8, alignItems: 'center' },
    statBoxLabel: { fontSize: 10, color: '#cce5ff', marginBottom: 2 },
    statBoxVal: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },

    profileSection: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.surface },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontSize: 16, fontWeight: 'bold', color: colors.onSurfaceVariant },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: 'bold', color: colors.textDark },
    userRole: { fontSize: 12, color: colors.onSurfaceVariant },

    card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.outline },
    shiftDateLabel: { fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 4 },
    shiftName: { fontSize: 13, fontWeight: 'bold', color: colors.onSurfaceVariant },
    
    timeRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.outline },
    timeCol: { flex: 1 },
    smallAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
    smallAvatarTxt: { fontSize: 12, fontWeight: 'bold', color: colors.onSurfaceVariant },
    timeLabel: { fontSize: 12, color: colors.onSurfaceVariant },
    timeVal: { fontSize: 16, fontWeight: 'bold', color: colors.textDark },
    timeDivider: { width: 1, backgroundColor: colors.outline, marginHorizontal: 8 },

    recordBtn: { backgroundColor: colors.primary, marginHorizontal: 16, marginTop: 16, marginBottom: 8, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    recordBtnTxt: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    historySection: { paddingHorizontal: 16, paddingBottom: 8 },
    historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    historyDate: { fontSize: 12, color: colors.onSurfaceVariant },
    historyTime: { fontSize: 14, fontWeight: 'bold', color: colors.textDark },
    historyStatus: { fontSize: 12, color: colors.success, fontWeight: '500', marginRight: 8 },

    viewMoreBtn: { paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    viewMoreTxt: { fontSize: 13, fontWeight: 'bold', color: colors.onSurfaceVariant },
    hideDetailWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 4 },
    hideDetailTxt: { fontSize: 13, fontWeight: 'bold', color: colors.primary },

    favMenuTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textDark, marginLeft: 16, marginTop: 24, marginBottom: 16 },
    favMenuGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 32 },
    favMenuBtn: { alignItems: 'center', width: '22%' },
    favIconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    favMenuTxt: { fontSize: 11, textAlign: 'center', color: colors.textDark },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { width: 300, backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 8 },
    modalDesc: { fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 24 },
    modalActions: { flexDirection: 'row', gap: 16, width: '100%' },
    modalCancelBtn: { flex: 1, height: 40, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    modalCancelTxt: { color: colors.primary, fontWeight: 'bold', fontSize: 14 },
    modalOkBtn: { flex: 1, height: 40, backgroundColor: colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    modalOkTxt: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

    // --- CAMERA STYLES ---
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    camHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    camBackBtn: { padding: 4 },
    camTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cameraWrapper: { flex: 1, position: 'relative', overflow: 'hidden' },
    
    // Simple Portrait Silhouette Hack
    portraitOutline: { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' },
    headSilhouette: { width: 140, height: 180, borderRadius: 90, borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)', borderBottomWidth: 0, marginTop: -40 },
    shoulderSilhouette: { width: 260, height: 120, borderTopLeftRadius: 100, borderTopRightRadius: 100, borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)', borderBottomWidth: 0, marginTop: -10 },
    
    camFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 24, paddingBottom: 48 },
    shutterRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    shutterInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff' },

    // --- PREVIEW STYLES ---
    previewContainer: { flex: 1, backgroundColor: '#fff' },
    prevHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: colors.outline },
    prevBackBtn: { marginRight: 16 },
    prevTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textDark },
    
    mapVisual: { width: '100%', height: 220, backgroundColor: '#e5e7eb', position: 'relative' },
    mapBg: { width: '100%', height: '100%' },
    accuracyTag: { position: 'absolute', bottom: 16, left: 16, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, elevation: 2 },
    accuracyTxt: { fontSize: 12, color: colors.textDark, fontWeight: '500' },
    btnRefineLocation: { position: 'absolute', bottom: 16, right: 16, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, elevation: 2 },
    btnRefineTxt: { fontSize: 12, color: '#fff', fontWeight: 'bold' },

    previewContent: { padding: 24, alignItems: 'center' },
    prevUserName: { fontSize: 20, fontWeight: 'bold', color: colors.textDark },
    prevDateTime: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4, marginBottom: 24 },
    
    photoLayout: { flexDirection: 'row', justifyContent: 'center', gap: 16, width: '100%', marginBottom: 24 },
    photoBox: { alignItems: 'center' },
    previewImg: { width: 140, height: 180, borderRadius: 8, backgroundColor: '#e5e7eb' },
    previewImgPlaceholder: { width: 140, height: 180, borderRadius: 8, backgroundColor: '#e5e7eb' },
    photoLabel: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 8 },

    validationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', marginBottom: 12 },
    valText: { fontSize: 13, color: colors.onSurfaceVariant },
    
    valCardSuccess: { flexDirection: 'row', backgroundColor: '#ecfdf5', padding: 16, borderRadius: 8, gap: 12, width: '100%', marginBottom: 32 },
    valCardTitle: { fontSize: 14, fontWeight: 'bold', color: colors.success, marginBottom: 4 },
    valCardDesc: { fontSize: 12, color: colors.success, lineHeight: 18 },

    prevActions: { flexDirection: 'row', gap: 16, width: '100%' },
    btnRetake: { flex: 1, height: 48, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    btnRetakeTxt: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
    btnSave: { flex: 1, height: 48, backgroundColor: colors.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    btnSaveTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
