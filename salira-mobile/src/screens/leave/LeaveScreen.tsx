import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Modal, TextInput, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { leaveService } from '../../services/api/leave';
import { Leave } from '../../types';

const LEAVE_TYPES = [
    { value: 'izin', label: 'Izin' },
    { value: 'sakit', label: 'Sakit' },
    { value: 'dinas_luar', label: 'Dinas Luar' },
    { value: 'cuti', label: 'Cuti' },
];

const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
};

const statusLabel: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

import { useNavigation } from '@react-navigation/native';

export default function LeaveScreen() {
    const navigation = useNavigation<any>();
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Form state
    const [type, setType] = useState('izin');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const load = useCallback(async () => {
        try {
            const res = await leaveService.getAll();
            setLeaves(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        if (!startDate || !endDate || !reason) { setErrorMsg('Semua field harus diisi'); return; }
        setSubmitting(true); setErrorMsg('');
        try {
            await leaveService.create({ type, start_date: startDate, end_date: endDate, reason });
            setShowForm(false); setType('izin'); setStartDate(''); setEndDate(''); setReason('');
            load();
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message || 'Gagal mengajukan perizinan');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        try {
            await leaveService.delete(id);
            setLeaves(prev => prev.filter(l => l.id !== id));
        } catch (e) { console.error(e); }
    };

    const renderItem = ({ item }: { item: Leave }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.typeChip}>
                    <Text style={styles.typeText}>{LEAVE_TYPES.find(t => t.value === item.type)?.label ?? item.type}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: statusColor[item.status] + '22' }]}>
                    <Text style={[styles.statusText, { color: statusColor[item.status] }]}>{statusLabel[item.status]}</Text>
                </View>
            </View>
            <Text style={styles.dateRange}>
                <Ionicons name="calendar-outline" size={13} color="#6b7280" /> {item.start_date} — {item.end_date}
            </Text>
            <Text style={styles.reason} numberOfLines={2}>{item.reason}</Text>
            {item.status === 'pending' && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteBtnText}>Batalkan</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // compute resume stats
    const pendingCount   = leaves.filter(l => l.status === 'pending').length;
    const approvedCount  = leaves.filter(l => l.status === 'approved').length;
    const rejectedCount  = leaves.filter(l => l.status === 'rejected').length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {navigation.canGoBack() && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text style={styles.headerTitle}>Perizinan</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Kelola izin & cuti Anda</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addBtnText}>Ajukan</Text>
                </TouchableOpacity>
            </View>

            {/* ─── Resume Card ─── */}
            {!loading && (
                <View style={styles.resumeCard}>
                    <Text style={styles.resumeTitle}>Ringkasan Perizinan Tahun Ini</Text>
                    <View style={styles.resumeRow}>
                        <View style={[styles.resumeItem, { backgroundColor: '#fffbeb' }]}>
                            <Text style={[styles.resumeNum, { color: '#d97706' }]}>{pendingCount}</Text>
                            <Text style={styles.resumeLabel}>⏳ Menunggu</Text>
                        </View>
                        <View style={[styles.resumeItem, { backgroundColor: '#ecfdf5' }]}>
                            <Text style={[styles.resumeNum, { color: '#059669' }]}>{approvedCount}</Text>
                            <Text style={styles.resumeLabel}>✅ Disetujui</Text>
                        </View>
                        <View style={[styles.resumeItem, { backgroundColor: '#fef2f2' }]}>
                            <Text style={[styles.resumeNum, { color: '#dc2626' }]}>{rejectedCount}</Text>
                            <Text style={styles.resumeLabel}>❌ Ditolak</Text>
                        </View>
                        <View style={[styles.resumeItem, { backgroundColor: '#f0f9ff' }]}>
                            <Text style={[styles.resumeNum, { color: '#0891b2' }]}>{leaves.length}</Text>
                            <Text style={styles.resumeLabel}>📋 Total</Text>
                        </View>
                    </View>
                </View>
            )}

            {loading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={leaves}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={['#2563eb']} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Belum ada perizinan</Text>
                            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Tap tombol "Ajukan" di atas untuk membuat permohonan.</Text>
                        </View>
                    }
                />
            )}

            {/* Form Modal */}
            <Modal visible={showForm} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ajukan Perizinan</Text>
                            <TouchableOpacity onPress={() => setShowForm(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

                            <Text style={styles.label}>Jenis Izin</Text>
                            <View style={styles.typeGrid}>
                                {LEAVE_TYPES.map(t => (
                                    <TouchableOpacity
                                        key={t.value}
                                        style={[styles.typeBtn, type === t.value && styles.typeBtnActive]}
                                        onPress={() => setType(t.value)}
                                    >
                                        <Text style={[styles.typeBtnTxt, type === t.value && { color: '#fff' }]}>{t.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Tanggal Mulai</Text>
                            <TextInput
                                style={styles.input}
                                value={startDate}
                                onChangeText={setStartDate}
                                placeholder="YYYY-MM-DD"
                            />

                            <Text style={styles.label}>Tanggal Selesai</Text>
                            <TextInput
                                style={styles.input}
                                value={endDate}
                                onChangeText={setEndDate}
                                placeholder="YYYY-MM-DD"
                            />

                            <Text style={styles.label}>Alasan</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={reason}
                                onChangeText={setReason}
                                placeholder="Jelaskan alasan perizinan..."
                                multiline
                                numberOfLines={4}
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Ajukan Perizinan</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: {
        backgroundColor: '#2563eb', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16,
        paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    list: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    typeChip: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    typeText: { color: '#2563eb', fontWeight: '600', fontSize: 13 },
    statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontWeight: '600', fontSize: 13 },
    dateRange: { color: '#6b7280', fontSize: 13, marginBottom: 6 },
    reason: { color: '#374151', fontSize: 14, marginBottom: 8 },
    deleteBtn: { backgroundColor: '#fee2e2', borderRadius: 6, paddingVertical: 6, alignItems: 'center' },
    deleteBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
    empty: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#9ca3af', marginTop: 12, fontSize: 14 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    error: { color: '#dc2626', backgroundColor: '#fee2e2', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f3f4f6' },
    typeBtnActive: { backgroundColor: '#2563eb' },
    typeBtnTxt: { color: '#374151', fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 4 },
    textArea: { height: 100, textAlignVertical: 'top' },
    submitBtn: { backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16, marginBottom: 8 },
    submitBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    resumeCard: {
        backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, marginBottom: 4,
        borderRadius: 14, padding: 14,
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 6,
    },
    resumeTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10 },
    resumeRow: { flexDirection: 'row', gap: 8 },
    resumeItem: { flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: 10 },
    resumeNum: { fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
    resumeLabel: { fontSize: 10, color: '#6b7280', fontWeight: '600' },
});
