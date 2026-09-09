import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Colors matching DESIGN.md
const colors = {
    primary: '#006194',
    primaryContainer: '#007bb9',
    onPrimary: '#ffffff',
    primaryFixed: '#cce5ff',
    primaryFixedDim: '#93ccff',
    onPrimaryFixed: '#001d31',
    secondary: '#006c49',
    secondaryContainer: '#6cf8bb',
    onSecondaryContainer: '#00714d',
    tertiary: '#825100',
    onTertiary: '#ffffff',
    tertiaryFixed: '#ffddb8',
    tertiaryFixedDim: '#ffb95f',
    onTertiaryFixed: '#2a1700',
    error: '#ba1a1a',
    surface: '#faf8ff',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f2f3ff',
    surfaceContainer: '#eaedff',
    surfaceContainerHigh: '#e2e7ff',
    surfaceContainerHighest: '#dae2fd',
    onSurface: '#131b2e',
    onSurfaceVariant: '#3f4850',
    outline: '#707881',
};

const AKSI_CEPAT = [
    { label: 'Jurnal KBM', icon: 'event-note', color: colors.primary, bg: colors.primaryFixed, tab: 'Jurnal' },
    { label: 'Asesmen', icon: 'fact-check', color: colors.onSecondaryContainer, bg: colors.secondaryContainer, tab: 'Penilaian' },
    { label: 'Konseling', icon: 'support-agent', color: colors.tertiary, bg: colors.tertiaryFixed, tab: 'Bimbingan' },
    { label: 'Halaqah', icon: 'bedtime', color: colors.primary, bg: colors.surfaceContainerHighest },
    { label: 'Izin Cuti', icon: 'assignment', color: colors.onSurfaceVariant, bg: colors.surfaceContainer, screen: 'Leave' },
];

export default function DashboardScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<any>();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '.') + ' WIB';
    
    const today = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateString = `${today.toLocaleDateString('id-ID', dateOptions)} • Semester Ganjil`;

    const renderHeader = () => (
        <SafeAreaView style={styles.headerSafe}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>S</Text>
                    </View>
                    <View style={styles.headerTitleWrap}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.brandTitle}>SALIRA</Text>
                            <View style={styles.semesterBadge}>
                                <Text style={styles.semesterText}>Ganjil</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.campusText} numberOfLines={1}>Kampus Utama (Aktif)</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Notifikasi' })}>
                        <Ionicons name="notifications" size={24} color={colors.onSurfaceVariant} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.profileBox}>
                            <Ionicons name="person" size={18} color={colors.onPrimary} />
                        </View>
                        <View style={styles.profileOnlineDot} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Greeting & Real-time Live Badge */}
                <View style={styles.greetingSection}>
                    <View style={styles.liveBadgeRow}>
                        <View style={styles.liveBadge}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.liveBadgeText}>SISTEM TERINTEGRASI • LIVE</Text>
                        </View>
                        <View style={styles.clockWrap}>
                            <MaterialIcons name="schedule" size={15} color={colors.onSurfaceVariant} />
                            <Text style={styles.clockText}>{timeString}</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.greetingTitle}>Selamat Bertugas, {user?.name?.split(' ')[0] ?? 'Bapak Guru'}!</Text>
                    <Text style={styles.greetingDate}>{dateString}</Text>
                </View>

                {/* Hero Announcement Card */}
                <LinearGradient
                    colors={[colors.primary, colors.primaryContainer]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    <View style={styles.heroDecorCircle} />
                    <View style={{ zIndex: 1 }}>
                        <Text style={styles.heroSubtitle}>DASHBOARD CERDAS SALIRA</Text>
                        <Text style={styles.heroTitle}>
                            Optimalkan <Text style={{ color: colors.tertiaryFixed }}>Pengelolaan Akademik</Text>
                        </Text>
                        <Text style={styles.heroDesc}>
                            Pantau presensi, penilaian kbm, dan aktivitas santri secara real-time langsung dari genggaman.
                        </Text>

                        <View style={styles.heroActionRow}>
                            <TouchableOpacity style={styles.heroBtnSecondary}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
                                    <MaterialIcons name="summarize" size={20} color={colors.tertiaryFixed} />
                                    <Text style={styles.heroBtnSecondaryTxt} numberOfLines={1}>Akses Laporan</Text>
                                </View>
                                <MaterialIcons name="arrow-forward" size={16} color={colors.onPrimary} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.heroBtnPrimary}
                                onPress={() => navigation.navigate('MainTabs', { screen: 'Presensi' })}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
                                    <MaterialIcons name="qr-code-scanner" size={20} color={colors.onSecondaryContainer} />
                                    <Text style={styles.heroBtnPrimaryTxt} numberOfLines={1}>Presensi</Text>
                                </View>
                                <MaterialIcons name="arrow-forward" size={16} color={colors.onSecondaryContainer} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

                {/* Quick Stats Grid */}
                <View style={styles.statsGrid}>
                    {/* Siswa Hadir */}
                    <View style={styles.statCard}>
                        <View style={styles.statTop}>
                            <Text style={styles.statLabel}>Siswa Hadir</Text>
                            <View style={[styles.statIconBox, { backgroundColor: 'rgba(108,248,187,0.6)' }]}>
                                <MaterialIcons name="how-to-reg" size={18} color={colors.secondary} />
                            </View>
                        </View>
                        <View style={styles.statValRow}>
                            <Text style={styles.statValTxt}>15</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialIcons name="trending-up" size={14} color={colors.secondary} />
                                <Text style={[styles.statValSub, { color: colors.secondary }]}>100%</Text>
                            </View>
                        </View>
                        <Text style={styles.statDesc}>dari total jadwal hari ini</Text>
                    </View>

                    {/* Izin / Sakit */}
                    <View style={styles.statCard}>
                        <View style={styles.statTop}>
                            <Text style={styles.statLabel}>Izin / Sakit</Text>
                            <View style={[styles.statIconBox, { backgroundColor: colors.tertiaryFixed }]}>
                                <MaterialIcons name="medical-services" size={18} color={colors.tertiary} />
                            </View>
                        </View>
                        <View style={styles.statValRow}>
                            <Text style={styles.statValTxt}>4</Text>
                            <Text style={styles.statValSub}>Santri</Text>
                        </View>
                        <Text style={styles.statDesc}>3 sakit, 1 izin syar'i</Text>
                    </View>

                    {/* Konsultasi */}
                    <View style={styles.statCard}>
                        <View style={styles.statTop}>
                            <Text style={styles.statLabel}>Konsultasi</Text>
                            <View style={[styles.statIconBox, { backgroundColor: colors.surfaceContainerHigh }]}>
                                <MaterialIcons name="forum" size={18} color={colors.primary} />
                            </View>
                        </View>
                        <View style={styles.statValRow}>
                            <Text style={styles.statValTxt}>0</Text>
                            <Text style={[styles.statValSub, { color: colors.secondary }]}>Clear</Text>
                        </View>
                        <Text style={styles.statDesc}>Antrean bimbingan nihil</Text>
                    </View>

                    {/* Inventaris */}
                    <View style={styles.statCard}>
                        <View style={styles.statTop}>
                            <Text style={styles.statLabel}>Inventaris Lab</Text>
                            <View style={[styles.statIconBox, { backgroundColor: colors.primaryFixed }]}>
                                    <MaterialIcons name="inventory" size={18} color={colors.primary} />
                            </View>
                        </View>
                        <View style={styles.statValRow}>
                            <Text style={styles.statValTxt}>0</Text>
                            <Text style={styles.statValSub}>Unit</Text>
                        </View>
                        <Text style={styles.statDesc}>Semua aset lab aman</Text>
                    </View>
                </View>

                {/* Presensi Geotag Pegawai Hari Ini */}
                <View style={styles.geotagCard}>
                    <View style={styles.geotagHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={styles.pinDropBox}>
                                <MaterialIcons name="pin-drop" size={20} color={colors.onSecondaryContainer} />
                            </View>
                            <View>
                                <Text style={styles.geotagTitle}>Presensi Pegawai Saya</Text>
                                <Text style={styles.geotagSubtitle}>Radius Kampus Utama (Aktif)</Text>
                            </View>
                        </View>
                        <View style={styles.badgeTepatWaktu}>
                            <Text style={styles.badgeTepatWaktuTxt}>Tepat Waktu</Text>
                        </View>
                    </View>

                    <View style={styles.geotagDataBox}>
                        <View style={styles.geotagDataCol}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <MaterialIcons name="login" size={14} color={colors.secondary} />
                                <Text style={styles.geotagDataLabel}>Masuk (Check-in)</Text>
                            </View>
                            <Text style={styles.geotagDataTime}>13:02:34 WIB</Text>
                            <Text style={[styles.geotagDataStatus, { color: colors.secondary }]}>Validasi Geotag OK</Text>
                        </View>
                        
                        <View style={styles.geotagDataCol}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <MaterialIcons name="logout" size={14} color={colors.tertiary} />
                                <Text style={styles.geotagDataLabel}>Pulang (Check-out)</Text>
                            </View>
                            <Text style={styles.geotagDataTime}>Belum Presensi</Text>
                            <Text style={[styles.geotagDataStatus, { color: colors.tertiary }]}>Buka pkl 17:00 WIB</Text>
                        </View>
                    </View>
                </View>

                {/* Aksi Cepat Guru */}
                <View style={styles.aksiSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Aksi Cepat Guru</Text>
                        <TouchableOpacity>
                            <Text style={styles.sectionLink}>Semua Menu</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.aksiGrid}>
                        {AKSI_CEPAT.map((item, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.aksiBtn}
                                onPress={() => {
                                    if (item.tab) navigation.navigate('MainTabs', { screen: item.tab });
                                    else if (item.screen) navigation.navigate(item.screen as any);
                                    else alert('Fitur segera hadir');
                                }}
                            >
                                <View style={[styles.aksiIconBox, { backgroundColor: item.bg }]}>
                                    <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                                </View>
                                <Text style={styles.aksiBtnTxt}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Ranking Kehadiran Santri */}
                <View style={styles.rankingCard}>
                    <View style={styles.rankingHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={styles.rankingIconBox}>
                                <MaterialIcons name="emoji-events" size={18} color={colors.tertiary} />
                            </View>
                            <View>
                                <Text style={styles.rankingTitle}>Ranking Kehadiran Santri</Text>
                                <Text style={styles.rankingSubtitle}>Semester Ganjil 2026/2027</Text>
                            </View>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.rankingLink}>Lihat Semua</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rankingList}>
                        {/* Rank 1 */}
                        <View style={styles.rankItem}>
                            <View style={styles.rankItemLeft}>
                                <View style={styles.rankNumber1}><Text style={styles.rankNumberTxt}>1</Text></View>
                                <View style={styles.rankAvatar1}><Text style={styles.rankAvatarTxt1}>K</Text></View>
                                <View style={{flexShrink: 1}}>
                                    <Text style={styles.rankName} numberOfLines={1}>Khairani Noor Rohmah</Text>
                                    <Text style={styles.rankClass}>XI TJKT PI</Text>
                                </View>
                            </View>
                            <View style={styles.rankItemRight}>
                                <Text style={styles.rankDays}>28 Hari</Text>
                                <Text style={styles.rankStatus}>Sempurna</Text>
                            </View>
                        </View>
                        
                        {/* Rank 2 */}
                        <View style={styles.rankItem}>
                            <View style={styles.rankItemLeft}>
                                <View style={styles.rankNumber2}><Text style={styles.rankNumberTxt2}>2</Text></View>
                                <View style={styles.rankAvatar2}><Text style={styles.rankAvatarTxt2}>S</Text></View>
                                <View style={{flexShrink: 1}}>
                                    <Text style={styles.rankName} numberOfLines={1}>Safa Dwi Mulyaningsih</Text>
                                    <Text style={styles.rankClass}>XI TJKT PI</Text>
                                </View>
                            </View>
                            <View style={styles.rankItemRight}>
                                <Text style={styles.rankDays}>27 Hari</Text>
                                <Text style={styles.rankStatus}>98.5%</Text>
                            </View>
                        </View>
                        
                        {/* Rank 3 */}
                        <View style={styles.rankItem}>
                            <View style={styles.rankItemLeft}>
                                <View style={styles.rankNumber3}><Text style={styles.rankNumberTxt3}>3</Text></View>
                                <View style={styles.rankAvatar3}><Text style={styles.rankAvatarTxt3}>D</Text></View>
                                <View style={{flexShrink: 1}}>
                                    <Text style={styles.rankName} numberOfLines={1}>Daffa Fajril Adha</Text>
                                    <Text style={styles.rankClass}>XI TJKT PA</Text>
                                </View>
                            </View>
                            <View style={styles.rankItemRight}>
                                <Text style={styles.rankDays}>27 Hari</Text>
                                <Text style={styles.rankStatus}>98.5%</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Status Audit Log */}
                <View style={styles.auditCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.auditIconBox}>
                            <MaterialIcons name="verified-user" size={18} color={colors.onSurfaceVariant} />
                        </View>
                        <View>
                            <Text style={styles.auditTitle}>Audit Akses Guru</Text>
                            <Text style={styles.auditSubtitle}>Online via Android App • IP Terverifikasi</Text>
                        </View>
                    </View>
                    <View style={styles.auditDot} />
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
    logoBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        color: colors.onPrimary,
        fontSize: 18,
        fontWeight: '600',
    },
    headerTitleWrap: {
        justifyContent: 'center',
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.onSurface,
        letterSpacing: -0.5,
    },
    semesterBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 99,
        backgroundColor: colors.secondaryContainer,
    },
    semesterText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.onSecondaryContainer,
    },
    campusText: {
        fontSize: 10,
        color: colors.onSurfaceVariant,
        maxWidth: 130,
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.secondary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.error,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    profileBtn: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    profileOnlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.secondary,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    scrollContent: {
        paddingTop: 16,
        paddingBottom: 100, // For bottom nav
    },
    greetingSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    liveBadgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        backgroundColor: colors.secondaryContainer,
    },
    liveBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.onSecondaryContainer,
        letterSpacing: 0.5,
    },
    clockWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    clockText: {
        fontSize: 10,
        color: colors.onSurfaceVariant,
    },
    greetingTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.onSurface,
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    greetingDate: {
        fontSize: 12,
        color: colors.onSurfaceVariant,
    },
    heroCard: {
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        overflow: 'hidden',
        position: 'relative',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    heroDecorCircle: {
        position: 'absolute',
        right: -40,
        bottom: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(147, 204, 255, 0.15)',
    },
    heroSubtitle: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primaryFixed,
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.onPrimary,
        marginBottom: 4,
        lineHeight: 24,
    },
    heroDesc: {
        fontSize: 12,
        color: colors.primaryFixed,
        marginBottom: 16,
        lineHeight: 16,
    },
    heroActionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    heroBtnSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(250, 248, 255, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    heroBtnSecondaryTxt: {
        fontSize: 12,
        color: colors.onPrimary,
        fontWeight: '600',
    },
    heroBtnPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.secondaryContainer,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    heroBtnPrimaryTxt: {
        fontSize: 12,
        color: colors.onSecondaryContainer,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 24,
    },
    statCard: {
        width: (width - 42) / 2, // 32 for paddings, 10 for gap
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 16,
        padding: 12,
        elevation: 1,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    statTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: colors.onSurfaceVariant,
    },
    statIconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 2,
    },
    statValTxt: {
        fontSize: 30,
        fontWeight: 'bold',
        color: colors.onSurface,
        lineHeight: 38,
        letterSpacing: -1,
    },
    statValSub: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.onSurfaceVariant,
    },
    statDesc: {
        fontSize: 11,
        color: colors.onSurfaceVariant,
    },
    geotagCard: {
        backgroundColor: colors.surfaceContainerLowest,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        elevation: 1,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    geotagHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    pinDropBox: {
        width: 32,
        height: 32,
        borderRadius: 12,
        backgroundColor: colors.secondaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
    },
    geotagTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    geotagSubtitle: {
        fontSize: 11,
        color: colors.onSurfaceVariant,
    },
    badgeTepatWaktu: {
        backgroundColor: colors.secondaryContainer,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
    },
    badgeTepatWaktuTxt: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.onSecondaryContainer,
    },
    geotagDataBox: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: 12,
        padding: 10,
        gap: 8,
    },
    geotagDataCol: {
        flex: 1,
    },
    geotagDataLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: colors.onSurfaceVariant,
    },
    geotagDataTime: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.onSurface,
        marginTop: 2,
    },
    geotagDataStatus: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 2,
    },
    aksiSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    sectionLink: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
    },
    aksiGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    aksiBtn: {
        alignItems: 'center',
        width: 60,
    },
    aksiIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        elevation: 1,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    aksiBtnTxt: {
        fontSize: 11,
        color: colors.onSurface,
        textAlign: 'center',
    },
    rankingCard: {
        backgroundColor: colors.surfaceContainerLowest,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        elevation: 1,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    rankingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    rankingIconBox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: colors.tertiaryFixed,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankingTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    rankingSubtitle: {
        fontSize: 11,
        color: colors.onSurfaceVariant,
    },
    rankingLink: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
    },
    rankingList: {
        gap: 8,
    },
    rankItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: 12,
        padding: 10,
    },
    rankItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    rankNumber1: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankNumberTxt: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.onTertiary,
    },
    rankAvatar1: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primaryFixed,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankAvatarTxt1: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },
    rankName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    rankClass: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.primary,
    },
    rankItemRight: {
        alignItems: 'flex-end',
    },
    rankDays: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.secondary,
    },
    rankStatus: {
        fontSize: 10,
        color: colors.onSurfaceVariant,
    },
    rankNumber2: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.outline,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankNumberTxt2: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.onPrimary,
    },
    rankAvatar2: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.secondaryContainer,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankAvatarTxt2: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.onSecondaryContainer,
    },
    rankNumber3: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.tertiaryFixedDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankNumberTxt3: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.onTertiaryFixed,
    },
    rankAvatar3: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primaryFixedDim,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankAvatarTxt3: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.onPrimaryFixed,
    },
    auditCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surfaceContainerLow,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
    },
    auditIconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceContainerHighest,
        justifyContent: 'center',
        alignItems: 'center',
    },
    auditTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.onSurface,
    },
    auditSubtitle: {
        fontSize: 11,
        color: colors.onSurfaceVariant,
    },
    auditDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.secondary,
    },
});
