import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Modal, TextInput,
    Platform, ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { consultationService } from '../../services/api/consultation';
import { Consultation, AcademicClass, Student } from '../../types';

const colors = {
    primary: '#006194',
    primaryContainer: '#007bb9',
    onPrimary: '#ffffff',
    primaryFixed: '#cce5ff',
    onPrimaryFixed: '#001d31',
    secondary: '#006c49',
    secondaryContainer: '#6cf8bb',
    onSecondaryContainer: '#00714d',
    secondaryFixed: '#6ffbbe',
    onSecondaryFixed: '#002113',
    tertiary: '#825100',
    tertiaryFixed: '#ffddb8',
    onTertiaryFixed: '#2a1700',
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
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

const FILTER_CATEGORIES = ['Semua', 'Kedisiplinan', 'Akademik', 'Karakter / Akhlaq', 'Keluarga & Sosial'];

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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CounselingScreen() {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Form data
    const [classes, setClasses] = useState<AcademicClass[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [consCategories, setConsCategories] = useState<string[]>([]);
    const [followUpStatuses, setFollowUpStatuses] = useState<string[]>([]);

    // Form state
    const [cClassId, setCClassId] = useState<number | null>(null);
    const [cClassName, setCClassName] = useState('');
    const [cStudentId, setCStudentId] = useState<number | null>(null);
    const [cStudentName, setCStudentName] = useState('');
    const [cDate, setCDate] = useState(new Date().toISOString().split('T')[0]);
    const [cCategory, setCCategory] = useState('');
    const [cDesc, setCDesc] = useState('');
    const [cFollowUp, setCFollowUp] = useState('');
    const [cStatus, setCStatus] = useState('Dalam Proses');

    // Modals
    const [showConsClassModal, setShowConsClassModal] = useState(false);
    const [showConsStudentModal, setShowConsStudentModal] = useState(false);
    const [showConsCategoryModal, setShowConsCategoryModal] = useState(false);
    const [showConsStatusModal, setShowConsStatusModal] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const res = await consultationService.getAll();
            setConsultations(res.data);
            const formRes = await consultationService.getFormData();
            setClasses(formRes.classes || []);
            setConsCategories(formRes.categories || []);
            setFollowUpStatuses(formRes.follow_up_statuses || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { loadData(); }, []);

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

    const handleSubmit = async () => {
        if (!cClassId || !cStudentId || !cCategory || !cDesc) {
            setErrorMsg('Kelas, siswa, kategori, dan deskripsi wajib diisi');
            return;
        }
        setSubmitting(true); setErrorMsg('');
        try {
            await consultationService.create({
                student_id: cStudentId,
                academic_class_id: cClassId,
                consultation_date: cDate,
                category: cCategory,
                description: cDesc,
                follow_up: cFollowUp || undefined,
                follow_up_status: cStatus || undefined,
            });
            setShowForm(false);
            loadData();
        } catch (e: any) { setErrorMsg(e?.response?.data?.message || 'Gagal menyimpan'); }
        finally { setSubmitting(false); }
    };

    const openForm = () => {
        setCClassId(null); setCClassName('');
        setCStudentId(null); setCStudentName('');
        setCCategory(''); setCDesc(''); setCFollowUp(''); setCStatus('Dalam Proses');
        setStudents([]); setErrorMsg('');
        setShowForm(true);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'S';
    };

    // Derived stats
    const totalCount = consultations.length;
    const processCount = consultations.filter(c => c.follow_up_status === 'Dalam Proses' || c.follow_up_status === 'Pending').length;
    const doneCount = consultations.filter(c => c.follow_up_status === 'Selesai').length;

    const filteredList = consultations.filter(c => {
        const matchCategory = activeFilter === 'Semua' || c.category === activeFilter;
        const matchSearch = c.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    const renderItem = ({ item }: { item: Consultation }) => {
        const isDone = item.follow_up_status === 'Selesai';
        const isProcess = item.follow_up_status === 'Dalam Proses';
        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardProfile}>
                        <View style={[styles.avatar, { backgroundColor: isDone ? colors.secondaryContainer : isProcess ? colors.tertiaryFixed : colors.primaryFixed }]}>
                            <Text style={[styles.avatarTxt, { color: isDone ? colors.onSecondaryContainer : isProcess ? colors.onTertiaryFixed : colors.onPrimaryFixed }]}>
                                {getInitials(item.student_name || 'A')}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardName}>{item.student_name}</Text>
                            <Text style={styles.cardMeta}>{item.class_name} • {item.consultation_date}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isDone ? colors.secondaryContainer : isProcess ? colors.tertiaryFixed : colors.surfaceContainerHigh }]}>
                        <Text style={[styles.statusBadgeTxt, { color: isDone ? colors.onSecondaryContainer : isProcess ? colors.onTertiaryFixed : colors.onSurface }]}>
                            {item.follow_up_status || 'Pending'}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.cardBody}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeTxt}>{item.category}</Text>
                        </View>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.category} Siswa</Text>
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                </View>

                {item.follow_up ? (
                    <View style={styles.cardFooter}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <MaterialIcons name="handshake" size={16} color={colors.secondary} />
                            <Text style={styles.followUpTxt} numberOfLines={1}>Tindak Lanjut: {item.follow_up}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={18} color={colors.primary} />
                    </View>
                ) : (
                    <View style={styles.cardFooter}>
                        <Text style={[styles.followUpTxt, { color: colors.outline }]}>Belum ada tindak lanjut</Text>
                        <MaterialIcons name="chevron-right" size={18} color={colors.primary} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ backgroundColor: colors.surface, flex: 1 }}>
                
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Bimbingan</Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[colors.primary]} />}
                >
                    <View style={styles.content}>
                        {/* Top Context & Quick Stats Banner */}
                        <LinearGradient
                            colors={[colors.primary, colors.primaryContainer]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.banner}
                        >
                            <View style={styles.bannerHeader}>
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                        <MaterialIcons name="assignment-ind" size={16} color={colors.secondaryFixed} />
                                        <Text style={styles.bannerSub}>GURU & WALI KELAS</Text>
                                    </View>
                                    <Text style={styles.bannerTitle}>Bimbingan Siswa</Text>
                                    <Text style={styles.bannerDesc}>Catat bimbingan problematika & capaian santri secara berkala.</Text>
                                </View>
                                <TouchableOpacity style={styles.bannerBtn} onPress={openForm}>
                                    <Ionicons name="add" size={18} color={colors.primary} />
                                    <Text style={styles.bannerBtnTxt}>Input</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.statsRow}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statBoxLabel}>Total Catatan</Text>
                                    <Text style={styles.statBoxVal}>{totalCount}</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statBoxLabel}>Diproses</Text>
                                    <Text style={[styles.statBoxVal, { color: colors.tertiaryFixed }]}>{processCount}</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statBoxLabel}>Terselesaikan</Text>
                                    <Text style={[styles.statBoxVal, { color: colors.secondaryFixed }]}>{doneCount}</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Search & Filters */}
                        <View style={styles.searchSection}>
                            <View style={styles.searchBox}>
                                <Ionicons name="search" size={20} color={colors.outline} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Cari nama santri atau judul..."
                                    placeholderTextColor={colors.outline}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                            
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                                {FILTER_CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.filterPill, activeFilter === cat && styles.filterPillActive]}
                                        onPress={() => setActiveFilter(cat)}
                                    >
                                        <Text style={[styles.filterPillTxt, activeFilter === cat && styles.filterPillTxtActive]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Timeline / List */}
                        <View style={styles.listSection}>
                            <View style={styles.listHeader}>
                                <Text style={styles.listHeaderTitle}>Riwayat Terkini</Text>
                                <Text style={styles.listHeaderSub}>Semester Ganjil 26/27</Text>
                            </View>

                            {loading ? (
                                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                            ) : filteredList.length === 0 ? (
                                <View style={styles.empty}>
                                    <MaterialIcons name="chat-bubble-outline" size={48} color={colors.outlineVariant} />
                                    <Text style={styles.emptyText}>Belum ada riwayat bimbingan</Text>
                                </View>
                            ) : (
                                filteredList.map(item => <React.Fragment key={item.id}>{renderItem({ item })}</React.Fragment>)
                            )}
                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Bottom Sheet Modal for Input */}
            <Modal visible={showForm} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        
                        <View style={styles.modalHeaderTitleBox}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={styles.modalIconBox}>
                                    <MaterialIcons name="edit-note" size={24} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.modalTitleTxt}>Input Catatan Bimbingan</Text>
                                    <Text style={styles.modalSubTxt}>Lengkapi instrumen bimbingan santri</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setShowForm(false)} style={styles.modalCloseCircle}>
                                <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '80%' }}>
                            {errorMsg ? (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                                    <Text style={styles.errorText}>{errorMsg}</Text>
                                </View>
                            ) : null}

                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>PILIH KELAS</Text>
                                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowConsClassModal(true)}>
                                        <Text style={[styles.inputText, !cClassName && { color: colors.outline }]}>{cClassName || '-- Pilih Kelas --'}</Text>
                                        <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>TANGGAL</Text>
                                    <TextInput style={[styles.inputBox, styles.inputText]} value={cDate} onChangeText={setCDate} placeholder="YYYY-MM-DD" />
                                </View>
                            </View>

                            <Text style={styles.label}>PILIH SANTRI / SISWA</Text>
                            <TouchableOpacity style={[styles.inputBox, students.length === 0 && { opacity: 0.6 }]} onPress={() => students.length > 0 && setShowConsStudentModal(true)} disabled={students.length === 0}>
                                <Text style={[styles.inputText, !cStudentName && { color: colors.outline }]}>{cStudentName || (cClassId ? '-- Pilih Siswa --' : 'Pilih Kelas Dulu')}</Text>
                                <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
                            </TouchableOpacity>

                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>KATEGORI</Text>
                                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowConsCategoryModal(true)}>
                                        <Text style={[styles.inputText, !cCategory && { color: colors.outline }]}>{cCategory || '-- Pilih Kategori --'}</Text>
                                        <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>STATUS TINDAK LANJUT</Text>
                                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowConsStatusModal(true)}>
                                        <Text style={[styles.inputText, !cStatus && { color: colors.outline }]}>{cStatus || '-- Status --'}</Text>
                                        <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.label}>DESKRIPSI KASUS / MASALAH</Text>
                            <TextInput style={[styles.inputBox, styles.textArea]} value={cDesc} onChangeText={setCDesc} placeholder="Jelaskan detail permasalahan siswa..." placeholderTextColor={colors.outline} multiline />

                            <Text style={styles.label}>RENCANA TINDAK LANJUT (Opsional)</Text>
                            <TextInput style={[styles.inputBox, styles.textArea]} value={cFollowUp} onChangeText={setCFollowUp} placeholder="Langkah apa yang akan diambil ke depan?" placeholderTextColor={colors.outline} multiline />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.btnCancel} onPress={() => setShowForm(false)}>
                                    <Text style={styles.btnCancelTxt}>Batal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btnSubmit, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting}>
                                    {submitting ? <ActivityIndicator color="#fff" /> : (
                                        <>
                                            <MaterialIcons name="check" size={18} color="#fff" />
                                            <Text style={styles.btnSubmitTxt}>Simpan Catatan</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                            
                            <View style={{ height: 24 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modals */}
            <SelectorModal
                visible={showConsClassModal} title="Pilih Kelas"
                items={classes.map(c => ({ id: c.id, name: c.name }))} selectedId={cClassId}
                onSelect={handleConsClassChange} onClose={() => setShowConsClassModal(false)}
            />
            <SelectorModal
                visible={showConsStudentModal} title="Pilih Siswa"
                items={students.map(s => ({ id: s.id, name: s.name }))} selectedId={cStudentId}
                onSelect={(id, name) => { setCStudentId(id); setCStudentName(name); }} onClose={() => setShowConsStudentModal(false)}
            />
            <SelectorModal
                visible={showConsCategoryModal} title="Kategori Konsultasi"
                items={consCategories.map(c => ({ id: c, name: c }))} selectedId={cCategory}
                onSelect={(id) => setCCategory(id as string)} onClose={() => setShowConsCategoryModal(false)}
            />
            <SelectorModal
                visible={showConsStatusModal} title="Status Tindak Lanjut"
                items={followUpStatuses.map(s => ({ id: s, name: s }))} selectedId={cStatus}
                onSelect={(id) => setCStatus(id as string)} onClose={() => setShowConsStatusModal(false)}
            />
        </View>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    header: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surfaceContainerLowest, borderBottomWidth: 1, borderBottomColor: colors.surfaceContainerLow },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.onSurface },
    content: { padding: 16, paddingBottom: 100 },
    
    // Banner
    banner: { borderRadius: 16, padding: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 16 },
    bannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bannerSub: { fontSize: 10, fontWeight: 'bold', color: colors.primaryFixed, letterSpacing: 0.5 },
    bannerTitle: { fontSize: 22, fontWeight: 'bold', color: colors.onPrimary, marginBottom: 4 },
    bannerDesc: { fontSize: 12, color: colors.primaryFixed, maxWidth: '85%' },
    bannerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.onPrimary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 4 },
    bannerBtnTxt: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
    statsRow: { flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 8, alignItems: 'center' },
    statBoxLabel: { fontSize: 10, color: colors.primaryFixed, marginBottom: 2 },
    statBoxVal: { fontSize: 18, fontWeight: 'bold', color: colors.onPrimary },

    // Search & Filters
    searchSection: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerLow, borderRadius: 12, paddingHorizontal: 12, height: 44, marginBottom: 12 },
    searchInput: { flex: 1, fontSize: 14, color: colors.onSurface },
    filterRow: { gap: 8 },
    filterPill: { backgroundColor: colors.surfaceContainerLow, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    filterPillActive: { backgroundColor: colors.primary },
    filterPillTxt: { fontSize: 12, fontWeight: 'bold', color: colors.onSurfaceVariant },
    filterPillTxtActive: { color: colors.onPrimary },

    // List
    listSection: { gap: 12 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
    listHeaderTitle: { fontSize: 14, fontWeight: 'bold', color: colors.onSurface },
    listHeaderSub: { fontSize: 12, color: colors.onSurfaceVariant },
    
    card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 16, elevation: 1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    cardProfile: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    avatarTxt: { fontSize: 16, fontWeight: 'bold' },
    cardName: { fontSize: 14, fontWeight: 'bold', color: colors.onSurface },
    cardMeta: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusBadgeTxt: { fontSize: 10, fontWeight: 'bold' },
    cardBody: { backgroundColor: colors.surfaceContainerLow, borderRadius: 12, padding: 12, marginBottom: 12 },
    categoryBadge: { backgroundColor: colors.errorContainer, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    categoryBadgeTxt: { fontSize: 10, fontWeight: 'bold', color: colors.onErrorContainer },
    cardTitle: { fontSize: 12, fontWeight: 'bold', color: colors.onSurface, flex: 1 },
    cardDesc: { fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 18 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
    followUpTxt: { fontSize: 10, color: colors.onSurfaceVariant, flex: 1 },
    
    empty: { alignItems: 'center', marginTop: 40 },
    emptyText: { fontSize: 14, color: colors.outline, marginTop: 12 },

    // Modal Sheet
    modalOverlay: { flex: 1, backgroundColor: 'rgba(40,48,68,0.4)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: colors.surfaceContainerLowest, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingTop: 12 },
    modalHandle: { width: 48, height: 6, borderRadius: 3, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: 16 },
    modalHeaderTitleBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primaryFixed, justifyContent: 'center', alignItems: 'center' },
    modalTitleTxt: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface },
    modalSubTxt: { fontSize: 12, color: colors.onSurfaceVariant },
    modalCloseCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.errorContainer, padding: 12, borderRadius: 8, marginBottom: 16 },
    errorText: { color: colors.error, fontSize: 12, flex: 1 },
    
    formRow: { flexDirection: 'row', gap: 8 },
    label: { fontSize: 10, fontWeight: 'bold', color: colors.onSurfaceVariant, marginTop: 12, marginBottom: 6 },
    inputBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceContainerLow, borderRadius: 12, paddingHorizontal: 12, height: 44 },
    inputText: { fontSize: 14, color: colors.onSurface, flex: 1 },
    textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
    
    modalActions: { flexDirection: 'row', gap: 8, marginTop: 24 },
    btnCancel: { flex: 1, height: 48, backgroundColor: colors.surfaceContainer, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    btnCancelTxt: { fontSize: 14, fontWeight: 'bold', color: colors.onSurface },
    btnSubmit: { flex: 2, height: 48, backgroundColor: colors.primary, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, elevation: 2 },
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
