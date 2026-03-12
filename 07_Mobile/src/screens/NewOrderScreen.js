import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Switch, Image, Modal, FlatList, StyleSheet } from 'react-native';
import { getGlobalStyles, getTheme, colors } from '../constants/styles';
import api from '../services/api';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

// DATOS MAESTROS (Simulados por ahora, en futuro venir de /api/terminales)
const TERMINALES = [
    { id: 1, nombre: 'El Conquistador' },
    { id: 2, nombre: 'Los Libertadores' },
    { id: 3, nombre: 'Las Torres' },
];

const PSTS = [
    { codigo: 'U2', nombre: 'SUBUS' },
    { codigo: 'U3', nombre: 'Vule' },
    { codigo: 'U4', nombre: 'Metbus' },
    { codigo: 'U5', nombre: 'Redbus' },
    { codigo: 'U7', nombre: 'STP' },
];

const FALLAS_COMUNES = [
    "Pantalla oscura / No enciende",
    "No lee tarjeta Bip!",
    "Problema de audio",
    "Falla de impresión",
    "Touch no responde",
    "Daño físico (Vandalismo)",
    "Otro"
];

export default function NewOrderScreen() {
    const [form, setForm] = useState({
        tipo: 'VALIDADOR',
        bus_ppu: '',
        serie_equipo: '',
        falla: '',
        modelo: '',
        marca: '',
        es_pod: false,
        terminal_id: 1,
        pst_codigo: 'U7'
    });

    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Estados para Modales de Selección
    const [modalTerminalVisible, setModalTerminalVisible] = useState(false);
    const [modalPstVisible, setModalPstVisible] = useState(false);
    const [isOtroFalla, setIsOtroFalla] = useState(false);

    const navigation = useNavigation();
    const theme = getTheme();
    const styles = getGlobalStyles(theme);

    const handleChange = (key, value) => {
        setForm({ ...form, [key]: value });
    };

    const setTipo = (tipo) => {
        setForm({ ...form, tipo });
    }

    const handleFallaSelect = (fallaSeleccionada) => {
        if (fallaSeleccionada === "Otro") {
            setIsOtroFalla(true);
            setForm({ ...form, falla: '' });
        } else {
            setIsOtroFalla(false);
            setForm({ ...form, falla: fallaSeleccionada });
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permiso requerido", "Se requiere acceso a la cámara");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!form.bus_ppu || !form.serie_equipo || !form.falla) {
            Alert.alert('Error', 'Complete PPU, Serie y Falla');
            return;
        }

        if (form.es_pod && !image) {
            Alert.alert('Requerido', 'Debe tomar una foto si el equipo es POD');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/os/crear', form);
            Alert.alert('Éxito', 'OS Creada: ' + response.data.os.codigo_os);
            navigation.goBack();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || error.message;
            Alert.alert('Error', 'No se pudo crear la OS: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    // Render Item para listas de selección
    const renderSelectorItem = (item, type) => {
        const isSelected = type === 'terminal'
            ? item.id === form.terminal_id
            : item.codigo === form.pst_codigo;

        return (
            <TouchableOpacity
                style={[
                    styles.card,
                    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderColor: isSelected ? colors.primary : theme.border }
                ]}
                onPress={() => {
                    if (type === 'terminal') {
                        setForm({ ...form, terminal_id: item.id });
                        setModalTerminalVisible(false);
                    } else {
                        setForm({ ...form, pst_codigo: item.codigo });
                        setModalPstVisible(false);
                    }
                }}
            >
                <Text style={{ color: theme.text, fontWeight: isSelected ? 'bold' : 'normal' }}>
                    {item.nombre} {type === 'pst' ? `(${item.codigo})` : ''}
                </Text>
                {isSelected && <Text style={{ color: colors.primary }}>✓</Text>}
            </TouchableOpacity>
        );
    };

    const getTerminalNombre = () => TERMINALES.find(t => t.id === form.terminal_id)?.nombre || 'Seleccionar';
    const getPstNombre = () => PSTS.find(p => p.codigo === form.pst_codigo)?.nombre || 'Seleccionar';

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Nueva OS</Text>

            {/* TIPO DE EQUIPO */}
            <Text style={styles.label}>Tipo de Equipo</Text>
            <View style={{ flexDirection: 'row', marginBottom: 15, gap: 10 }}>
                <TouchableOpacity
                    style={[styles.button, { flex: 1, marginTop: 0, backgroundColor: form.tipo === 'VALIDADOR' ? colors.primary : theme.card, borderWidth: 1, borderColor: theme.border }]}
                    onPress={() => setTipo('VALIDADOR')}
                >
                    <Text style={[styles.buttonText, { color: form.tipo === 'VALIDADOR' ? '#111' : theme.text }]}>Validador</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, { flex: 1, marginTop: 0, backgroundColor: form.tipo === 'CONSOLA' ? colors.primary : theme.card, borderWidth: 1, borderColor: theme.border }]}
                    onPress={() => setTipo('CONSOLA')}
                >
                    <Text style={[styles.buttonText, { color: form.tipo === 'CONSOLA' ? '#111' : theme.text }]}>Consola</Text>
                </TouchableOpacity>
            </View>

            {/* SELECTORES TERMINAL Y PST */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Terminal</Text>
                    <TouchableOpacity style={styles.input} onPress={() => setModalTerminalVisible(true)}>
                        <Text style={{ color: theme.text }}>{getTerminalNombre()}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.label}>PST (Operador)</Text>
                    <TouchableOpacity style={styles.input} onPress={() => setModalPstVisible(true)}>
                        <Text style={{ color: theme.text }}>{getPstNombre()}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* POD SWITCH */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, backgroundColor: theme.card, padding: 10, borderRadius: 10 }}>
                <Text style={styles.label}>¿Es POD?</Text>
                <Switch
                    value={form.es_pod}
                    onValueChange={(val) => handleChange('es_pod', val)}
                    trackColor={{ false: "#767577", true: colors.primary }}
                    thumbColor={form.es_pod ? "#fff" : "#f4f3f4"}
                />
            </View>

            {form.es_pod && (
                <View style={{ marginBottom: 15 }}>
                    <TouchableOpacity onPress={pickImage} style={[styles.button, { backgroundColor: theme.card, borderWidth: 1, borderColor: colors.primary, marginTop: 0 }]}>
                        <Text style={[styles.buttonText, { color: colors.primary }]}>📷 Tomar Foto (Requerido)</Text>
                    </TouchableOpacity>
                    {image && <Image source={{ uri: image }} style={{ width: 100, height: 100, marginTop: 10, borderRadius: 8 }} />}
                </View>
            )}

            {/* DATOS DEL EQUIPO */}
            <Text style={styles.label}>Patente Bus (PPU)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ej: AB1234"
                placeholderTextColor={theme.muted}
                value={form.bus_ppu}
                onChangeText={(text) => handleChange('bus_ppu', text.toUpperCase())}
            />

            <Text style={styles.label}>Serie Equipo</Text>
            <TextInput
                style={styles.input}
                placeholder="Ingrese Serie"
                placeholderTextColor={theme.muted}
                value={form.serie_equipo}
                onChangeText={(text) => handleChange('serie_equipo', text)}
            />

            {/* SELECCION DE FALLA */}
            <Text style={styles.label}>Falla Detectada</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {FALLAS_COMUNES.map((f, i) => (
                    <TouchableOpacity
                        key={i}
                        style={{
                            backgroundColor: form.falla === f || (f === "Otro" && isOtroFalla) ? colors.primary : theme.card,
                            padding: 8,
                            paddingHorizontal: 12,
                            borderRadius: 20,
                            marginRight: 8,
                            borderWidth: 1,
                            borderColor: theme.border
                        }}
                        onPress={() => handleFallaSelect(f)}
                    >
                        <Text style={{ color: form.falla === f || (f === "Otro" && isOtroFalla) ? '#111' : theme.text, fontSize: 12 }}>
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* INPUT FALLA MANUAL (SOLO SI ES OTRO) */}
            {(isOtroFalla || !FALLAS_COMUNES.includes(form.falla) && form.falla !== '') && (
                <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="Describa la falla..."
                    placeholderTextColor={theme.muted}
                    multiline
                    value={form.falla}
                    onChangeText={(text) => handleChange('falla', text)}
                />
            )}

            {/* BOTON ENVIAR */}
            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }, { marginTop: 20, marginBottom: 40 }]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Crear OS'}</Text>
            </TouchableOpacity>

            {/* MODALES */}
            <Modal visible={modalTerminalVisible} transparent animationType="slide">
                <View style={localStyles.modalContainer}>
                    <View style={[localStyles.modalContent, { backgroundColor: theme.panel }]}>
                        <Text style={[styles.title, { fontSize: 18 }]}>Seleccionar Terminal</Text>
                        <FlatList
                            data={TERMINALES}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => renderSelectorItem(item, 'terminal')}
                        />
                        <TouchableOpacity onPress={() => setModalTerminalVisible(false)} style={{ padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: colors.danger }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalPstVisible} transparent animationType="slide">
                <View style={localStyles.modalContainer}>
                    <View style={[localStyles.modalContent, { backgroundColor: theme.panel }]}>
                        <Text style={[styles.title, { fontSize: 18 }]}>Seleccionar PST</Text>
                        <FlatList
                            data={PSTS}
                            keyExtractor={item => item.codigo}
                            renderItem={({ item }) => renderSelectorItem(item, 'pst')}
                        />
                        <TouchableOpacity onPress={() => setModalPstVisible(false)} style={{ padding: 10, alignItems: 'center' }}>
                            <Text style={{ color: colors.danger }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
}

const localStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '50%'
    }
});
