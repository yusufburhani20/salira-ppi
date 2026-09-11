import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const MENU_GROUPS = [
    {
        group: 'Akademik',
        icon: 'school-outline',
        color: '#2563eb',
        items: [
            { label: 'Jurnal Mengajar', icon: 'book-outline', tab: 'Jurnal', desc: 'Catat agenda dan materi KBM', color: '#059669', bg: '#ecfdf5' },
            { label: 'Penilaian Harian', icon: 'clipboard-outline', tab: 'Penilaian', desc: 'Input nilai tugas, UH, kuis', color: '#d97706', bg: '#fffbeb' },
            { label: 'Ujian Akhir (ASAS/ASAT)', icon: 'document-text-outline', tab: 'Penilaian', desc: 'Nilai ujian tengah & akhir semester', color: '#dc2626', bg: '#fef2f2' },
        ],
    },
    {
        group: 'Bimbingan Siswa',
        icon: 'people-outline',
        color: '#0891b2',
        items: [
            { label: 'Konsultasi / Bimbingan', icon: 'chatbubbles-outline', tab: 'Penilaian', desc: 'Catat catatan bimbingan siswa', color: '#0891b2', bg: '#ecfeff' },
        ],
    },
    {
        group: 'Kehadiran',
        icon: 'finger-print-outline',
        color: '#2563eb',
        items: [
            { label: 'Presensi Saya', icon: 'finger-print-outline', tab: 'Presensi', desc: 'Check-in & riwayat kehadiran', color: '#2563eb', bg: '#eff6ff' },
        ],
    },
    {
        group: 'Asrama & Malam',
        icon: 'moon-outline',
        color: '#7c3aed',
        items: [
            { label: 'Belajar Malam', icon: 'moon-outline', screen: 'EveningStudy', desc: 'Jurnal & absensi belajar malam', color: '#7c3aed', bg: '#faf5ff' },
        ],
    },
    {
        group: 'Administrasi',
        icon: 'folder-outline',
        color: '#64748b',
        items: [
            { label: 'Perizinan & Cuti', icon: 'document-text-outline', screen: 'Leave', desc: 'Ajukan izin, sakit, atau cuti', color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Notifikasi', icon: 'notifications-outline', tab: 'Notifikasi', desc: 'Pemberitahuan & pengumuman sistem', color: '#dc2626', bg: '#fef2f2' },
            { label: 'Profil & Akun', icon: 'person-outline', screen: 'Profile', desc: 'Data diri, NIP, dan pengaturan akun', color: '#64748b', bg: '#f8fafc' },
        ],
    },
];

export default function AllMenuScreen() {
    const navigation = useNavigation<any>();

    const handleNav = (item: any) => {
        if (item.tab) navigation.navigate('MainTabs', { screen: item.tab });
        else if (item.screen) navigation.navigate(item.screen);
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.headerSafe}>
                <View style={styles.header}>
                    {Platform.OS !== 'web' ? (
                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={22} color="#1f2937" />
                        </TouchableOpacity>
                    ) : (
                        <button onClick={() => navigation.goBack()} style={styles.backBtnWeb as any}>
                            ← 
                        </button>
                    )}
                    <View>
                        <Text style={styles.headerTitle}>Semua Menu</Text>
                        <Text style={styles.headerSub}>Akses semua fitur SALIRA</Text>
                    </View>
                    <View style={{ width: 36 }} />
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {MENU_GROUPS.map((group, gi) => (
                    <View key={gi} style={styles.groupContainer}>
                        <View style={styles.groupHeader}>
                            <View style={[styles.groupIconBox, { backgroundColor: group.color + '18' }]}>
                                <Ionicons name={group.icon as any} size={16} color={group.color} />
                            </View>
                            <Text style={styles.groupTitle}>{group.group}</Text>
                        </View>
                        <View style={styles.groupCard}>
                            {group.items.map((item, ii) => (
                                <TouchableOpacity
                                    key={ii}
                                    style={[styles.menuRow, ii < group.items.length - 1 && styles.menuRowBorder]}
                                    onPress={() => handleNav(item)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                                        <Ionicons name={item.icon as any} size={22} color={item.color} />
                                    </View>
                                    <View style={styles.menuText}>
                                        <Text style={styles.menuLabel}>{item.label}</Text>
                                        <Text style={styles.menuDesc}>{item.desc}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    headerSafe: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 14,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center', alignItems: 'center',
    },
    backBtnWeb: {
        background: '#f3f4f6', border: 'none', borderRadius: 10,
        width: 36, height: 36, cursor: 'pointer', fontSize: 16,
    } as any,
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', textAlign: 'center' },
    headerSub: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
    content: { padding: 16 },
    groupContainer: { marginBottom: 20 },
    groupHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginBottom: 8, paddingHorizontal: 4,
    },
    groupIconBox: {
        width: 28, height: 28, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
    },
    groupTitle: { fontSize: 13, fontWeight: '700', color: '#374151', letterSpacing: 0.3 },
    groupCard: {
        backgroundColor: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    menuRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f9fafb',
    },
    menuIcon: {
        width: 44, height: 44, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    menuText: { flex: 1 },
    menuLabel: { fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 2 },
    menuDesc: { fontSize: 12, color: '#9ca3af' },
});
