import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Platform
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = async () => {
        setErrorMsg('');
        if (!identifier || !password) {
            setErrorMsg('Silakan isi email/NISN dan password');
            return;
        }
        setLoading(true);
        try {
            await login(identifier, password);
        } catch (error: any) {
            console.error('Login error:', error);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Gagal login, periksa kembali kredensial Anda.';
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>SALIRA Mobile</Text>
            <Text style={styles.subtitle}>Sistem Aplikasi Layanan Informasi Terpadu</Text>

            <View style={styles.form}>
                {errorMsg ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </View>
                ) : null}

                <Text style={styles.label}>Email / NIS / NISN</Text>
                <TextInput
                    style={styles.input}
                    value={identifier}
                    onChangeText={setIdentifier}
                    placeholder="Masukkan Email atau NISN"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    // Web: handle Enter key to move to password
                    onSubmitEditing={() => {}}
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Masukkan Password"
                    secureTextEntry
                    // Web: handle Enter key to submit
                    onSubmitEditing={handleLogin}
                    returnKeyType="done"
                />

                {/* Use native <button> on web for guaranteed click handling */}
                {Platform.OS === 'web' ? (
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#93c5fd' : '#2563eb',
                            color: '#fff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            padding: '14px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: 8,
                            width: '100%',
                        } as any}
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Masuk</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2563eb',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    errorBox: {
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2563eb',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
