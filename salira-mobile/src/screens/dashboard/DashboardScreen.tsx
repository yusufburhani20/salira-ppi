import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const MENU_ITEMS = [
    { label: 'Presensi', desc: 'Catat kehadiran\nhari ini', icon: 'finger-print', tab: 'Presensi', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Jurnal', desc: 'Kelola jurnal\nmengajar', icon: 'book', tab: 'Jurnal', color: '#059669', bg: '#ecfdf5' },
    { label: 'Penilaian', desc: 'Input nilai\nsiswa', icon: 'document-text', tab: 'Penilaian', color: '#d97706', bg: '#fffbeb' },
    { label: 'Perizinan', desc: 'Ajukan izin /\ncuti', icon: 'person', screen: 'Leave', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Konsultasi', desc: 'Konsultasi\npimpinan', icon: 'chatbubbles', tab: 'Konsultasi', color: '#0891b2', bg: '#ecfeff' },
    { label: 'Notifikasi', desc: 'Lihat\npemberitahuan', icon: 'notifications', tab: 'Notifikasi', color: '#ef4444', bg: '#fef2f2' },
];

export default function DashboardScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<any>();

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const handleMenu = (item: typeof MENU_ITEMS[0]) => {
        if (item.screen) {
            navigation.navigate(item.screen);
        } else if (item.tab) {
            navigation.navigate('MainTabs', { screen: item.tab });
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header Background (Curved) */}
            <View style={styles.headerBg}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.greeting}>Halo, {user?.name?.split(' ')[0] ?? 'Bapak'} 👋</Text>
                        <Text style={styles.date}>{today}</Text>
                        
                        <View style={styles.roleBadge}>
                            <Ionicons name="school" size={14} color="#fff" style={{marginRight: 6}} />
                            <Text style={styles.roleText}>{user?.roles?.[0] ?? 'Guru'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.avatarWrap} onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'G'}</Text>
                        </View>
                        <View style={styles.onlineDot} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Top Card: Jadwal Hari Ini */}
            <View style={styles.scheduleCard}>
                <View style={styles.scheduleTopRow}>
                    <View style={styles.scheduleIconWrap}>
                        <Ionicons name="calendar" size={20} color="#2563eb" />
                    </View>
                    <View style={styles.scheduleInfo}>
                        <View style={styles.scheduleHeaderRow}>
                            <Text style={styles.scheduleLabel}>Jadwal Hari Ini</Text>
                            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                        </View>
                        <Text style={styles.scheduleTitle}>X TJKT 1 - Matematika</Text>
                        <View style={styles.scheduleDetails}>
                            <View style={styles.scheduleDetailItem}>
                                <Ionicons name="time-outline" size={14} color="#64748b" />
                                <Text style={styles.scheduleDetailTxt}>08:00 - 09:40</Text>
                            </View>
                            <View style={styles.dotSeparator} />
                            <View style={styles.scheduleDetailItem}>
                                <Ionicons name="location-outline" size={14} color="#64748b" />
                                <Text style={styles.scheduleDetailTxt}>Ruang 101</Text>
                            </View>
                        </View>
                    </View>
                </View>
                
                <TouchableOpacity style={styles.scheduleBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Presensi' })}>
                    <Ionicons name="play" size={16} color="#fff" />
                    <Text style={styles.scheduleBtnTxt}>Mulai Presensi</Text>
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Section: Akses Cepat */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Akses Cepat</Text>
                <TouchableOpacity><Text style={styles.sectionLink}>Lihat Semua {'>'}</Text></TouchableOpacity>
            </View>

            <View style={styles.menuGrid}>
                {MENU_ITEMS.map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[styles.menuCard, { backgroundColor: item.bg }]}
                        onPress={() => handleMenu(item)}
                    >
                        <View style={styles.menuCardTop}>
                            <View style={[styles.menuIconCircle, { backgroundColor: item.color }]}>
                                <Ionicons name={item.icon as any} size={22} color="#fff" />
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={item.color} />
                        </View>
                        <Text style={[styles.menuCardTitle, { color: '#1e293b' }]}>{item.label}</Text>
                        <Text style={styles.menuCardDesc}>{item.desc}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Section: Aktivitas Terbaru */}
            <View style={styles.sectionHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Ionicons name="time-outline" size={20} color="#1e293b" style={{marginRight: 8}} />
                    <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
                </View>
                <TouchableOpacity><Text style={styles.sectionLink}>Lihat Semua {'>'}</Text></TouchableOpacity>
            </View>

            <View style={styles.activityContainer}>
                {/* Activity 1 */}
                <View style={styles.activityItem}>
                    <View style={[styles.activityIconWrap, { backgroundColor: '#eff6ff' }]}>
                        <Ionicons name="book-outline" size={20} color="#2563eb" />
                    </View>
                    <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>Jurnal Mengajar</Text>
                        <Text style={styles.activitySub}>X TJKT 1 · Matematika</Text>
                    </View>
                    <View style={styles.activityRight}>
                        <Text style={styles.activityTime}>08:30</Text>
                        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                    </View>
                </View>
                {/* Activity 2 */}
                <View style={styles.activityItem}>
                    <View style={[styles.activityIconWrap, { backgroundColor: '#ecfdf5' }]}>
                        <Ionicons name="document-text-outline" size={20} color="#059669" />
                    </View>
                    <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>Penilaian Siswa</Text>
                        <Text style={styles.activitySub}>X TJKT 1 · Ulangan Harian</Text>
                    </View>
                    <View style={styles.activityRight}>
                        <Text style={styles.activityTime}>10:15</Text>
                        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                    </View>
                </View>
                {/* Activity 3 */}
                <View style={[styles.activityItem, { borderBottomWidth: 0 }]}>
                    <View style={[styles.activityIconWrap, { backgroundColor: '#f5f3ff' }]}>
                        <Ionicons name="people-outline" size={20} color="#7c3aed" />
                    </View>
                    <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>Izin Mengajar</Text>
                        <Text style={styles.activitySub}>X TJKT 2 · 09:00 - 11:00</Text>
                    </View>
                    <View style={styles.activityRight}>
                        <Text style={styles.activityTime}>Kemarin</Text>
                        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
                    </View>
                </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={20} color="#2563eb" />
                <Text style={styles.infoText}>
                    Tap menu di bawah untuk navigasi cepat antar fitur.{"\n"}Gunakan tab bar di bagian bawah layar.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { paddingBottom: 100 },
    
    // Header
    headerBg: {
        backgroundColor: '#1d4ed8',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 70,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        paddingHorizontal: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTextWrap: {
        flex: 1,
    },
    greeting: {
        color: '#ffffff',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    date: {
        color: '#e0e7ff',
        fontSize: 14,
        marginBottom: 16,
        fontWeight: '500',
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    avatarWrap: {
        position: 'relative',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#94a3b8',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1e40af',
    },
    avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#1d4ed8',
    },

    // Schedule Card
    scheduleCard: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginTop: -40,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
    },
    scheduleTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    scheduleIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    scheduleLabel: { color: '#64748b', fontSize: 12 },
    scheduleTitle: { color: '#0f172a', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    scheduleDetails: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
    scheduleDetailItem: { flexDirection: 'row', alignItems: 'center' },
    scheduleDetailTxt: { color: '#64748b', fontSize: 12, marginLeft: 4 },
    dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#cbd5e1', marginHorizontal: 4 },
    scheduleBtn: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        marginTop: 16,
        alignSelf: 'flex-end',
    },
    scheduleBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginHorizontal: 6 },

    // Sections
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 32,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    sectionLink: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '600',
    },

    // Grid Menu
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    menuCard: {
        width: (width - 52) / 2, // 20 padding left + 20 padding right + 12 gap = 52
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
    },
    menuCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    menuIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuCardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    menuCardDesc: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 16,
    },

    // Activity List
    activityContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    activityIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 2,
    },
    activitySub: {
        fontSize: 13,
        color: '#64748b',
    },
    activityRight: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        gap: 4,
    },
    activityTime: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },

    // Info Card
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        marginHorizontal: 20,
        marginTop: 32,
        borderRadius: 16,
        padding: 16,
    },
    infoText: {
        color: '#1e40af',
        fontSize: 13,
        lineHeight: 18,
        marginLeft: 12,
        flex: 1,
        fontWeight: '500',
    },
});
