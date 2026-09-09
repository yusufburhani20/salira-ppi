import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Modal, TextInput,
    Platform, ScrollView, KeyboardAvoidingView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { agendaService } from '../../services/api/agenda';
import { assessmentService } from '../../services/api/assessment';
import { Agenda, AcademicClass, Subject } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
    primary: '#006194',
    primaryContainer: '#007bb9',
    onPrimary: '#ffffff',
    primaryFixed: '#cce5ff',
    onPrimaryFixed: '#001d31',
    onPrimaryFixedVariant: '#004b73',
    secondary: '#006c49',
    secondaryContainer: '#6cf8bb',
    onSecondaryContainer: '#00714d',
    onSecondary: '#ffffff',
    tertiary: '#825100',
    tertiaryFixed: '#ffddb8',
    onTertiaryFixedVariant: '#653e00',
    onTertiary: '#ffffff',
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

const ATTENDANCE_STATUSES = ['Hadir', 'Sakit', 'Izin', 'Alpha'];

const JP_SCHEDULE = [
    { jp: 1, time: '07:30 - 08:05' },
    { jp: 2, time: '08:05 - 08:40' },
    { jp: 3, time: '08:40 - 09:15' },
    { jp: 4, time: '09:15 - 09:50' },
    { jp: 5, time: '10:10 - 10:45' },
    { jp: 6, time: '10:45 - 11:20' },
    { jp: 7, time: '11:20 - 11:55' },
    { jp: 8, time: '13:15 - 13:50' },
    { jp: 9, time: '13:50 - 14:25' },
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
export default function AgendaScreen() {
    const [agendas, setAgendas] = useState<Agenda[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Form data
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
    const [media, setMedia] = useState('');
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
                status: 'Hadir',
            }));
            setStudents(studentsWithStatus);
            setAttendance(studentsWithStatus.map(s => ({ student_id: s.id, status: 'Hadir' })));
        } catch (e: any) { 
            setErrorMsg('Gagal memuat siswa: ' + (e?.response?.data?.message || e.message));
        }
        finally { setLoadingStudents(false); }
    };

    const toggleJP = (jp: number) => {
        setSelectedJPs(prev => {
            if (prev.includes(jp)) return prev.filter(j => j !== jp);
            return [...prev, jp].sort((a, b) => a - b);
        });
    };

    const toggleStatus = (studentId: number, status: string) => {
        setAttendance(prev => prev.map(a => a.student_id === studentId ? { ...a, status } : a));
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
    };

    const setAllHadir = () => {
        setAttendance(prev => prev.map(a => ({ ...a, status: 'Hadir' })));
        setStudents(prev => prev.map(s => ({ ...s, status: 'Hadir' })));
    };

    const openForm = () => {
        setClassId(null); setClassName('');
        setSubjectId(null); setSubjectName('');
        setDate(new Date().toISOString().split('T')[0]);
        setSelectedJPs([]);
        setTopic(''); setMedia(''); setNotes('');
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
            const combinedNotes = media ? `Media: ${media}\nCatatan: ${notes}` : notes;
            await agendaService.create({
                academic_class_id: classId,
                subject_id: subjectId,
                date,
                lesson_hour_start: Math.min(...selectedJPs),
                lesson_hour_end: Math.max(...selectedJPs),
                topic,
                notes: combinedNotes || undefined,
                attendances: attendance.length > 0 ? attendance.map(a => ({ student_id: a.student_id, status: a.status.toLowerCase() })) : undefined,
            });
            setShowForm(false);
            load();
        } catch (e: any) {
            setErrorMsg(e?.response?.data?.message || 'Gagal menyimpan jurnal');
        } finally { setSubmitting(false); }
    };

    const summaryCount = {
        Hadir: students.filter(s => s.status === 'Hadir').length,
        Sakit: students.filter(s => s.status === 'Sakit').length,
        Izin: students.filter(s => s.status === 'Izin').length,
        Alpha: students.filter(s => s.status === 'Alpha').length,
    };

    const totalCount = agendas.length;
    const uniqueClasses = new Set(agendas.map(a => a.academic_class_id)).size;
    const totalJp = agendas.reduce((acc, curr) => acc + (curr.lesson_hour_end - curr.lesson_hour_start + 1), 0);

    const renderAgenda = ({ item }: { item: Agenda }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{item.date}</Text>
                <View style={styles.jpBadgeSmall}>
                    <Text style={styles.jpBadgeTextSmall}>JP {item.lesson_hour_start}–{item.lesson_hour_end}</Text>
                </View>
            </View>
            <Text style={styles.cardTopic}>{item.topic}</Text>
            <Text style={styles.cardMeta}>{item.class_name} · {item.subject_name}</Text>
            {item.notes ? <Text style={styles.cardNotes} numberOfLines={2}>{item.notes}</Text> : null}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header List */}
            <SafeAreaView style={styles.headerSafe}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Jurnal Mengajar</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={openForm}>
                        <Ionicons name="add" size={18} color={colors.onPrimary} />
                        <Text style={styles.addBtnText}>Buat Jurnal</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />} showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryContainer]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.banner}
                    >
                        <View style={styles.bannerHeader}>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <MaterialIcons name="assignment-ind" size={16} color={colors.surface} />
                                    <Text style={styles.bannerSub}>GURU MAPEL</Text>
                                </View>
                                <Text style={styles.bannerTitle}>Jurnal KBM</Text>
                                <Text style={styles.bannerDesc}>Catat agenda dan aktivitas mengajar harian secara praktis.</Text>
                            </View>
                        </View>
                        
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statBoxLabel}>Total Jurnal</Text>
                                <Text style={styles.statBoxVal}>{totalCount}</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statBoxLabel}>Kelas Aktif</Text>
                                <Text style={[styles.statBoxVal, { color: colors.tertiaryFixed }]}>{uniqueClasses}</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statBoxLabel}>Total JP</Text>
                                <Text style={[styles.statBoxVal, { color: colors.secondaryContainer }]}>{totalJp}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : agendas.length === 0 ? (
                    <View style={styles.empty}>
                        <MaterialIcons name="menu-book" size={56} color={colors.outlineVariant} />
                        <Text style={styles.emptyTitle}>Belum ada jurnal</Text>
                        <Text style={styles.emptyText}>Tap tombol Buat Jurnal untuk mencatat jurnal mengajar hari ini.</Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {agendas.map(item => <React.Fragment key={item.id}>{renderAgenda({ item })}</React.Fragment>)}
                    </View>
                )}
            </ScrollView>

            {/* ─── Add Journal Modal Form ─── */}
            <Modal visible={showForm} animationType="slide" transparent={false}>
                <SafeAreaView style={styles.modalSafe}>
                    {/* Sub-Header / Stepper Navigation */}
                    <View style={styles.stepperNav}>
                        <View style={styles.stepperTopRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                <TouchableOpacity style={styles.modalBackBtn} onPress={() => setShowForm(false)}>
                                    <MaterialIcons name="arrow-back" size={20} color={colors.onSurfaceVariant} />
                                </TouchableOpacity>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalTitle} numberOfLines={1}>Buat Jurnal Baru</Text>
                                    <Text style={styles.modalSubtitle} numberOfLines={1}>Semester Ganjil • KBM SMK & Pesantren</Text>
                                </View>
                            </View>
                            <View style={styles.tahapBadge}>
                                <MaterialIcons name="auto-stories" size={14} color={colors.onPrimaryFixed} />
                                <Text style={styles.tahapBadgeTxt}>2/2 Tahap</Text>
                            </View>
                        </View>
                        
                        <View style={styles.stepperIndicators}>
                            <View style={styles.stepActive}>
                                <View style={styles.stepCircleActive}><Text style={styles.stepCircleTxtActive}>✓</Text></View>
                                <Text style={styles.stepTxtActive}>1. Info KBM</Text>
                            </View>
                            <View style={styles.stepNext}>
                                <View style={styles.stepCircleNext}><Text style={styles.stepCircleTxtNext}>2</Text></View>
                                <Text style={styles.stepTxtNext}>2. Presensi Siswa</Text>
                            </View>
                        </View>
                    </View>

                    <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
                        
                        {/* Section 1: Informasi Pembelajaran Card */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionTitleRow}>
                                <View style={styles.sectionIconBox}>
                                    <MaterialIcons name="menu-book" size={20} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.sectionTitle}>Informasi Pembelajaran</Text>
                                    <Text style={styles.sectionDesc}>Detail kurikulum & rencana harian</Text>
                                </View>
                            </View>

                            {errorMsg ? (
                                <View style={styles.errorBox}>
                                    <MaterialIcons name="error-outline" size={16} color={colors.error} />
                                    <Text style={styles.errorText}>{errorMsg}</Text>
                                </View>
                            ) : null}

                            <View style={styles.formRow}>
                                <View style={styles.formCol}>
                                    <Text style={styles.label}>PILIH KELAS <Text style={{color: colors.error}}>*</Text></Text>
                                    <TouchableOpacity style={styles.inputBox} onPress={() => setShowClassModal(true)}>
                                        <Text style={[styles.inputText, !className && { color: colors.outline }]}>
                                            {className || '-- Pilih Kelas --'}
                                        </Text>
                                        <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.formCol}>
                                    <Text style={styles.label}>TANGGAL KBM <Text style={{color: colors.error}}>*</Text></Text>
                                    <TextInput
                                        style={[styles.inputBox, styles.inputText]}
                                        value={date}
                                        onChangeText={setDate}
                                        placeholder="YYYY-MM-DD"
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>MATA PELAJARAN <Text style={{color: colors.error}}>*</Text></Text>
                            <TouchableOpacity style={styles.inputBox} onPress={() => setShowSubjectModal(true)}>
                                <Text style={[styles.inputText, !subjectName && { color: colors.outline }]}>
                                    {subjectName || '-- Pilih Mata Pelajaran --'}
                                </Text>
                                <MaterialIcons name="expand-more" size={20} color={colors.onSurfaceVariant} />
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                <Text style={styles.label}>JAM PELAJARAN AKTIF <Text style={{color: colors.error}}>*</Text></Text>
                                <Text style={styles.jamCount}>{selectedJPs.length} Jam Terpilih</Text>
                            </View>
                            
                            <View style={styles.jpGrid}>
                                {JP_SCHEDULE.map(({ jp, time }) => {
                                    const active = selectedJPs.includes(jp);
                                    return (
                                        <TouchableOpacity
                                            key={jp}
                                            style={[styles.jpChip, active && styles.jpChipActive]}
                                            onPress={() => toggleJP(jp)}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={[styles.jpChipTitle, active && styles.jpChipTitleActive]}>Jam {jp}</Text>
                                                <MaterialIcons name={active ? "check-circle" : "radio-button-unchecked"} size={16} color={active ? colors.onPrimary : colors.outlineVariant} />
                                            </View>
                                            <Text style={[styles.jpChipSub, active && styles.jpChipSubActive]}>{time}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <Text style={styles.label}>TUJUAN PEMBELAJARAN HARI INI <Text style={{color: colors.error}}>*</Text></Text>
                            <View style={styles.textAreaBox}>
                                <TextInput
                                    style={styles.textArea}
                                    value={topic}
                                    onChangeText={setTopic}
                                    placeholder="Apa tujuan pembelajaran hari ini?"
                                    placeholderTextColor={colors.outline}
                                    multiline
                                />
                            </View>

                            <Text style={styles.label}>MODEL & MEDIA PEMBELAJARAN</Text>
                            <View style={styles.textAreaBox}>
                                <TextInput
                                    style={styles.textArea}
                                    value={media}
                                    onChangeText={setMedia}
                                    placeholder="Tuliskan model dan media pembelajaran yang digunakan..."
                                    placeholderTextColor={colors.outline}
                                    multiline
                                />
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                <Text style={styles.label}>CATATAN & PERKEMBANGAN SISWA</Text>
                                <Text style={{ fontSize: 10, color: colors.onSurfaceVariant }}>Opsional</Text>
                            </View>
                            <View style={styles.textAreaBox}>
                                <TextInput
                                    style={styles.textArea}
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder="Catatan adab santri, kendala praktikum lab, atau santri berprestasi..."
                                    placeholderTextColor={colors.outline}
                                    multiline
                                />
                            </View>
                        </View>

                        {/* Section 2: Presensi Santri KBM Card */}
                        {classId && (
                            <View style={styles.sectionCard}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <View style={styles.sectionTitleRow}>
                                        <View style={[styles.sectionIconBox, { backgroundColor: colors.secondary + '1A' }]}>
                                            <MaterialIcons name="how-to-reg" size={20} color={colors.secondary} />
                                        </View>
                                        <View>
                                            <Text style={styles.sectionTitle}>Presensi Siswa</Text>
                                            <Text style={styles.sectionDesc}>Roster Kehadiran {className}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.totalSiswaBadge}>
                                        <Text style={styles.totalSiswaTxt}>{students.length} Siswa</Text>
                                    </View>
                                </View>

                                <View style={styles.summaryStrip}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondary }} />
                                        <Text style={styles.summaryTxt}>
                                            {summaryCount.Hadir} Hadir, {summaryCount.Sakit} Sakit, {summaryCount.Izin} Izin, {summaryCount.Alpha} Alpha
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={styles.btnSemuaHadir} onPress={setAllHadir}>
                                        <MaterialIcons name="done-all" size={14} color={colors.onSecondary} />
                                        <Text style={styles.btnSemuaHadirTxt}>Semua Hadir</Text>
                                    </TouchableOpacity>
                                </View>

                                {loadingStudents ? (
                                    <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
                                ) : students.length === 0 ? (
                                    <Text style={{ textAlign: 'center', color: colors.outline, paddingVertical: 20 }}>Tidak ada siswa di kelas ini</Text>
                                ) : (
                                    <View style={styles.rosterContainer}>
                                        {students.map((student, idx) => {
                                            const currentStatus = attendance.find(a => a.student_id === student.id)?.status || 'Hadir';
                                            return (
                                                <View key={student.id} style={styles.rosterItem}>
                                                    <View style={styles.rosterHeader}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                                            <View style={styles.rosterNoBox}>
                                                                <Text style={styles.rosterNoTxt}>{idx + 1}</Text>
                                                            </View>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={styles.rosterName} numberOfLines={1}>{student.name}</Text>
                                                                <Text style={styles.rosterNisn}>NISN: {student.nisn}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={[styles.statusIndicator, 
                                                            currentStatus === 'Hadir' ? { backgroundColor: colors.secondary + '26' } :
                                                            currentStatus === 'Sakit' ? { backgroundColor: colors.tertiaryFixed } :
                                                            currentStatus === 'Izin' ? { backgroundColor: colors.primaryFixed } :
                                                            { backgroundColor: colors.errorContainer }
                                                        ]}>
                                                            <Text style={[styles.statusIndicatorTxt, 
                                                                currentStatus === 'Hadir' ? { color: colors.secondary } :
                                                                currentStatus === 'Sakit' ? { color: colors.onTertiaryFixedVariant } :
                                                                currentStatus === 'Izin' ? { color: colors.onPrimaryFixedVariant } :
                                                                { color: colors.error }
                                                            ]}>{currentStatus}</Text>
                                                        </View>
                                                    </View>

                                                    <View style={styles.pillContainer}>
                                                        {ATTENDANCE_STATUSES.map(s => {
                                                            const isActive = currentStatus === s;
                                                            return (
                                                                <TouchableOpacity 
                                                                    key={s} 
                                                                    style={[styles.pillBtn, 
                                                                        isActive && s === 'Hadir' ? { backgroundColor: colors.secondary } :
                                                                        isActive && s === 'Sakit' ? { backgroundColor: colors.tertiary } :
                                                                        isActive && s === 'Izin' ? { backgroundColor: colors.primary } :
                                                                        isActive && s === 'Alpha' ? { backgroundColor: colors.error } : null
                                                                    ]}
                                                                    onPress={() => toggleStatus(student.id, s)}
                                                                >
                                                                    <Text style={[styles.pillTxt, isActive ? { color: '#fff', fontWeight: 'bold' } : null]}>{s}</Text>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.infoNotice}>
                            <MaterialIcons name="verified-user" size={22} color={colors.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoNoticeTitle}>Sinkronisasi Kehadiran Otomatis</Text>
                                <Text style={styles.infoNoticeDesc}>Data presensi ini akan langsung terhubung ke raport karakter santri & laporan ke wali murid.</Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Bottom Floating Action Bar */}
                    <View style={styles.bottomFab}>
                        <TouchableOpacity style={styles.fabCancel} onPress={() => setShowForm(false)}>
                            <Text style={styles.fabCancelTxt}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.fabSubmit, submitting && { opacity: 0.6 }]} 
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            <LinearGradient
                                colors={[colors.primary, colors.primaryContainer]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.fabGradient}
                            >
                                {submitting ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <MaterialIcons name="task-alt" size={20} color="#fff" />
                                        <Text style={styles.fabSubmitTxt}>Simpan Jurnal & Absensi</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
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
    container: { flex: 1, backgroundColor: colors.surface },
    headerSafe: { backgroundColor: colors.surfaceContainerLowest, borderBottomWidth: 1, borderBottomColor: colors.surfaceContainerLow },
    header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: colors.onSurface, fontSize: 20, fontWeight: 'bold' },
    addBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 6,
    },
    addBtnText: { color: colors.onPrimary, fontWeight: 'bold', fontSize: 14 },
    list: { padding: 16, paddingBottom: 100 },
    
    // Banner
    banner: { borderRadius: 16, padding: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 16 },
    bannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bannerSub: { fontSize: 10, fontWeight: 'bold', color: '#cce5ff', letterSpacing: 0.5 },
    bannerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
    bannerDesc: { fontSize: 12, color: '#cce5ff', maxWidth: '85%' },
    statsRow: { flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 8, alignItems: 'center' },
    statBoxLabel: { fontSize: 10, color: '#cce5ff', marginBottom: 2 },
    statBoxVal: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },

    card: {
        backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 16,
        elevation: 2, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardDate: { fontSize: 12, color: colors.onSurfaceVariant, fontWeight: '600' },
    jpBadgeSmall: { backgroundColor: colors.primaryFixed, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    jpBadgeTextSmall: { fontSize: 10, color: colors.onPrimaryFixed, fontWeight: 'bold' },
    cardTopic: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface, marginBottom: 4 },
    cardMeta: { fontSize: 12, color: colors.onSurfaceVariant },
    cardNotes: { fontSize: 12, color: colors.outline, fontStyle: 'italic', marginTop: 8 },
    empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface, marginTop: 16, marginBottom: 6 },
    emptyText: { color: colors.outline, fontSize: 12, textAlign: 'center', lineHeight: 18 },

    // Modal UI
    modalSafe: { flex: 1, backgroundColor: colors.surface },
    stepperNav: {
        backgroundColor: 'rgba(250, 248, 255, 0.95)',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: 'rgba(19,27,46,0.05)',
        elevation: 4, zIndex: 10,
    },
    stepperTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    modalBackBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface },
    modalSubtitle: { fontSize: 10, color: colors.onSurfaceVariant },
    tahapBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryFixed + '99', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    tahapBadgeTxt: { fontSize: 10, fontWeight: 'bold', color: colors.onPrimaryFixed },
    stepperIndicators: { flexDirection: 'row', gap: 8, marginTop: 4 },
    stepActive: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceContainerHigh, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    stepCircleActive: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    stepCircleTxtActive: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    stepTxtActive: { fontSize: 10, fontWeight: 'bold', color: colors.onSurface },
    stepNext: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.secondaryContainer + 'CC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    stepCircleNext: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
    stepCircleTxtNext: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    stepTxtNext: { fontSize: 10, fontWeight: 'bold', color: colors.onSecondaryContainer },
    
    formContent: { padding: 16, paddingBottom: 100 },
    sectionCard: {
        backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 16,
        elevation: 1, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10,
    },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    sectionIconBox: { width: 32, height: 32, borderRadius: 12, backgroundColor: colors.primary + '1A', justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.onSurface },
    sectionDesc: { fontSize: 12, color: colors.onSurfaceVariant },
    totalSiswaBadge: { backgroundColor: colors.secondaryContainer, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    totalSiswaTxt: { fontSize: 10, fontWeight: 'bold', color: colors.onSecondaryContainer },

    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.errorContainer, padding: 12, borderRadius: 8, marginBottom: 16 },
    errorText: { color: colors.error, fontSize: 12, flex: 1 },
    
    formRow: { flexDirection: 'row', gap: 12 },
    formCol: { flex: 1 },
    label: { fontSize: 10, fontWeight: 'bold', color: colors.onSurfaceVariant, marginBottom: 6, marginTop: 12 },
    inputBox: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: colors.surfaceContainerLow, borderRadius: 12, paddingHorizontal: 12, height: 44,
    },
    inputText: { fontSize: 14, color: colors.onSurface, flex: 1 },
    
    jamCount: { fontSize: 10, fontWeight: 'bold', color: colors.primary },
    jpGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    jpChip: {
        width: '31%', backgroundColor: colors.surfaceContainerLow, padding: 8, borderRadius: 12,
    },
    jpChipActive: { backgroundColor: colors.primary },
    jpChipTitle: { fontSize: 12, fontWeight: 'bold', color: colors.onSurface },
    jpChipTitleActive: { color: colors.onPrimary },
    jpChipSub: { fontSize: 9, color: colors.onSurfaceVariant, marginTop: 2 },
    jpChipSubActive: { color: 'rgba(255,255,255,0.8)' },
    
    textAreaBox: { backgroundColor: colors.surfaceContainerLow, borderRadius: 12, padding: 12 },
    textArea: { fontSize: 14, color: colors.onSurface, minHeight: 60, textAlignVertical: 'top' },

    summaryStrip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceContainerLow, padding: 8, borderRadius: 12, marginBottom: 12 },
    summaryTxt: { fontSize: 10, fontWeight: 'bold', color: colors.onSurface },
    btnSemuaHadir: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    btnSemuaHadirTxt: { fontSize: 10, fontWeight: 'bold', color: colors.onSecondary },

    rosterContainer: { flexDirection: 'column', gap: 10 },
    rosterItem: { backgroundColor: colors.surfaceContainerLow, padding: 12, borderRadius: 12 },
    rosterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    rosterNoBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryFixed, justifyContent: 'center', alignItems: 'center' },
    rosterNoTxt: { fontSize: 10, fontWeight: 'bold', color: colors.onPrimaryFixed },
    rosterName: { fontSize: 12, fontWeight: 'bold', color: colors.onSurface },
    rosterNisn: { fontSize: 10, color: colors.onSurfaceVariant },
    statusIndicator: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    statusIndicatorTxt: { fontSize: 10, fontWeight: 'bold' },
    pillContainer: { flexDirection: 'row', backgroundColor: colors.surfaceContainer, padding: 4, borderRadius: 12, gap: 6 },
    pillBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
    pillTxt: { fontSize: 10, fontWeight: '600', color: colors.onSurfaceVariant },

    infoNotice: { flexDirection: 'row', gap: 12, backgroundColor: colors.primaryFixed + '66', padding: 14, borderRadius: 16, marginBottom: 20 },
    infoNoticeTitle: { fontSize: 12, fontWeight: 'bold', color: colors.onPrimaryFixed },
    infoNoticeDesc: { fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },

    bottomFab: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(250, 248, 255, 0.95)',
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        flexDirection: 'row', gap: 12,
        borderTopWidth: 1, borderTopColor: 'rgba(19,27,46,0.05)', elevation: 8,
    },
    fabCancel: { height: 48, paddingHorizontal: 20, borderRadius: 12, backgroundColor: colors.surfaceContainer, justifyContent: 'center', alignItems: 'center' },
    fabCancelTxt: { fontSize: 14, fontWeight: 'bold', color: colors.onSurfaceVariant },
    fabSubmit: { flex: 1, height: 48, borderRadius: 12, overflow: 'hidden', elevation: 4 },
    fabGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    fabSubmitTxt: { fontSize: 14, fontWeight: 'bold', color: colors.onPrimary },
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
