import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface RoleSectionProps {
    role: string;
    contextData?: any;
}

export default function RoleSection({ role, contextData }: RoleSectionProps) {
    const navigation = useNavigation<any>();

    // Modular design: you can add specific UI for specific roles here
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Menu {role}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.description}>
                    Akses khusus untuk pengguna dengan hak akses {role}.
                </Text>
                
                {/* Specific menu logic based on role */}
                {role === 'Guru' && (
                    <TouchableOpacity 
                        style={styles.actionBtn} 
                        onPress={() => navigation.navigate('Attendance')}
                    >
                        <Text style={styles.actionText}>Riwayat Presensi Pegawai</Text>
                    </TouchableOpacity>
                )}
                {role === 'Wali Kelas' && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]}>
                        <Text style={styles.actionText}>Rekap Kehadiran Anak Wali</Text>
                    </TouchableOpacity>
                )}
                {role === 'Wali Murid' && (
                    <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}
                        onPress={() => navigation.navigate('Attendance')}
                    >
                        <Text style={styles.actionText}>Cek Riwayat Presensi</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    header: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    content: {
        padding: 16,
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
    },
    actionBtn: {
        backgroundColor: '#2563eb',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 8,
    },
    actionText: {
        color: '#fff',
        fontWeight: '600',
    }
});
