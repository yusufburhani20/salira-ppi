import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Modal, TextInput,
    Platform, ScrollView, Alert, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { eveningStudyService } from '../../services/api/eveningStudy';

const { width } = Dimensions.get('window');

const STATUSES = ['hadir', 'sakit', 'izin', 'alpha', 'terlambat'];
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; short: string }> = {
    hadir:     { label: 'Hadir',     color: '#059669', bg: '#ecfdf5', short: 'H' },
    sakit:     { label: 'Sakit',     color: '#d97706', bg: '#fffbeb', short: 'S' },
    izin:      { label: 'Izin',      color: '#2563eb', bg: '#eff6ff', short: 'I' },
    alpha:     { label: 'Alpha',     color: '#dc2626', bg: '#fef2f2', short: 'A' },
    terlambat: { label: 'Terlambat', color: '#f97316', bg: '#fff7ed', short: 'T' },
};

type EveningItem = {
    id: number; date: string; activity_name: string; notes?: string;
    class_name?: string; supervisor?: string;
    hadir_count: number; alpha_count: number; total_students: number;
};
type AttendanceRow = { student_id: number; name: string; status: string; notes: string };
type ClassItem = { id: number; name: string };

// ─── Step indicator ────────────────────────────────────────────
function StepDot({ step, current }: { step: number; current: number }) {
    const done = current > step;
    const active = current === step;
    return (
        <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={[{
                width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
            }, done ? { backgroundColor: '#7c3aed' } : active ? { backgroundColor: '#7c3aed' } : { backgroundColor: '#e5e7eb' }]}>
                {done
                    ? <Ionicons name="checkmark" size={14} color="#fff" />
                    : <Text style={{ fontSize: 12, fontWeight: 'bold', color: active ? '#fff' : '#9ca3af' }}>{step}</Text>
                }
            </View>
            <Text style={{ fontSize: 9, color: active || done ? '#7c3aed' : '#9ca3af', marginTop: 3 }}>
                {step === 1 ? 'Info' : step === 2 ? 'Absensi' : 'Selesai'}
            </Text>
        </View>
    );
}

export default function EveningStudyScreen() {
    const navigation = useNavigation<any>();
    const [records, setRecords] = useState<EveningItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [editItem, setEditItem] = useState<EveningItem | null>(null);
    const [step, setStep] = useState(1);

    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [activityName, setActivityName] = useState('');
    const [notes, setNotes] = useState('');

    const load = useCallback(async () => {
        try { const res = await eveningStudyService.getAll(); setRecords(res.data); }
        catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    const loadFormData = useCallback(async () => {
        try { const d = await eveningStudyService.getFormData(); setClasses(d.classes); }
        catch (e) { console.error(e); }
    }, []);

    useEffect(() => { load(); loadFormData(); }, []);

    const handleClassSelect = async (cls: ClassItem) => {
        setSelectedClass(cls);
        setLoadingStudents(true);
        try {
            const studs = await eveningStudyService.getStudents(cls.id);
            setAttendance(studs.map((s: any) => ({ student_id: s.id, name: s.name, status: 'hadir', notes: '' })));
        } catch (e) { console.error(e); }
        finally { setLoadingStudents(false); }
    };

    const toggleStatus = (idx: number, status: string) =>
        setAttendance(prev => prev.map((a, i) => i === idx ? { ...a, status } : a));

    const openCreate = () => {
        setEditItem(null); setStep(1); setSelectedClass(null);
        setDate(new Date().toISOString().split('T')[0]);
        setActivityName(''); setNotes(''); setAttendance([]);
        setErrorMsg(''); setShowForm(true);
    };

    const openEdit = async (item: EveningItem) => {
        try {
            const detail = await eveningStudyService.getDetail(item.id);
            setEditItem(item); setStep(1);
            setDate(typeof item.date === 'string' ? item.date : new Date().toISOString().split('T')[0]);
            setActivityName(item.activity_name);
            setNotes(item.notes || '');
            if (detail.attendance) {
                setAttendance(detail.attendance.map((a: any) => ({
                    student_id: a.student_id, name: a.student_name,
                    status: a.status, notes: a.notes || ''
                })));
            }
            setErrorMsg(''); setShowForm(true);
        } catch (e) { console.error(e); }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!activityName.trim() || !date) { setErrorMsg('Tanggal dan nama kegiatan wajib diisi.'); return; }
            if (!editItem && !selectedClass) { setErrorMsg('Pilih kelas terlebih dahulu.'); return; }
            if (attendance.length === 0 && !editItem) { setErrorMsg('Pilih kelas untuk mengisi absensi.'); return; }
        }
        setErrorMsg(''); setStep(s => s + 1);
    };

    const handleSubmit = async () => {
        setSubmitting(true); setErrorMsg('');
        try {
            const payload = {
                date, activity_name: activityName,
                notes: notes || undefined,
                attendance: attendance.map(a => ({ student_id: a.student_id, status: a.status, notes: a.notes || undefined })),
            };
            if (editItem) await eveningStudyService.update(editItem.id, payload);
            else await eveningStudyService.create({ ...payload, academic_class_id: selectedClass!.id });
            setShowForm(false); load();
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message || 'Gagal menyimpan data.');
            setStep(1);
        } finally { setSubmitting(false); }
    };

    const handleDelete = (id: number) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Hapus jurnal belajar malam ini?')) eveningStudyService.delete(id).then(load);
        } else {
            Alert.alert('Konfirmasi', 'Hapus jurnal ini?', [
                { text: 'Batal', style: 'cancel' },
                { text: 'Hapus', style: 'destructive', onPress: () => eveningStudyService.delete(id).then(load) },
            ]);
        }
    };

    // ── Stats ──
    const totalHadir = records.reduce((s, r) => s + r.hadir_count, 0);
    const totalSesi = records.length;
    const avgHadir = totalSesi > 0
        ? Math.round(records.reduce((s, r) => s + (r.hadir_count / Math.max(r.total_students, 1)) * 100, 0) / totalSesi)
        : 0;

    // ── Render Item ──
    const renderItem = ({ item }: { item: EveningItem }) => (
        <View style={st.card}>
            <View style={st.cardTop}>
                <View style={st.cardBadge}>
                    <Ionicons name="moon" size={12} color="#7c3aed" />
                    <Text style={st.cardBadgeTxt}>Belajar Malam</Text>
                </View>
                <Text style={st.cardDate}>{item.date as string}</Text>
            </View>
            <Text style={st.cardTitle}>{item.activity_name}</Text>
            {item.class_name && <Text style={st.cardClass}>📚 {item.class_name}</Text>}

            <View style={st.cardStatsRow}>
                <View style={st.cardStat}>
                    <View style={[st.cardStatDot, { backgroundColor: '#ecfdf5' }]}>
                        <Text style={{ fontSize: 14 }}>✅</Text>
                    </View>
                    <View>
                        <Text style={st.cardStatNum}>{item.hadir_count}</Text>
                        <Text style={st.cardStatLabel}>Hadir</Text>
                    </View>
                </View>
                {item.alpha_count > 0 && (
                    <View style={st.cardStat}>
                        <View style={[st.cardStatDot, { backgroundColor: '#fef2f2' }]}>
                            <Text style={{ fontSize: 14 }}>❌</Text>
                        </View>
                        <View>
                            <Text style={[st.cardStatNum, { color: '#dc2626' }]}>{item.alpha_count}</Text>
                            <Text style={st.cardStatLabel}>Alpha</Text>
                        </View>
                    </View>
                )}
                <View style={st.cardStat}>
                    <View style={[st.cardStatDot, { backgroundColor: '#f0f9ff' }]}>
                        <Text style={{ fontSize: 14 }}>👥</Text>
                    </View>
                    <View>
                        <Text style={st.cardStatNum}>{item.total_students}</Text>
                        <Text style={st.cardStatLabel}>Total</Text>
                    </View>
                </View>
            </View>

            {item.notes ? <Text style={st.cardNotes} numberOfLines={2}>{item.notes}</Text> : null}

            <View style={st.cardActions}>
                <TouchableOpacity style={st.editBtn} onPress={() => openEdit(item)}>
                    <Ionicons name="pencil-outline" size={14} color="#7c3aed" />
                    <Text style={st.editBtnTxt}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Ionicons name="trash-outline" size={14} color="#dc2626" />
                    <Text style={st.deleteBtnTxt}>Hapus</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={st.root}>
            {/* Header */}
            <SafeAreaView style={st.headerSafe}>
                <View style={st.header}>
                    <TouchableOpacity style={st.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={st.headerTitle}>Belajar Malam</Text>
                        <Text style={st.headerSub}>Jurnal & absensi malam hari</Text>
                    </View>
                    <TouchableOpacity style={st.addHeaderBtn} onPress={openCreate}>
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Stats bar */}
                <View style={st.statsBar}>
                    <View style={st.statBarItem}>
                        <Text style={st.statBarNum}>{totalSesi}</Text>
                        <Text style={st.statBarLabel}>Total Sesi</Text>
                    </View>
                    <View style={st.statBarDiv} />
                    <View style={st.statBarItem}>
                        <Text style={st.statBarNum}>{totalHadir}</Text>
                        <Text style={st.statBarLabel}>Total Hadir</Text>
                    </View>
                    <View style={st.statBarDiv} />
                    <View style={st.statBarItem}>
                        <Text style={st.statBarNum}>{avgHadir}%</Text>
                        <Text style={st.statBarLabel}>Rata-rata</Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* List */}
            {loading ? (
                <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={records}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={st.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={['#7c3aed']} />}
                    ListEmptyComponent={
                        <View style={st.empty}>
                            <View style={st.emptyIcon}><Ionicons name="moon-outline" size={40} color="#7c3aed" /></View>
                            <Text style={st.emptyTitle}>Belum Ada Jurnal</Text>
                            <Text style={st.emptyDesc}>Tap tombol + di atas untuk mencatat sesi belajar malam pertama Anda.</Text>
                            <TouchableOpacity style={st.emptyBtn} onPress={openCreate}>
                                <Text style={st.emptyBtnTxt}>+ Buat Jurnal Baru</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* ─── Form Modal ─────────────────────────────────────── */}
            <Modal visible={showForm} animationType="slide" transparent>
                <View style={st.modalOverlay}>
                    <View style={st.modalSheet}>
                        {/* Modal header */}
                        <View style={st.modalHeader}>
                            <TouchableOpacity onPress={() => { if (step > 1) setStep(s => s - 1); else setShowForm(false); }}>
                                <Ionicons name={step > 1 ? 'arrow-back' : 'close'} size={22} color="#374151" />
                            </TouchableOpacity>
                            <Text style={st.modalTitle}>{editItem ? 'Edit Jurnal' : 'Buat Jurnal Baru'}</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Step indicators */}
                        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 }}>
                            <StepDot step={1} current={step} />
                            <View style={{ flex: 0.5, height: 1, backgroundColor: step > 1 ? '#7c3aed' : '#e5e7eb', alignSelf: 'center', marginTop: -10 }} />
                            <StepDot step={2} current={step} />
                            <View style={{ flex: 0.5, height: 1, backgroundColor: step > 2 ? '#7c3aed' : '#e5e7eb', alignSelf: 'center', marginTop: -10 }} />
                            <StepDot step={3} current={step} />
                        </View>

                        {errorMsg ? <Text style={st.errorMsg}>{errorMsg}</Text> : null}

                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                            {/* Step 1: Info */}
                            {step === 1 && (
                                <View style={st.formStep}>
                                    <Text style={st.stepTitle}>Informasi Kegiatan</Text>

                                    {!editItem && (
                                        <>
                                            <Text style={st.fieldLabel}>Kelas *</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                                    {classes.map(c => (
                                                        <TouchableOpacity key={c.id}
                                                            style={[st.classBadge, selectedClass?.id === c.id && st.classBadgeActive]}
                                                            onPress={() => handleClassSelect(c)}>
                                                            <Text style={[st.classBadgeTxt, selectedClass?.id === c.id && { color: '#fff' }]}>{c.name}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </ScrollView>
                                            {loadingStudents && <Text style={{ color: '#7c3aed', fontSize: 12, marginBottom: 8 }}>Memuat siswa...</Text>}
                                            {selectedClass && attendance.length > 0 && (
                                                <Text style={{ color: '#059669', fontSize: 12, marginBottom: 8 }}>✓ {attendance.length} siswa siap diabsen</Text>
                                            )}
                                        </>
                                    )}

                                    <Text style={st.fieldLabel}>Tanggal *</Text>
                                    <TextInput style={st.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" />

                                    <Text style={st.fieldLabel}>Nama Kegiatan *</Text>
                                    <TextInput style={st.input} value={activityName} onChangeText={setActivityName}
                                        placeholder="contoh: Tahfidz, Belajar Mandiri, Piket Malam" placeholderTextColor="#9ca3af" />

                                    <Text style={st.fieldLabel}>Catatan (opsional)</Text>
                                    <TextInput style={[st.input, { height: 80, textAlignVertical: 'top' }]}
                                        value={notes} onChangeText={setNotes}
                                        placeholder="Catatan tambahan tentang kegiatan malam ini..."
                                        placeholderTextColor="#9ca3af" multiline />

                                    <TouchableOpacity style={st.nextBtn} onPress={handleNext}>
                                        <Text style={st.nextBtnTxt}>Lanjutkan ke Absensi →</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Step 2: Attendance */}
                            {step === 2 && (
                                <View style={st.formStep}>
                                    <Text style={st.stepTitle}>Absensi Siswa</Text>
                                    <Text style={st.stepDesc}>Tap status untuk setiap siswa. Tap lagi untuk mengubah.</Text>

                                    {/* Status legend */}
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                        {STATUSES.map(s => (
                                            <View key={s} style={[st.legendBadge, { backgroundColor: STATUS_CFG[s].bg }]}>
                                                <Text style={{ fontSize: 11, color: STATUS_CFG[s].color, fontWeight: '600' }}>
                                                    {STATUS_CFG[s].short} = {STATUS_CFG[s].label}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Quick actions */}
                                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                                        <TouchableOpacity style={[st.quickSetBtn, { backgroundColor: '#ecfdf5' }]}
                                            onPress={() => setAttendance(prev => prev.map(a => ({ ...a, status: 'hadir' })))}>
                                            <Text style={{ color: '#059669', fontSize: 12, fontWeight: '600' }}>✓ Semua Hadir</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[st.quickSetBtn, { backgroundColor: '#fef2f2' }]}
                                            onPress={() => setAttendance(prev => prev.map(a => ({ ...a, status: 'alpha' })))}>
                                            <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '600' }}>✗ Semua Alpha</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {attendance.map((att, idx) => (
                                        <View key={att.student_id} style={st.attRow}>
                                            <View style={[st.attAva, { backgroundColor: STATUS_CFG[att.status].bg }]}>
                                                <Text style={{ color: STATUS_CFG[att.status].color, fontWeight: 'bold', fontSize: 13 }}>
                                                    {STATUS_CFG[att.status].short}
                                                </Text>
                                            </View>
                                            <Text style={st.attName} numberOfLines={1}>{att.name}</Text>
                                            <View style={st.attStatusBtns}>
                                                {STATUSES.map(status => (
                                                    <TouchableOpacity key={status}
                                                        style={[st.attBtn, { backgroundColor: att.status === status ? STATUS_CFG[status].color : STATUS_CFG[status].bg }]}
                                                        onPress={() => toggleStatus(idx, status)}>
                                                        <Text style={[st.attBtnTxt, { color: att.status === status ? '#fff' : STATUS_CFG[status].color }]}>
                                                            {STATUS_CFG[status].short}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    ))}

                                    {attendance.length === 0 && (
                                        <Text style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>
                                            Tidak ada siswa dalam kelas ini.
                                        </Text>
                                    )}

                                    <TouchableOpacity style={st.nextBtn} onPress={handleNext}>
                                        <Text style={st.nextBtnTxt}>Lanjutkan ke Konfirmasi →</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Step 3: Confirm & Submit */}
                            {step === 3 && (
                                <View style={st.formStep}>
                                    <Text style={st.stepTitle}>Konfirmasi Data</Text>
                                    <Text style={st.stepDesc}>Periksa kembali sebelum menyimpan.</Text>

                                    <View style={st.confirmCard}>
                                        <View style={st.confirmRow}>
                                            <Text style={st.confirmKey}>Tanggal</Text>
                                            <Text style={st.confirmVal}>{date}</Text>
                                        </View>
                                        {selectedClass && (
                                            <View style={st.confirmRow}>
                                                <Text style={st.confirmKey}>Kelas</Text>
                                                <Text style={st.confirmVal}>{selectedClass.name}</Text>
                                            </View>
                                        )}
                                        <View style={st.confirmRow}>
                                            <Text style={st.confirmKey}>Kegiatan</Text>
                                            <Text style={st.confirmVal}>{activityName}</Text>
                                        </View>
                                        <View style={st.confirmRow}>
                                            <Text style={st.confirmKey}>Total Siswa</Text>
                                            <Text style={st.confirmVal}>{attendance.length}</Text>
                                        </View>
                                        <View style={st.confirmRow}>
                                            <Text style={st.confirmKey}>Hadir</Text>
                                            <Text style={[st.confirmVal, { color: '#059669' }]}>{attendance.filter(a => a.status === 'hadir').length}</Text>
                                        </View>
                                        <View style={st.confirmRow}>
                                            <Text style={st.confirmKey}>Alpha</Text>
                                            <Text style={[st.confirmVal, { color: '#dc2626' }]}>{attendance.filter(a => a.status === 'alpha').length}</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity style={[st.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
                                        {submitting
                                            ? <ActivityIndicator color="#fff" />
                                            : <Text style={st.submitBtnTxt}>🌙 {editItem ? 'Perbarui Jurnal' : 'Simpan Jurnal'}</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const st = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f3f4f6' },

    // Header
    headerSafe: { backgroundColor: '#7c3aed' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
    backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
    addHeaderBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    statsBar: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', paddingVertical: 10, paddingHorizontal: 16 },
    statBarItem: { flex: 1, alignItems: 'center' },
    statBarNum: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    statBarLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
    statBarDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },

    // List
    list: { padding: 16, paddingBottom: 80 },
    card: {
        backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
        borderLeftWidth: 3, borderLeftColor: '#7c3aed',
        elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    cardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#faf5ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
    cardBadgeTxt: { fontSize: 11, color: '#7c3aed', fontWeight: '600' },
    cardDate: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 2 },
    cardClass: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
    cardStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    cardStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    cardStatDot: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    cardStatNum: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
    cardStatLabel: { fontSize: 10, color: '#9ca3af' },
    cardNotes: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginBottom: 8 },
    cardActions: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#f9fafb', paddingTop: 10 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#faf5ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    editBtnTxt: { color: '#7c3aed', fontSize: 12, fontWeight: '700' },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    deleteBtnTxt: { color: '#dc2626', fontSize: 12, fontWeight: '700' },

    // Empty
    empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#faf5ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 6 },
    emptyDesc: { fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 18 },
    emptyBtn: { marginTop: 20, backgroundColor: '#7c3aed', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    emptyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '95%', flex: 0.95 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    errorMsg: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fef2f2', padding: 10, borderRadius: 8, fontSize: 13, color: '#dc2626' },

    // Form
    formStep: { padding: 16 },
    stepTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
    stepDesc: { fontSize: 13, color: '#6b7280', marginBottom: 14 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, color: '#1f2937', backgroundColor: '#f9fafb' },
    classBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
    classBadgeActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
    classBadgeTxt: { fontSize: 13, fontWeight: '600', color: '#374151' },
    legendBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    quickSetBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },

    // Attendance row
    attRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9fafb', gap: 8 },
    attAva: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    attName: { flex: 1, fontSize: 13, color: '#374151', fontWeight: '500' },
    attStatusBtns: { flexDirection: 'row', gap: 4 },
    attBtn: { width: 26, height: 26, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    attBtnTxt: { fontSize: 10, fontWeight: 'bold' },

    // Confirm
    confirmCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 16 },
    confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    confirmKey: { fontSize: 13, color: '#6b7280' },
    confirmVal: { fontSize: 13, fontWeight: '700', color: '#1f2937' },

    nextBtn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
    nextBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    submitBtn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    submitBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
