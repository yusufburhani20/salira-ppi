import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Modal, TextInput,
    Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { agendaService } from '../../services/api/agenda';
import { assessmentService } from '../../services/api/assessment';
import { Agenda, AcademicClass, Subject } from '../../types';

const ATTENDANCE_STATUSES = ['hadir', 'sakit', 'izin', 'alpha'];
const STATUS_COLOR: Record<string, string> = {
    hadir: '#10b981',
    sakit: '#f59e0b',
    izin: '#3b82f6',
    alpha: '#ef4444',
};
const STATUS_BG: Record<string, string> = {
    hadir: '#ecfdf5',
    sakit: '#fffbeb',
    izin: '#eff6ff',
    alpha: '#fef2f2',
};
const JP_SCHEDULE = [
    { jp: 1, time: '07.30 – 08.00' },
    { jp: 2, time: '08.01 – 09.10' },
    { jp: 3, time: '09.10 – 09.55' },
    { jp: 4, time: '09.55 – 10.30' },
    { jp: 5, time: '10.30 – 11.05' },
    { jp: 6, time: '11.05 – 11.10' },
    { jp: 7, time: '11.10 – 11.55' },
    { jp: 8, time: '11.15 – 12.50' },
    { jp: 9, time: '13.00 – 14.20' },
];

interface StudentAtt {
    id: number;
    name: string;
    nisn: string;
    status: string;
}

// ─── Premium Selector Modal ───────────────────────────────────────────────────
interface SelectorModalProps {
    visible: boolean;
    title: string;
    items: { id: number; name: string }[];
    selectedId: number | null;
    onSelect: (id: number, name: string) => void;
    onClose: () => void;
}

function SelectorModal({ visible, title, items, selectedId, onSelect, onClose }: SelectorModalProps) {
    const [search, setSearch] = useState('');
    const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={selStyles.overlay}>
                <View style={selStyles.sheet}>
                    <View style={selStyles.handle} />
                    <View style={selStyles.header}>
                        <Text style={selStyles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={selStyles.closeBtn}>
                            <Ionicons name="close" size={22} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={selStyles.search}
                        placeholder="Cari..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#9ca3af"
                    />
                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
                        {filtered.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={[selStyles.item, selectedId === item.id && selStyles.itemActive]}
                                onPress={() => { onSelect(item.id, item.name); onClose(); setSearch(''); }}
                            >
                                <Text style={[selStyles.itemText, selectedId === item.id && selStyles.itemTextActive]}>
                                    {item.name}
                                </Text>
                                {selectedId === item.id && (
                                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                                )}
                            </TouchableOpacity>
                        ))}
                        {filtered.length === 0 && (
                            <Text style={selStyles.noResult}>Tidak ada hasil</Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AgendaScreen() {
    const [agendas, setAgendas] = useState<Agenda[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Form data (dropdown options)
    const [classes, setClasses] = useState<AcademicClass[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [students, setStudents] = useState<StudentAtt[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Form state
    const [classId, setClassId] = useState<number | null>(null);
    const [className, setClassName] = useState('');
    const [subjectId, setSubjectId] = useState<number | null>(null);
    const [subjectName, setSubjectName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedJPs, setSelectedJPs] = useState<number[]>([]);
    const [topic, setTopic] = useState('');
    const [notes, setNotes] = useState('');
    const [attendance, setAttendance] = useState<{ student_id: number; status: string }[]>([]);

    // Modal state
    const [showClassModal, setShowClassModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await agendaService.getAll();
            setAgendas(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    const loadFormData = useCallback(async () => {
        try {
            const data = await agendaService.getFormData();
            setClasses(data.classes);
            setSubjects(data.subjects);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { load(); loadFormData(); }, []);

    const handleClassSelect = async (id: number, name: string) => {
        setClassId(id);
        setClassName(name);
        setStudents([]);
        setAttendance([]);
        setLoadingStudents(true);
        try {
            const data = await assessmentService.getStudents(id);
            const studentsWithStatus: StudentAtt[] = data.map((s: any) => ({
                id: s.id,
                name: s.name,
                nisn: s.nisn,
                status: 'hadir',
            }));
            setStudents(studentsWithStatus);
            setAttendance(studentsWithStatus.map(s => ({ student_id: s.id, status: 'hadir' })));
        } catch (e: any) { 
            console.error('Failed to load students', e); 
            setErrorMsg('Gagal memuat siswa: ' + (e?.response?.data?.message || e.message));
        }
        finally { setLoadingStudents(false); }
    };

    const toggleJP = (jp: number) => {
        setSelectedJPs(prev => {
            if (prev.includes(jp)) {
                return prev.filter(j => j !== jp);
            }
            return [...prev, jp].sort((a, b) => a - b);
        });
    };

    const toggleStatus = (studentId: number, status: string) => {
        setAttendance(prev =>
            prev.map(a => a.student_id === studentId ? { ...a, status } : a)
        );
        setStudents(prev =>
            prev.map(s => s.id === studentId ? { ...s, status } : s)
        );
    };

    const openForm = () => {
        setClassId(null); setClassName('');
        setSubjectId(null); setSubjectName('');
        setDate(new Date().toISOString().split('T')[0]);
        setSelectedJPs([]);
        setTopic(''); setNotes('');
        setStudents([]); setAttendance([]);
        setErrorMsg('');
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!classId || !subjectId || !topic || !date) {
            setErrorMsg('Kelas, mata pelajaran, tanggal, dan topik harus diisi');
            return;
        }
        if (selectedJPs.length === 0) {
            setErrorMsg('Pilih setidaknya satu jam pelajaran (JP)');
            return;
        }
        setSubmitting(true); setErrorMsg('');
        try {
            await agendaService.create({
                academic_class_id: classId,
                subject_id: subjectId,
                date,
                lesson_hour_start: Math.min(...selectedJPs),
                lesson_hour_end: Math.max(...selectedJPs),
                topic,
                notes: notes || undefined,
                attendances: attendance.length > 0 ? attendance : undefined,
            });
            setShowForm(false);
            load();
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message || 'Gagal menyimpan jurnal');
        } finally { setSubmitting(false); }
    };

    const renderAgenda = ({ item }: { item: Agenda }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{item.date}</Text>
                <View style={styles.jpBadge}>
                    <Text style={styles.jpBadgeText}>JP {item.lesson_hour_start}–{item.lesson_hour_end}</Text>
                </View>
            </View>
            <Text style={styles.cardTopic}>{item.topic}</Text>
            <Text style={styles.cardMeta}>{item.class_name} · {item.subject_name}</Text>
            {item.notes ? <Text style={styles.cardNotes}>{item.notes}</Text> : null}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Jurnal Mengajar</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openForm}>
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.addBtnText}>Tambah</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={agendas}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderAgenda}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); load(); }}
                            colors={['#2563eb']}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="book-outline" size={56} color="#d1d5db" />
                            <Text style={styles.emptyTitle}>Belum ada jurnal</Text>
                            <Text style={styles.emptyText}>Tap tombol Tambah untuk mencatat jurnal mengajar hari ini.</Text>
                        </View>
                    }
                />
            )}

            {/* ─── Add Journal Modal ─── */}
            <Modal visible={showForm} animationType="slide" transparent={false}>
                <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowForm(false)} style={styles.modalBackBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Buat Jurnal Baru</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                        {/* Info Pembelajaran Card */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionTitleRow}>
                                <Ionicons name="document-text" size={18} color="#2563eb" />
                                <Text style={styles.sectionTitle}>Informasi Pembelajaran</Text>
                            </View>

                            {errorMsg ? (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle" size={16} color="#dc2626" />
                                    <Text style={styles.errorText}>{errorMsg}</Text>
                                </View>
                            ) : null}

                            {/* Kelas Dropdown */}
                            <Text style={styles.label}>Pilih Kelas</Text>
                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowClassModal(true)}>
                                <Text style={[styles.dropdownText, !className && { color: '#9ca3af' }]}>
                                    {className || '-- Pilih Kelas --'}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color="#6b7280" />
                            </TouchableOpacity>

                            {/* Mata Pelajaran Dropdown */}
                            <Text style={styles.label}>Mata Pelajaran</Text>
                            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowSubjectModal(true)}>
                                <Text style={[styles.dropdownText, !subjectName && { color: '#9ca3af' }]}>
                                    {subjectName || '-- Pilih Mata Pelajaran --'}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color="#6b7280" />
                            </TouchableOpacity>

                            {/* Tanggal */}
                            <Text style={styles.label}>Tanggal</Text>
                            <TextInput
                                style={styles.input}
                                value={date}
                                onChangeText={setDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#9ca3af"
                            />

                            {/* Jam Pelajaran Grid */}
                            <Text style={styles.label}>
                                Jam Pelajaran
                                {selectedJPs.length > 0 && (
                                    <Text style={styles.labelSub}> (JP {Math.min(...selectedJPs)}–{Math.max(...selectedJPs)})</Text>
                                )}
                            </Text>
                            <View style={styles.jpGrid}>
                                {JP_SCHEDULE.map(({ jp, time }) => {
                                    const active = selectedJPs.includes(jp);
                                    return (
                                        <TouchableOpacity
                                            key={jp}
                                            style={[styles.jpCell, active && styles.jpCellActive]}
                                            onPress={() => toggleJP(jp)}
                                        >
                                            <Text style={[styles.jpNum, active && styles.jpNumActive]}>{jp}</Text>
                                            <Text style={[styles.jpTime, active && styles.jpTimeActive]}>{time}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Topik */}
                            <Text style={styles.label}>Tujuan Pembelajaran</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={topic}
                                onChangeText={setTopic}
                                placeholder="Apa tujuan pembelajaran hari ini?"
                                placeholderTextColor="#9ca3af"
                                multiline
                                numberOfLines={3}
                            />

                            {/* Catatan */}
                            <Text style={styles.label}>Model & Media Pembelajaran</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Tuliskan model dan media pembelajaran yang digunakan..."
                                placeholderTextColor="#9ca3af"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Presensi Siswa Card */}
                        {classId && (
                            <View style={styles.sectionCard}>
                                <View style={styles.sectionTitleRow}>
                                    <Ionicons name="people" size={18} color="#2563eb" />
                                    <Text style={styles.sectionTitle}>Presensi Siswa</Text>
                                    <Text style={styles.studentCountBadge}>
                                        {students.length} Siswa
                                    </Text>
                                </View>

                                {loadingStudents ? (
                                    <ActivityIndicator color="#2563eb" style={{ marginVertical: 20 }} />
                                ) : students.length === 0 ? (
                                    <Text style={styles.noStudentText}>Tidak ada siswa di kelas ini</Text>
                                ) : (
                                    <>
                                        {/* Table Header */}
                                        <View style={styles.attTableHeader}>
                                            <Text style={[styles.attHeaderCell, { flex: 0.5 }]}>NO</Text>
                                            <Text style={[styles.attHeaderCell, { flex: 3 }]}>NAMA SISWA</Text>
                                            <Text style={[styles.attHeaderCell, { flex: 2, textAlign: 'right' }]}>KEHADIRAN</Text>
                                        </View>
                                        {students.map((student, idx) => {
                                            const currentStatus = attendance.find(a => a.student_id === student.id)?.status ?? 'hadir';
                                            return (
                                                <View key={student.id} style={[styles.attRow, idx % 2 === 1 && styles.attRowEven]}>
                                                    <Text style={styles.attNo}>{idx + 1}</Text>
                                                    <View style={{ flex: 3 }}>
                                                        <Text style={styles.studentName}>{student.name}</Text>
                                                        {student.nisn ? <Text style={styles.studentNisn}>NISN: {student.nisn}</Text> : null}
                                                    </View>
                                                    <View style={styles.statusBtns}>
                                                        {ATTENDANCE_STATUSES.map(s => (
                                                            <TouchableOpacity
                                                                key={s}
                                                                style={[
                                                                    styles.statusBtn,
                                                                    currentStatus === s && { backgroundColor: STATUS_BG[s], borderColor: STATUS_COLOR[s] }
                                                                ]}
                                                                onPress={() => toggleStatus(student.id, s)}
                                                            >
                                                                <Text style={[
                                                                    styles.statusBtnText,
                                                                    currentStatus === s && { color: STATUS_COLOR[s], fontWeight: '700' }
                                                                ]}>
                                                                    {s.toUpperCase()}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </>
                                )}
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="save" size={20} color="#fff" />
                                    <Text style={styles.submitBtnText}>Simpan Jurnal & Absensi</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </Modal>

            {/* Dropdown Modals */}
            <SelectorModal
                visible={showClassModal}
                title="Pilih Kelas"
                items={classes}
                selectedId={classId}
                onSelect={handleClassSelect}
                onClose={() => setShowClassModal(false)}
            />
            <SelectorModal
                visible={showSubjectModal}
                title="Pilih Mata Pelajaran"
                items={subjects}
                selectedId={subjectId}
                onSelect={(id, name) => { setSubjectId(id); setSubjectName(name); }}
                onClose={() => setShowSubjectModal(false)}
            />
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: {
        backgroundColor: '#2563eb',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 4,
    },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    list: { padding: 16, paddingBottom: 32 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    cardDate: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
    jpBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    jpBadgeText: { fontSize: 12, color: '#2563eb', fontWeight: '700' },
    cardTopic: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
    cardMeta: { fontSize: 13, color: '#6b7280' },
    cardNotes: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic', marginTop: 4 },
    empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 17, fontWeight: 'bold', color: '#374151', marginTop: 16, marginBottom: 6 },
    emptyText: { color: '#9ca3af', fontSize: 13, textAlign: 'center', lineHeight: 20 },

    // Modal
    modalHeader: {
        backgroundColor: '#2563eb',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalBackBtn: { padding: 4 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    formScroll: { flex: 1, padding: 16 },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
    studentCountBadge: {
        backgroundColor: '#eff6ff',
        color: '#2563eb',
        fontSize: 12,
        fontWeight: '700',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    errorText: { color: '#dc2626', fontSize: 13, flex: 1 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
    labelSub: { fontSize: 13, fontWeight: '600', color: '#2563eb' },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 13,
        backgroundColor: '#fff',
    },
    dropdownText: { fontSize: 14, color: '#1f2937', flex: 1 },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1f2937',
        backgroundColor: '#fff',
    },
    textArea: { height: 90, textAlignVertical: 'top' },

    // JP Grid
    jpGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    jpCell: {
        width: '21%',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    jpCellActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    jpNum: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
    jpNumActive: { color: '#fff' },
    jpTime: { fontSize: 9, color: '#9ca3af', marginTop: 2, textAlign: 'center' },
    jpTimeActive: { color: 'rgba(255,255,255,0.75)' },

    // Attendance Table
    attTableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 8,
        marginBottom: 4,
    },
    attHeaderCell: { fontSize: 11, fontWeight: '700', color: '#6b7280', letterSpacing: 0.5 },
    attRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    attRowEven: { backgroundColor: '#fafafa', marginHorizontal: -16, paddingHorizontal: 16 },
    attNo: { flex: 0.5, fontSize: 13, color: '#6b7280' },
    studentName: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
    studentNisn: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
    statusBtns: { flex: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' },
    statusBtn: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
    },
    statusBtnText: { fontSize: 9, fontWeight: '600', color: '#6b7280' },
    noStudentText: { color: '#9ca3af', textAlign: 'center', paddingVertical: 20 },

    submitBtn: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

// ─── Selector Modal Styles ────────────────────────────────────────────────────
const selStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 32,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#d1d5db',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    title: { fontSize: 17, fontWeight: 'bold', color: '#1f2937' },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    search: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1f2937',
        marginBottom: 10,
        backgroundColor: '#f9fafb',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 2,
    },
    itemActive: { backgroundColor: '#eff6ff' },
    itemText: { fontSize: 14, color: '#374151', flex: 1 },
    itemTextActive: { color: '#2563eb', fontWeight: '600' },
    noResult: { textAlign: 'center', color: '#9ca3af', padding: 20, fontSize: 14 },
});
