import { StyleSheet, Appearance } from 'react-native';

const isDark = Appearance.getColorScheme() === 'dark';

export const colors = {
    // PMP Suite Palette (from styles.css)
    primary: '#f0b90b', // --yellow
    success: '#0ecb81', // --green
    danger: '#f6465d',  // --red

    // Theme Aware Colors
    light: {
        bg: '#f6f7fb',
        panel: '#ffffff',
        card: '#ffffff',
        text: '#0b0e11',
        border: '#e5e7eb',
        muted: '#667085',
        inputBg: '#ffffff',
        navBg: '#ffffff',
    },
    dark: {
        bg: '#0b0e11',
        panel: '#11161c',
        card: '#121821',
        text: '#eaecef',
        border: '#1f2937',
        muted: '#9ca3af',
        inputBg: '#0b0e11',
        navBg: '#11161c',
    }
};

export const getTheme = () => {
    const scheme = Appearance.getColorScheme();
    return scheme === 'dark' ? colors.dark : colors.light;
};

// Estilos globales dinámicos
export const getGlobalStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: theme.bg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: theme.text,
        textAlign: 'center'
    },
    input: {
        backgroundColor: theme.inputBg,
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.border,
        color: theme.text,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#111', // Black on Yellow
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        backgroundColor: theme.card,
        padding: 15,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: theme.border,
        // Shadow only visible on light mode mainly
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    label: {
        fontWeight: 'bold',
        color: theme.text,
        marginTop: 5,
        marginBottom: 5
    },
    subtitle: {
        color: theme.muted,
        fontSize: 12,
        marginBottom: 5
    }
});
