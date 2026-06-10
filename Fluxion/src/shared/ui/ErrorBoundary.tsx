import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('JS Crash:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Oups! Erreur Fatale 🥁</Text>
                    <Text style={styles.message}>
                        L'application a rencontré un problème inattendu.
                    </Text>
                    <Text style={styles.debug}>{this.state.error?.message}</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => this.setState({ hasError: false, error: null })}>
                        <Text style={styles.buttonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.void,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        color: colors.accent,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        color: colors.white,
        textAlign: 'center',
        marginBottom: 20,
    },
    debug: {
        color: colors.gray,
        fontSize: 12,
        marginBottom: 30,
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 5,
    },
    button: {
        backgroundColor: colors.accent,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    buttonText: {
        color: colors.white,
        fontWeight: '600',
    },
});
