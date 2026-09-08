import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    const InfoRow = ({ icon, label, value }: { icon: any; label: string; value?: string | null }) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
                <Ionicons name={icon} size={20} color="#2563eb" />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || '-'}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    {navigation.canGoBack() && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    )}
                    <View style={{ flex: 1 }} />
                </View>

                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0)?.toUpperCase() ?? 'G'}
                    </Text>
                </View>
                <Text style={styles.userName}>{user?.name}</Text>
                <View style={styles.rolesBadge}>
                    {user?.roles?.map((role, i) => (
                        <View key={i} style={styles.rolePill}>
                            <Text style={styles.rolePillText}>{role}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Info Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Informasi Akun</Text>
                <InfoRow icon="mail-outline" label="Email" value={user?.email} />
                <InfoRow icon="card-outline" label="NIP" value={user?.nip} />
                <InfoRow icon="call-outline" label="Telepon" value={user?.phone} />
                <InfoRow icon="shield-checkmark-outline" label="Status" value={user?.status} />
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>Keluar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    headerTopRow: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    backButton: { padding: 4 },
    header: {
        backgroundColor: '#2563eb',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
    userName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
    rolesBadge: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
    rolePill: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    rolePillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    infoIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
    logoutBtn: {
        backgroundColor: '#dc2626',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
