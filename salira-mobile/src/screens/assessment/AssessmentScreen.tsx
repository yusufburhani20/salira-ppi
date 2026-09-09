import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Modal, TextInput,
    Platform, ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { assessmentService } from '../../services/api/assessment';
import { Assessment, AcademicClass, Subject, Student } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
    primary: '#006194',
    onPrimary: '#ffffff',
    primaryFixed: '#cce5ff',
    onPrimaryFixed: '#001d31',
    secondary: '#006c49',
    secondaryContainer: '#6cf8bb',
    onSecondaryContainer: '#00714d',
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
    surface: '#faf8ff',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f2f3ff',
    surfaceContainer: '#eaedff',
    surfaceContainerHigh: '#e2e7ff',
    onSurface: '#131b2e',
    onSurfaceVariant: '#3f4850',
    outline: '#707881',
    outlineVariant: '#bfc7d2',
};

const ASSESSMENT_TYPES = ['Tugas', 'Ulangan Harian', 'Kuis', 'Praktik', 'Lainnya'];

// ─── Premium Selector Modal ───────────────────────────────────────────────────
interface SelectorModalProps {
    visible: boolean;
    title: string;
    items: { id: number | string; name: string }[];
    selectedId: number | string | null;
    onSelect: (id: any, name: string) => void;
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
                            <Ionicons name="close" size={22} color={colors.outline} />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={selStyles.search}
                        placeholder="Cari..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor={colors.outline}
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
                                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
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

export default function AssessmentScreen() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [classes, setClasses] = useState<AcademicClass[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const [aClassId, setAClassId] = useState<number | null>(null);
    const [aClassName, setAClassName] = useState('');
    const [aSubjectId, setASubjectId] = useState<number | null>(null);
    const [aSubjectName, setASubjectName] = useState('');
    const [aDate, setADate] = useState(new Date().toISOString().split('T')[0]);
    const [aType, setAType] = useState('Tugas');
    const [aTitle, setATitle] = useState('');
    const [aKkm, setAKkm] = useState('');
    const [scores, setScores] = useState<{ student_id: number; name: string; score: string }[]>([]);

    const [showClassModal, setShowClassModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [res, form] = await Promise.all([
                assessmentService.getAll(),
                assessmentService.getFormData()
            ]);
            setAssessments(res.data);
            setClasses(form.classes || []);
            setSubjects(form.subjects || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { loadData(); }, []);

    const handleClassChange = async (id: number, name: string) => {
        setAClassId(id);
        setAClassName(name);
        try {
            const studs = await assessmentService.getStudents(id);
            setScores(studs.map((s: Student) => ({ student_id: s.id, name: s.name, score: '' })));
        } catch (e: any) {
            setErrorMsg('Gagal memuat siswa: ' + (e?.response?.data?.message || e.message));
        }
    };

    const handleSubmit = async () => {
        if (!aClassId || !aSubjectId || !aTitle) { setErrorMsg('Kelas, mapel, dan judul harus diisi'); return; }
        setSubmitting(true); setErrorMsg('');
        try {
            await assessmentService.create({
                academic_class_id: aClassId,
                subject_id: aSubjectId,
                date: aDate,
                type: aType,
                title: aTitle,
                kkm: aKkm ? parseInt(aKkm) : undefined,
                scores: scores.filter(s => s.score !== '').map(s => ({
                    student_id: s.student_id,
                    score: parseFloat(s.score),
                })),
            });
            setShowForm(false);
            loadData();
        } catch (e: any) { setErrorMsg(e?.response?.data?.message || 'Gagal menyimpan'); }
        finally { setSubmitting(false); }
    };

    const openForm = () => {
        setErrorMsg('');
        setAClassId(null); setAClassName(''); 
        setASubjectId(null); setASubjectName('');
        setATitle(''); setAType('Tugas'); setAKkm(''); setScores([]);
        setShowForm(true);
    };

    const renderItem = ({ item }: { item: Assessment }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type}</Text>
                </View>
                <Text style={styles.cardDate}>{item.date}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.class_name} · {item.subject_name}</Text>
            
            <View style={styles.statsStrip}>
                <View style={styles.statBox}>
                    <Text style={styles.statBoxVal}>{item.scores_count}</Text>
                    <Text style={styles.statBoxLabel}>Siswa</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statBoxVal}>{item.average_score ?? '-'}</Text>
                    <Text style={styles.statBoxLabel}>Rata-rata</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statBoxVal}>{item.kkm ?? '-'}</Text>
                    <Text style={styles.statBoxLabel}>KKM</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.headerSafe}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Penilaian Kelas</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={openForm}>
                        <Ionicons name="add" size={18} color={colors.onPrimary} />
                        <Text style={styles.addBtnText}>Buat Nilai</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={assessments}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[colors.primary]} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <MaterialIcons name="fact-check" size={56} color={colors.outlineVariant} />
                            <Text style={styles.emptyTitle}>Belum ada penilaian</Text>
                            <Text style={styles.emptyText}>Tap tombol Buat Nilai untuk memasukkan nilai santri.</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={showForm} animationType="slide" transparent={false}>
                <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowForm(false)} style={styles.modalBackBtn}>
                            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitleTxt}>Buat Penilaian Baru</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView style={styles.formScroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                        {errorMsg ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={16} color={colors.error} />
                                <Text style={styles.errorText}>{errorMsg}</Text>
                            </View>
                        ) : null}

                        <View style={styles.sectionCard}>
                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>PILIH KELAS</Text>
                                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowClassModal(true)}>
                                        <Text style={[styles.inputText, !aClassName && { color: colors.outline }]}>{aClassName || '-- Kelas --'}</Text>
                                        <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>MATA PELAJARAN</Text>
                                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowSubjectModal(true)}>
                                        <Text style={[styles.inputText, !aSubjectName && { color: colors.outline }]}>{aSubjectName || '-- Mapel --'}</Text>
                                        <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>JENIS PENILAIAN</Text>
                                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowTypeModal(true)}>
                                        <Text style={styles.inputText}>{aType}</Text>
                                        <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>TANGGAL</Text>
                                    <TextInput style={[styles.inputBox, styles.inputText]} value={aDate} onChangeText={setADate} placeholder="YYYY-MM-DD" />
                                </View>
                            </View>

                            <Text style={styles.label}>JUDUL / DESKRIPSI</Text>
                            <TextInput style={[styles.inputBox, styles.inputText]} value={aTitle} onChangeText={setATitle} placeholder="Contoh: UH Bab 3 - Trigonometri" placeholderTextColor={colors.outline} />

                            <Text style={styles.label}>KKM (Opsional)</Text>
                            <TextInput style={[styles.inputBox, styles.inputText]} value={aKkm} onChangeText={setAKkm} keyboardType="numeric" placeholder="75" placeholderTextColor={colors.outline} />

                        </View>

                        {scores.length > 0 && (
                            <View style={styles.sectionCard}>
                                <Text style={[styles.label, { marginTop: 0, marginBottom: 12 }]}>INPUT NILAI SISWA</Text>
                                <View style={styles.scoreContainer}>
                                    {scores.map((s, idx) => (
                                        <View key={s.student_id} style={[styles.scoreRow, idx % 2 === 1 && styles.scoreRowEven]}>
                                            <View style={styles.scoreNoBox}><Text style={styles.scoreNoTxt}>{idx+1}</Text></View>
                                            <Text style={styles.scoreName} numberOfLines={1}>{s.name}</Text>
                                            <TextInput
                                                style={styles.scoreInput}
                                                value={s.score}
                                                onChangeText={val => {
                                                    const updated = [...scores];
                                                    updated[idx].score = val;
                                                    setScores(updated);
                                                }}
                                                keyboardType="numeric"
                                                placeholder="0-100"
                                                placeholderTextColor={colors.outlineVariant}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                    
                    <View style={styles.bottomFab}>
                        <TouchableOpacity style={[styles.btnSubmit, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting}>
                            {submitting ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <MaterialIcons name="check" size={20} color="#fff" />
                                    <Text style={styles.btnSubmitTxt}>Simpan Penilaian</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

            <SelectorModal visible={showClassModal} title="Pilih Kelas" items={classes.map(c => ({ id: c.id, name: c.name }))} selectedId={aClassId} onSelect={handleClassChange} onClose={() => setShowClassModal(false)} />
            <SelectorModal visible={showSubjectModal} title="Pilih Mata Pelajaran" items={subjects.map(s => ({ id: s.id, name: s.name }))} selectedId={aSubjectId} onSelect={(id, name) => { setASubjectId(id as number); setASubjectName(name); }} onClose={() => setShowSubjectModal(false)} />
            <SelectorModal visible={showTypeModal} title="Jenis Penilaian" items={ASSESSMENT_TYPES.map(t => ({ id: t, name: t }))} selectedId={aType} onSelect={(id) => setAType(id as string)} onClose={() => setShowTypeModal(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    headerSafe: { backgroundColor: colors.surfaceContainerLowest, borderBottomWidth: 1, borderBottomColor: colors.surfaceContainerLow },
    header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: colors.onSurface, fontSize: 20, fontWeight: 'bold' },
    addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
    addBtnText: { color: colors.onPrimary, fontWeight: 'bold', fontSize: 14 },
    list: { padding: 16, paddingBottom: 100 },
    
    card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    typeBadge: { backgroundColor: colors.primaryFixed, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    typeBadgeText: { fontSize: 10, color: colors.onPrimaryFixed, fontWeight: 'bold' },
    cardDate: { fontSize: 12, color: colors.onSurfaceVariant, fontWeight: '600' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface, marginBottom: 4 },
    cardMeta: { fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 12 },
    statsStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerLow, borderRadius: 12, paddingVertical: 8 },
    statBox: { flex: 1, alignItems: 'center' },
    statBoxVal: { fontSize: 14, fontWeight: 'bold', color: colors.onSurface },
    statBoxLabel: { fontSize: 10, color: colors.onSurfaceVariant },
    statDivider: { width: 1, height: '70%', backgroundColor: colors.outlineVariant },

    empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface, marginTop: 16, marginBottom: 6 },
    emptyText: { color: colors.outline, fontSize: 12, textAlign: 'center', lineHeight: 18 },

    // Modal UI
    modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.surfaceContainerLow },
    modalBackBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    modalTitleTxt: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface, flex: 1, textAlign: 'center' },
    formScroll: { flex: 1, padding: 16 },
    sectionCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.errorContainer, padding: 12, borderRadius: 8, marginBottom: 16 },
    errorText: { color: colors.error, fontSize: 12, flex: 1 },
    
    formRow: { flexDirection: 'row', gap: 12 },
    label: { fontSize: 10, fontWeight: 'bold', color: colors.onSurfaceVariant, marginBottom: 6, marginTop: 12 },
    inputBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceContainerLow, borderRadius: 12, paddingHorizontal: 12, height: 44 },
    inputText: { fontSize: 14, color: colors.onSurface, flex: 1 },

    scoreContainer: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.surfaceContainerLow },
    scoreRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: colors.surfaceContainerLow },
    scoreRowEven: { backgroundColor: colors.surfaceContainerLow },
    scoreNoBox: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryFixed, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    scoreNoTxt: { fontSize: 10, fontWeight: 'bold', color: colors.onPrimaryFixed },
    scoreName: { flex: 1, fontSize: 13, color: colors.onSurface, fontWeight: '500', marginRight: 12 },
    scoreInput: { width: 60, height: 36, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 8, textAlign: 'center', fontSize: 14, color: colors.onSurface, fontWeight: 'bold' },

    bottomFab: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(250, 248, 255, 0.95)', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12, borderTopWidth: 1, borderTopColor: 'rgba(19,27,46,0.05)', elevation: 8 },
    btnSubmit: { height: 48, backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    btnSubmitTxt: { fontSize: 14, fontWeight: 'bold', color: colors.onPrimary },
});

// ─── Selector Modal Styles ────────────────────────────────────────────────────
const selStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
    handle: { width: 40, height: 4, backgroundColor: '#d1d5db', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    title: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    search: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1f2937', marginBottom: 10, backgroundColor: '#f9fafb' },
    item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, marginBottom: 2 },
    itemActive: { backgroundColor: '#eff6ff' },
    itemText: { fontSize: 14, color: '#374151', flex: 1 },
    itemTextActive: { color: '#2563eb', fontWeight: '600' },
    noResult: { textAlign: 'center', color: '#9ca3af', padding: 20, fontSize: 14 },
});
