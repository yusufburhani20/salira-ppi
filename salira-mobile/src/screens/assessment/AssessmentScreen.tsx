import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Modal, TextInput,
    Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { assessmentService } from '../../services/api/assessment';
import { consultationService } from '../../services/api/consultation';
import { Assessment, Consultation, AcademicClass, Subject, Student } from '../../types';

type Tab = 'assessment' | 'consultation';

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

export default function AssessmentScreen() {
    const [tab, setTab] = useState<Tab>('assessment');
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Shared form data
    const [classes, setClasses] = useState<AcademicClass[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [consCategories, setConsCategories] = useState<string[]>([]);

    // Assessment form
    const [aClassId, setAClassId] = useState<number | null>(null);
    const [aClassName, setAClassName] = useState('');
    const [aSubjectId, setASubjectId] = useState<number | null>(null);
    const [aSubjectName, setASubjectName] = useState('');
    const [aDate, setADate] = useState(new Date().toISOString().split('T')[0]);
    const [aType, setAType] = useState('Tugas');
    const [aTitle, setATitle] = useState('');
    const [aKkm, setAKkm] = useState('');
    const [scores, setScores] = useState<{ student_id: number; name: string; score: string }[]>([]);

    // Consultation form
    const [cClassId, setCClassId] = useState<number | null>(null);
    const [cClassName, setCClassName] = useState('');
    const [cStudentId, setCStudentId] = useState<number | null>(null);
    const [cStudentName, setCStudentName] = useState('');
    const [cDate, setCDate] = useState(new Date().toISOString().split('T')[0]);
    const [cCategory, setCCategory] = useState('');
    const [cDesc, setCDesc] = useState('');
    const [cFollowUp, setCFollowUp] = useState('');

    // Modal Visibility States
    const [showClassModal, setShowClassModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showConsClassModal, setShowConsClassModal] = useState(false);
    const [showConsStudentModal, setShowConsStudentModal] = useState(false);
    const [showConsCategoryModal, setShowConsCategoryModal] = useState(false);

    const loadAssessments = useCallback(async () => {
        const res = await assessmentService.getAll();
        setAssessments(res.data);
    }, []);

    const loadConsultations = useCallback(async () => {
        const res = await consultationService.getAll();
        setConsultations(res.data);
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([loadAssessments(), loadConsultations()]);
            const [aForm, cForm] = await Promise.all([assessmentService.getFormData(), consultationService.getFormData()]);
            setClasses(aForm.classes);
            setSubjects(aForm.subjects);
            setConsCategories(cForm.categories || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { loadAll(); }, []);

    const handleAssessmentClassChange = async (id: number, name: string) => {
        setAClassId(id);
        setAClassName(name);
        try {
            const studs = await assessmentService.getStudents(id);
            setScores(studs.map((s: Student) => ({ student_id: s.id, name: s.name, score: '' })));
        } catch (e: any) {
            setErrorMsg('Gagal memuat siswa: ' + (e?.response?.data?.message || e.message));
        }
    };

    const handleConsClassChange = async (id: number, name: string) => {
        setCClassId(id); 
        setCClassName(name);
        setCStudentId(null);
        setCStudentName('');
        try {
            const studs = await consultationService.getStudents(id);
            setStudents(studs);
        } catch (e: any) {
            setErrorMsg('Gagal memuat siswa: ' + (e?.response?.data?.message || e.message));
        }
    };

    const handleSubmitAssessment = async () => {
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
            loadAssessments();
        } catch (e: any) { setErrorMsg(e?.response?.data?.message || 'Gagal menyimpan'); }
        finally { setSubmitting(false); }
    };

    const handleSubmitConsultation = async () => {
        if (!cClassId || !cStudentId || !cCategory || !cDesc) { setErrorMsg('Semua field wajib diisi'); return; }
        setSubmitting(true); setErrorMsg('');
        try {
            await consultationService.create({
                student_id: cStudentId,
                academic_class_id: cClassId,
                consultation_date: cDate,
                category: cCategory,
                description: cDesc,
                follow_up: cFollowUp || undefined,
            });
            setShowForm(false);
            loadConsultations();
        } catch (e: any) { setErrorMsg(e?.response?.data?.message || 'Gagal menyimpan'); }
        finally { setSubmitting(false); }
    };

    const renderAssessment = ({ item }: { item: Assessment }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.typePill}><Text style={styles.typePillText}>{item.type}</Text></View>
                <Text style={styles.cardDate}>{item.date}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.class_name} · {item.subject_name}</Text>
            <View style={styles.statsRow}>
                <Text style={styles.statText}>📊 {item.scores_count} siswa</Text>
                {item.average_score != null && <Text style={styles.statText}>Rata-rata: {item.average_score}</Text>}
                {item.kkm != null && <Text style={styles.statText}>KKM: {item.kkm}</Text>}
            </View>
        </View>
    );

    const renderConsultation = ({ item }: { item: Consultation }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.typePill, { backgroundColor: '#f0fdf4' }]}>
                    <Text style={[styles.typePillText, { color: '#16a34a' }]}>{item.category}</Text>
                </View>
                <Text style={styles.cardDate}>{item.consultation_date}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.student_name}</Text>
            <Text style={styles.cardMeta}>{item.class_name}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            {item.follow_up ? <Text style={styles.cardFollowUp}>Tindak lanjut: {item.follow_up}</Text> : null}
        </View>
    );

    const openForm = () => {
        setErrorMsg('');
        // Reset Assessment
        setAClassId(null); setAClassName(''); 
        setASubjectId(null); setASubjectName('');
        setATitle(''); setAType('Tugas'); setAKkm(''); setScores([]);
        
        // Reset Consultation
        setCClassId(null); setCClassName('');
        setCStudentId(null); setCStudentName('');
        setCCategory(''); setCDesc(''); setCFollowUp('');
        setStudents([]);
        
        setShowForm(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>
                    {tab === 'assessment' ? 'Penilaian' : 'Konsultasi'}
                </Text>
                <TouchableOpacity style={styles.addBtn} onPress={openForm}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addBtnText}>Tambah</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabBar}>
                {(['assessment', 'consultation'] as Tab[]).map(t => (
                    <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
                        <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                            {t === 'assessment' ? 'Penilaian' : 'Konsultasi'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={tab === 'assessment' ? assessments : consultations}
                    keyExtractor={item => item.id.toString()}
                    renderItem={tab === 'assessment' ? renderAssessment : renderConsultation}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} colors={['#2563eb']} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name={tab === 'assessment' ? 'clipboard-outline' : 'chatbubbles-outline'} size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Belum ada data</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={showForm} animationType="slide" transparent={false}>
                <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowForm(false)} style={styles.modalBackBtn}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {tab === 'assessment' ? 'Tambah Penilaian' : 'Tambah Konsultasi'}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
                        {errorMsg ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={16} color="#dc2626" />
                                <Text style={styles.errorText}>{errorMsg}</Text>
                            </View>
                        ) : null}

                        <View style={styles.sectionCard}>
                            {tab === 'assessment' ? (
                                <>
                                    <Text style={styles.label}>Pilih Kelas</Text>
                                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowClassModal(true)}>
                                        <Text style={[styles.dropdownText, !aClassName && { color: '#9ca3af' }]}>
                                            {aClassName || '-- Pilih Kelas --'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={18} color="#6b7280" />
                                    </TouchableOpacity>

                                    <Text style={styles.label}>Mata Pelajaran</Text>
                                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowSubjectModal(true)}>
                                        <Text style={[styles.dropdownText, !aSubjectName && { color: '#9ca3af' }]}>
                                            {aSubjectName || '-- Pilih Mata Pelajaran --'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={18} color="#6b7280" />
                                    </TouchableOpacity>

                                    <Text style={styles.label}>Jenis Penilaian</Text>
                                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowTypeModal(true)}>
                                        <Text style={styles.dropdownText}>{aType}</Text>
                                        <Ionicons name="chevron-down" size={18} color="#6b7280" />
                                    </TouchableOpacity>

                                    <Text style={styles.label}>Judul / Deskripsi</Text>
                                    <TextInput style={styles.input} value={aTitle} onChangeText={setATitle} placeholder="Contoh: UH Bab 3 - Trigonometri" placeholderTextColor="#9ca3af" />

                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={styles.label}>Tanggal</Text>
                                            <TextInput style={styles.input} value={aDate} onChangeText={setADate} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.label}>KKM (opsional)</Text>
                                            <TextInput style={styles.input} value={aKkm} onChangeText={setAKkm} keyboardType="numeric" placeholder="75" placeholderTextColor="#9ca3af" />
                                        </View>
                                    </View>

                                    {scores.length > 0 && (
                                        <View style={{ marginTop: 24 }}>
                                            <Text style={styles.label}>Input Nilai Siswa</Text>
                                            <View style={styles.scoreContainer}>
                                                {scores.map((s, idx) => (
                                                    <View key={s.student_id} style={[styles.scoreRow, idx % 2 === 1 && styles.scoreRowEven]}>
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
                                                            placeholderTextColor="#9ca3af"
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmitAssessment} disabled={submitting}>
                                        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Simpan Penilaian</Text>}
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.label}>Pilih Kelas</Text>
                                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowConsClassModal(true)}>
                                        <Text style={[styles.dropdownText, !cClassName && { color: '#9ca3af' }]}>
                                            {cClassName || '-- Pilih Kelas --'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={18} color="#6b7280" />
                                    </TouchableOpacity>

                                    <Text style={styles.label}>Siswa</Text>
                                    <TouchableOpacity style={[styles.dropdownBtn, students.length === 0 && { opacity: 0.5 }]} onPress={() => students.length > 0 && setShowConsStudentModal(true)} disabled={students.length === 0}>
                                        <Text style={[styles.dropdownText, !cStudentName && { color: '#9ca3af' }]}>
                                            {cStudentName || (cClassId ? '-- Pilih Siswa --' : 'Pilih Kelas Dulu')}
                                        </Text>
                                        <Ionicons name="chevron-down" size={18} color="#6b7280" />
                                    </TouchableOpacity>

                                    <Text style={styles.label}>Kategori Konsultasi</Text>
                                    <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowConsCategoryModal(true)}>
                                        <Text style={[styles.dropdownText, !cCategory && { color: '#9ca3af' }]}>
                                            {cCategory || '-- Pilih Kategori --'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={18} color="#6b7280" />
                                    </TouchableOpacity>

                                    <Text style={styles.label}>Tanggal</Text>
                                    <TextInput style={styles.input} value={cDate} onChangeText={setCDate} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af" />

                                    <Text style={styles.label}>Deskripsi / Catatan</Text>
                                    <TextInput style={[styles.input, styles.textArea]} value={cDesc} onChangeText={setCDesc} placeholder="Isi catatan konsultasi..." placeholderTextColor="#9ca3af" multiline numberOfLines={4} />

                                    <Text style={styles.label}>Tindak Lanjut (opsional)</Text>
                                    <TextInput style={[styles.input, styles.textArea]} value={cFollowUp} onChangeText={setCFollowUp} placeholder="Rencana tindak lanjut..." placeholderTextColor="#9ca3af" multiline numberOfLines={3} />

                                    <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmitConsultation} disabled={submitting}>
                                        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Simpan Konsultasi</Text>}
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </Modal>

            {/* Assessment Modals */}
            <SelectorModal
                visible={showClassModal}
                title="Pilih Kelas"
                items={classes.map(c => ({ id: c.id, name: c.name }))}
                selectedId={aClassId}
                onSelect={handleAssessmentClassChange}
                onClose={() => setShowClassModal(false)}
            />
            <SelectorModal
                visible={showSubjectModal}
                title="Pilih Mata Pelajaran"
                items={subjects.map(s => ({ id: s.id, name: s.name }))}
                selectedId={aSubjectId}
                onSelect={(id, name) => { setASubjectId(id); setASubjectName(name); }}
                onClose={() => setShowSubjectModal(false)}
            />
            <SelectorModal
                visible={showTypeModal}
                title="Jenis Penilaian"
                items={ASSESSMENT_TYPES.map(t => ({ id: t, name: t }))}
                selectedId={aType}
                onSelect={(id) => setAType(id as string)}
                onClose={() => setShowTypeModal(false)}
            />

            {/* Consultation Modals */}
            <SelectorModal
                visible={showConsClassModal}
                title="Pilih Kelas"
                items={classes.map(c => ({ id: c.id, name: c.name }))}
                selectedId={cClassId}
                onSelect={handleConsClassChange}
                onClose={() => setShowConsClassModal(false)}
            />
            <SelectorModal
                visible={showConsStudentModal}
                title="Pilih Siswa"
                items={students.map(s => ({ id: s.id, name: s.name }))}
                selectedId={cStudentId}
                onSelect={(id, name) => { setCStudentId(id); setCStudentName(name); }}
                onClose={() => setShowConsStudentModal(false)}
            />
            <SelectorModal
                visible={showConsCategoryModal}
                title="Kategori Konsultasi"
                items={consCategories.map(c => ({ id: c, name: c }))}
                selectedId={cCategory}
                onSelect={(id) => setCCategory(id as string)}
                onClose={() => setShowConsCategoryModal(false)}
            />
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { backgroundColor: '#2563eb', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 4 },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabBtnActive: { borderBottomColor: '#2563eb' },
    tabBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
    tabBtnTextActive: { color: '#2563eb' },
    list: { padding: 16, paddingBottom: 32 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
    typePill: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    typePillText: { color: '#2563eb', fontWeight: '600', fontSize: 12 },
    cardDate: { fontSize: 12, color: '#9ca3af' },
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
    cardMeta: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
    cardDesc: { fontSize: 13, color: '#4b5563', lineHeight: 18 },
    cardFollowUp: { fontSize: 12, color: '#059669', marginTop: 4, fontStyle: 'italic' },
    statsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
    statText: { fontSize: 12, color: '#6b7280' },
    empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyText: { color: '#9ca3af', marginTop: 12, fontSize: 14 },

    // Modal
    modalHeader: { backgroundColor: '#2563eb', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalBackBtn: { padding: 4 },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    formScroll: { flex: 1, padding: 16 },
    sectionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fee2e2', borderRadius: 8, padding: 12, marginBottom: 12 },
    errorText: { color: '#dc2626', fontSize: 13, flex: 1 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
    dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 13, backgroundColor: '#fff' },
    dropdownText: { fontSize: 14, color: '#1f2937', flex: 1 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: '#1f2937', backgroundColor: '#fff' },
    textArea: { height: 90, textAlignVertical: 'top' },
    row: { flexDirection: 'row' },
    scoreContainer: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' },
    scoreRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    scoreRowEven: { backgroundColor: '#f9fafb' },
    scoreName: { flex: 1, fontSize: 13, color: '#374151', marginRight: 8, fontWeight: '500' },
    scoreInput: { width: 70, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, padding: 8, textAlign: 'center', fontSize: 14, backgroundColor: '#fff' },
    submitBtn: { backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 20, marginBottom: 8 },
    submitBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

// ─── Selector Modal Styles ────────────────────────────────────────────────────
const selStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
    handle: { width: 40, height: 4, backgroundColor: '#d1d5db', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    title: { fontSize: 17, fontWeight: 'bold', color: '#1f2937' },
    closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    search: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1f2937', marginBottom: 10, backgroundColor: '#f9fafb' },
    item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, marginBottom: 2 },
    itemActive: { backgroundColor: '#eff6ff' },
    itemText: { fontSize: 14, color: '#374151', flex: 1 },
    itemTextActive: { color: '#2563eb', fontWeight: '600' },
    noResult: { textAlign: 'center', color: '#9ca3af', padding: 20, fontSize: 14 },
});
