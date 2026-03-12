import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getGlobalStyles, getTheme, colors } from '../constants/styles';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const theme = getTheme();
    const styles = getGlobalStyles(theme);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingrese correo y contraseña');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert('Error de Autenticación', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <Text style={styles.title}>PMP Suite - Técnico</Text>

            <TextInput
                style={styles.input}
                placeholder="Correo Electrónico"
                placeholderTextColor={theme.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={theme.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
