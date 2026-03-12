import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getGlobalStyles, getTheme, colors } from '../constants/styles';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const theme = getTheme();
    const styles = getGlobalStyles(theme);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20, color: theme.muted }}>{user?.email}</Text>

            <View style={{ gap: 15 }}>
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: colors.primary, borderWidth: 0 }]}
                    onPress={() => navigation.navigate('NewOrder')}
                >
                    <Text style={[styles.buttonText, { textAlign: 'center', color: '#111' }]}>
                        + Nueva Orden de Servicio
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => Alert.alert('Info', 'Funcionalidad Historial Próximamente')}
                >
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: theme.text }}>
                        Mis Órdenes Recientes
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.danger, marginTop: 40 }]}
                onPress={logout}
            >
                <Text style={[styles.buttonText, { color: '#fff' }]}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
