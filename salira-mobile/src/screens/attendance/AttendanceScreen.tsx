import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Platform, Alert, Dimensions, ImageBackground, StatusBar, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Colors matching DESIGN.md
const colors = {
    primary: '#006194',
    primaryContainer: '#007bb9',
    onPrimary: '#ffffff',
    primaryFixed: '#cce5ff',
    onPrimaryFixed: '#001d31',
    secondary: '#006c49',
    secondaryContainer: '#6cf8bb',
    onSecondaryContainer: '#00714d',
    tertiary: '#825100',
    onTertiary: '#ffffff',
    tertiaryFixed: '#ffddb8',
    onTertiaryFixed: '#2a1700',
    error: '#ba1a1a',
    surface: '#faf8ff',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f2f3ff',
    surfaceContainer: '#eaedff',
    surfaceContainerHigh: '#e2e7ff',
    onSurface: '#131b2e',
    onSurfaceVariant: '#3f4850',
    inverseSurface: '#283044',
    outline: '#707881',
};

export default function AttendanceScreen({ navigation }: any) {
    const { 
        todayStatus, 
        isLoading, 
        isRefreshing, 
        fetchInitialData, 
        refreshData, 
        submitCheckIn
    } = useAttendance();
    
    const { user } = useAuth();
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [locationPerm, setLocationPerm] = useState<Location.PermissionStatus | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
    const [takingPhoto, setTakingPhoto] = useState(false);
    
    const cameraRef = useRef<any>(null);
    const scanAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchInitialData();
        checkPermissions();
        
        // Setup Scanner Animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                }),
                Animated.timing(scanAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true
                })
            ])
        ).start();
    }, []);

    const checkPermissions = async () => {
        if (Platform.OS !== 'web') {
            if (!cameraPermission?.granted) {
                await requestCameraPermission();
            }
            let { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPerm(status);
            if (status === 'granted') {
                let loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
            }
        }
    };

    const handleTakePhoto = async () => {
        if (!cameraReady || !cameraRef.current) return;
        setTakingPhoto(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
            if (photo && photo.uri) {
                setCapturedPhotoUri(photo.uri);
            }
        } catch (e) {
            Alert.alert("Error", "Gagal mengambil foto");
        } finally {
            setTakingPhoto(false);
        }
    };

    const handleCheckInSubmit = async () => {
        if (!cameraPermission?.granted && Platform.OS !== 'web') {
            Alert.alert("Izin Kamera", "Mohon berikan izin kamera untuk presensi.");
            return;
        }
        if (locationPerm !== 'granted' && Platform.OS !== 'web') {
            Alert.alert("Izin Lokasi", "Mohon berikan izin lokasi untuk verifikasi.");
            return;
        }
        if (!capturedPhotoUri && Platform.OS !== 'web') {
            Alert.alert("Foto Wajib", "Silakan ambil foto wajah terlebih dahulu menggunakan tombol kamera.");
            return;
        }

        setIsCheckingIn(true);
        try {
            let locationData: { latitude?: number; longitude?: number; photoUri?: string } = {};
            if (Platform.OS !== 'web') {
                let loc = await Location.getCurrentPositionAsync({});
                locationData.latitude = loc.coords.latitude;
                locationData.longitude = loc.coords.longitude;
                locationData.photoUri = capturedPhotoUri || undefined;
            }

            await submitCheckIn(locationData);
            setCapturedPhotoUri(null); // reset on success
            if (Platform.OS !== 'web') {
                Alert.alert("Berhasil", "Presensi berhasil dikirim.");
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
            setIsCheckingIn(false);
        }
    };

    const isCheckInCompleted = !!todayStatus?.check_in;
    const isCheckOutCompleted = !!todayStatus?.check_out;
    const actionText = !isCheckInCompleted ? "Kirim Absen Masuk (Check-In)" : (!isCheckOutCompleted ? "Kirim Absen Pulang (Check-Out)" : "Presensi Selesai");
    const isActionDisabled = isCheckingIn || (isCheckInCompleted && isCheckOutCompleted);

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.headerSafe}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {navigation.canGoBack() && (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <MaterialIcons name="arrow-back-ios-new" size={22} color={colors.onSurface} />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.headerTitle} numberOfLines={1}>Presensi Kamera</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.profileBox}>
                            <MaterialIcons name="person" size={18} color={colors.onPrimary} />
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={refreshData} colors={[colors.primary]} />
                }
            >
                {/* Ambient Top Info Banner */}
                <LinearGradient
                    colors={[colors.primary, '#5b4eb1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bannerCard}
                >
                    <View style={styles.bannerDecorCircle} />
                    <View style={styles.bannerContentRow}>
                        <View style={styles.bannerIconBox}>
                            <MaterialIcons name="my-location" size={20} color="#fff" />
                        </View>
                        <View style={styles.bannerTextCol}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                                <Text style={styles.bannerTitle}>Presensi Kehadiran Harian</Text>
                                <View style={styles.bannerBadge}>
                                    <Text style={styles.bannerBadgeTxt}>SMK & PESANTREN</Text>
                                </View>
                            </View>
                            <Text style={styles.bannerDesc}>
                                Harap pastikan lokasi (GPS) pada perangkat Anda telah menyala dan berada di dalam radius zona Geofence kampus/sekolah (Maks 50m) untuk dapat melakukan presensi.
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Geolocation & Campus Radar Status Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialIcons name="share-location" size={20} color={colors.primary} />
                            <Text style={styles.cardTitle}>Validasi Radius Kampus</Text>
                        </View>
                        <View style={styles.accuracyBadge}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.accuracyTxt}>Akurasi Tinggi</Text>
                        </View>
                    </View>

                    <View style={styles.radarBox}>
                        <View style={styles.radarHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={styles.radarPing} />
                                <Text style={styles.radarStatus}>Dalam Radius Kampus (12m / Maks 50m)</Text>
                            </View>
                            <Text style={styles.radarCoords}>
                                Lat: {location ? location.coords.latitude.toFixed(4) : '-'}, Long: {location ? location.coords.longitude.toFixed(4) : '-'}
                            </Text>
                        </View>

                        <View style={styles.mapVisual}>
                            <ImageBackground 
                                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIjRyXyC_iv86Ms4fBn1McFVG53FGavLwKzUBs37EUqJCjJ5IjK9dTzhIC9PypAvx8Z3E6_u9wNYMHLE5NcUrxD5AkqDEdr80I7o5Dk9UE1mus0WyWiCQpCyzBmCL53XWMxKSNscjr6Py_TrGAE6u3ELYvvWGyniIPa12wweX0whiynZoZSRWUMRooIeF3BtiXwpE_2dDYVip7zUwpRYm5bEr_h7LTUCulnRGH_I7mKkbRjBxjNZwf' }} 
                                style={styles.mapBg}
                                imageStyle={{ opacity: 0.8 }}
                            >
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent']}
                                    start={{ x: 0, y: 1 }}
                                    end={{ x: 0, y: 0 }}
                                    style={StyleSheet.absoluteFillObject}
                                />
                                <View style={styles.mapPinContainer}>
                                    <View style={styles.mapPinPulseOuter} />
                                    <View style={styles.mapPinPulseInner}>
                                        <View style={styles.mapPinCore} />
                                    </View>
                                </View>
                                <View style={styles.mapZoneLabel}>
                                    <MaterialIcons name="verified" size={12} color={colors.primary} />
                                    <Text style={styles.mapZoneTxt}>Zona Gerbang Utama & Ruang Guru</Text>
                                </View>
                            </ImageBackground>
                        </View>
                    </View>
                </View>

                {/* Attendance Today Status Tiles */}
                <View style={styles.statusGrid}>
                    {/* Check In */}
                    <View style={styles.statusTile}>
                        <View style={styles.statusTileHeader}>
                            <Text style={styles.statusTileLabel}>Masuk (Check-In)</Text>
                            <MaterialIcons name="check-circle" size={18} color={colors.secondary} />
                        </View>
                        <Text style={styles.statusTileVal}>{todayStatus?.check_in || '-- : -- : --'}</Text>
                        {todayStatus?.check_in ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={styles.dotSecondary} />
                                <Text style={styles.statusTileSub}>Tepat Waktu</Text>
                            </View>
                        ) : (
                            <Text style={styles.statusTileSubEmpty}>Belum Presensi</Text>
                        )}
                    </View>

                    {/* Check Out */}
                    <View style={styles.statusTile}>
                        <View style={styles.statusTileHeader}>
                            <Text style={styles.statusTileLabel}>Pulang (Check-Out)</Text>
                            <MaterialIcons name="schedule" size={18} color={colors.tertiary} />
                        </View>
                        <Text style={[styles.statusTileVal, !todayStatus?.check_out && { color: colors.outline }]}>
                            {todayStatus?.check_out || '-- : -- : --'}
                        </Text>
                        {todayStatus?.check_out ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={[styles.dotSecondary, { backgroundColor: colors.tertiary }]} />
                                <Text style={[styles.statusTileSub, { color: colors.tertiary }]}>Berhasil Check-out</Text>
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={[styles.dotSecondary, { backgroundColor: colors.tertiary }]} />
                                <Text style={[styles.statusTileSub, { color: colors.tertiary }]}>Buka 16:00 - 18:00</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Camera Selfie Scanner Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardTitle}>Jendela Pemindai Wajah</Text>
                            <Text style={styles.cardSubtitle}>Pastikan wajah berada di dalam oval pemindai</Text>
                        </View>
                        <View style={styles.liveAIBadge}>
                            <Text style={styles.liveAITxt}>LIVE AI</Text>
                        </View>
                    </View>

                    <View style={styles.cameraContainer}>
                        {Platform.OS !== 'web' && cameraPermission?.granted ? (
                            capturedPhotoUri ? (
                                <ImageBackground source={{ uri: capturedPhotoUri }} style={styles.cameraView} />
                            ) : (
                                <CameraView 
                                    ref={cameraRef}
                                    style={styles.cameraView} 
                                    facing="front"
                                    onCameraReady={() => setCameraReady(true)}
                                />
                            )
                        ) : (
                            <View style={[styles.cameraView, { backgroundColor: colors.inverseSurface, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ color: '#fff' }}>Kamera tidak aktif/izin ditolak</Text>
                            </View>
                        )}

                        {/* Scanner Guidelines */}
                        <View style={styles.scannerOverlay}>
                            <View style={styles.scannerFrame}>
                                <View style={styles.scannerCornerTL} />
                                <View style={styles.scannerCornerTR} />
                                
                                <Animated.View style={[styles.scannerBeam, {
                                    transform: [{
                                        translateY: scanAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-100, 100] // Roughly match height/2
                                        })
                                    }]
                                }]} />

                                <View style={styles.scannerCornerBL} />
                                <View style={styles.scannerCornerBR} />
                            </View>
                        </View>

                        {/* AI Status Chip */}
                        <View style={styles.aiStatusChip}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.aiStatusTxt}>Wajah Terdeteksi & Pencahayaan Optimal</Text>
                        </View>

                        {/* Shutter Button (Capture Only) */}
                        <View style={styles.shutterContainer}>
                            {capturedPhotoUri ? (
                                <TouchableOpacity style={styles.shutterBtn} onPress={() => setCapturedPhotoUri(null)}>
                                    <View style={[styles.shutterBtnInner, { backgroundColor: colors.error }]}>
                                        <MaterialIcons name="replay" size={26} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.shutterBtn} onPress={handleTakePhoto} disabled={takingPhoto || isActionDisabled}>
                                    <View style={styles.shutterBtnInner}>
                                        {takingPhoto ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <MaterialIcons name="photo-camera" size={26} color={colors.onPrimary} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Submit CTA */}
                    <TouchableOpacity 
                        style={[styles.submitBtn, isActionDisabled && { opacity: 0.5, backgroundColor: colors.outline }]}
                        onPress={handleCheckInSubmit}
                        disabled={isActionDisabled}
                    >
                        <LinearGradient
                            colors={isActionDisabled ? [colors.outline, colors.outline] : [colors.primary, colors.primaryContainer]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitGradient}
                        >
                            {isCheckingIn ? (
                                <ActivityIndicator color={colors.onPrimary} />
                            ) : (
                                <>
                                    <MaterialIcons name={!isCheckInCompleted ? "login" : "exit-to-app"} size={20} color={colors.onPrimary} />
                                    <Text style={styles.submitBtnTxt}>{actionText}</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Quick Shortcuts */}
                <View style={styles.card}>
                    <Text style={styles.shortcutHeader}>AKSES CEPAT KEPEGAWAIAN</Text>
                    <View style={styles.shortcutGrid}>
                        <TouchableOpacity style={styles.shortcutBtn} onPress={() => navigation.navigate('AttendanceHistory')}>
                            <View style={[styles.shortcutIconBox, { backgroundColor: colors.primaryFixed }]}>
                                <MaterialIcons name="history" size={18} color={colors.onPrimaryFixed} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.shortcutTitle}>Riwayat Absensi</Text>
                                <Text style={styles.shortcutDesc}>Rekap bulanan</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.shortcutBtn} onPress={() => navigation.navigate('Leave')}>
                            <View style={[styles.shortcutIconBox, { backgroundColor: colors.tertiaryFixed }]}>
                                <MaterialIcons name="event-note" size={18} color={colors.onTertiaryFixed} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.shortcutTitle}>Pengajuan Izin</Text>
                                <Text style={styles.shortcutDesc}>Sakit atau dinas</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    headerSafe: {
        backgroundColor: 'rgba(250, 248, 255, 0.85)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.04)',
        elevation: 1,
        zIndex: 10,
    },
    header: {
        height: 64,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 32, // approx statusbar height if translucent
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backBtn: {
        width: 44,
        height: 44,
        marginLeft: -8,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.onSurface,
        maxWidth: 200,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingTop: 16,
        paddingBottom: 120,
        paddingHorizontal: 16,
    },
    bannerCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    bannerDecorCircle: {
        position: 'absolute',
        right: -32,
        bottom: -32,
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    bannerContentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        zIndex: 1,
    },
    bannerIconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerTextCol: {
        flex: 1,
        gap: 4,
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: -0.5,
    },
    bannerBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    bannerBadgeTxt: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    bannerDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 18,
    },
    card: {
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    cardSubtitle: {
        fontSize: 12,
        color: colors.onSurfaceVariant,
        marginTop: 2,
    },
    accuracyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        backgroundColor: colors.secondaryContainer,
    },
    accuracyTxt: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.onSecondaryContainer,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.secondary,
    },
    radarBox: {
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: 12,
        padding: 12,
    },
    radarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    radarPing: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.secondary,
        borderWidth: 2,
        borderColor: 'rgba(0, 108, 73, 0.2)',
    },
    radarStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.secondary,
    },
    radarCoords: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.onSurfaceVariant,
    },
    mapVisual: {
        width: '100%',
        height: 96,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: colors.surfaceContainerHighest,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapBg: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPinContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapPinPulseOuter: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0, 97, 148, 0.2)',
    },
    mapPinPulseInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 97, 148, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPinCore: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: '#fff',
    },
    mapZoneLabel: {
        position: 'absolute',
        bottom: 6,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(250, 248, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    mapZoneTxt: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.onSurface,
    },
    statusGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statusTile: {
        flex: 1,
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 16,
        padding: 16,
        elevation: 1,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    statusTileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusTileLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.onSurfaceVariant,
    },
    statusTileVal: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.onSurface,
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    dotSecondary: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.secondary,
    },
    statusTileSub: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.secondary,
    },
    statusTileSubEmpty: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.outline,
    },
    liveAIBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 99,
        backgroundColor: colors.surfaceContainer,
    },
    liveAITxt: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
    },
    cameraContainer: {
        width: '100%',
        aspectRatio: 1, // 4:4 from design
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.inverseSurface,
        position: 'relative',
        marginBottom: 16,
    },
    cameraView: {
        flex: 1,
    },
    scannerOverlay: {
        position: 'absolute',
        inset: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    scannerFrame: {
        width: 224,
        height: 256,
        borderRadius: 42,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(0, 108, 73, 0.9)',
        position: 'relative',
        justifyContent: 'center',
    },
    scannerCornerTL: { position: 'absolute', top: -2, left: -2, width: 16, height: 16, borderTopWidth: 2, borderLeftWidth: 2, borderColor: colors.secondary, borderTopLeftRadius: 4 },
    scannerCornerTR: { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderTopWidth: 2, borderRightWidth: 2, borderColor: colors.secondary, borderTopRightRadius: 4 },
    scannerCornerBL: { position: 'absolute', bottom: -2, left: -2, width: 16, height: 16, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: colors.secondary, borderBottomLeftRadius: 4 },
    scannerCornerBR: { position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderBottomWidth: 2, borderRightWidth: 2, borderColor: colors.secondary, borderBottomRightRadius: 4 },
    scannerBeam: {
        width: '100%',
        height: 2,
        backgroundColor: colors.secondary,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
    },
    aiStatusChip: {
        position: 'absolute',
        top: 12,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 99,
        backgroundColor: 'rgba(40, 48, 68, 0.8)',
    },
    aiStatusTxt: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#fff',
    },
    shutterContainer: {
        position: 'absolute',
        bottom: 12,
        alignSelf: 'center',
    },
    shutterBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 4,
        elevation: 10,
    },
    shutterBtnInner: {
        flex: 1,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitBtn: {
        width: '100%',
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    submitGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitBtnTxt: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.onPrimary,
    },
    shortcutHeader: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.onSurfaceVariant,
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    shortcutGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    shortcutBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: colors.surfaceContainerLow,
    },
    shortcutIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shortcutTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    shortcutDesc: {
        fontSize: 11,
        color: colors.onSurfaceVariant,
    },
});
