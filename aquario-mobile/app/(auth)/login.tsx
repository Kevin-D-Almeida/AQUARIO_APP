import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useLoginViewModel } from '@/src/features/auth/view-model/use-login-view-model';

export default function LoginScreen() {
    const {
        email,
        password,
        isLoading,
        errorMessage,
        setEmail,
        setPassword,
        handleLogin,
    } = useLoginViewModel();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Aquário App</Text>

                <Text style={styles.subtitle}>
                    Entre para acompanhar seus aquários
                </Text>

                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="E-mail"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                    style={styles.input}
                />

                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Senha"
                    secureTextEntry
                    editable={!isLoading}
                    style={styles.input}
                />

                {errorMessage && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                )}

                <Pressable
                    style={[
                        styles.button,
                        isLoading && styles.buttonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <Text style={styles.buttonText}>Entrar</Text>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 16,
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
    },

    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },

    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },

    errorText: {
        fontSize: 14,
        color: '#b00020',
    },

    button: {
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#222',
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});