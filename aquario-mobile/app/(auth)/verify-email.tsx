import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { resendVerificationEmail } from "@/src/features/auth/services/auth.service";
import { PrimaryButton } from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { getErrorMessage } from "@/src/shared/utils/error-message";

export default function VerifyEmailScreen() {
    const params = useLocalSearchParams<{
        email?: string;
        emailSent?: string;
    }>();
    const email = params.email?.trim().toLowerCase() ?? "";
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState<string | null>(
        params.emailSent === "false"
            ? "Sua conta foi criada, mas não conseguimos enviar o e-mail agora. Você pode solicitar outro abaixo."
            : null,
    );
    const [error, setError] = useState<string | null>(null);

    async function resendEmail() {
        if (!email || isSending) return;

        try {
            setIsSending(true);
            setError(null);
            const result = await resendVerificationEmail(email);
            setMessage(result.message);
        } catch (caught) {
            setError(
                getErrorMessage(caught, "Não foi possível reenviar o e-mail."),
            );
        } finally {
            setIsSending(false);
        }
    }

    function goToLogin() {
        router.replace({
            pathname: "/login",
            params: email ? { email } : undefined,
        });
    }

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.hero}>
                        <View style={styles.iconWrap}>
                            <Ionicons
                                name="mail-open-outline"
                                size={34}
                                color={theme.colors.primaryDark}
                            />
                        </View>
                        <Text style={styles.eyebrow}>QUASE LÁ</Text>
                        <Text style={styles.title}>Confirme seu e-mail</Text>
                        <Text style={styles.subtitle}>
                            Enviamos um link de confirmação para:
                        </Text>
                        <Text style={styles.email}>{email || "seu endereço de e-mail"}</Text>
                        <Text style={styles.instructions}>
                            Abra a mensagem e toque no link. Depois, volte aqui para entrar.
                            Confira também a pasta de spam.
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        {message ? <Text style={styles.success}>{message}</Text> : null}
                        {error ? <Text style={styles.error}>{error}</Text> : null}
                        <PrimaryButton
                            title="Já confirmei, ir para login"
                            onPress={goToLogin}
                        />
                        <Pressable
                            accessibilityRole="button"
                            disabled={!email || isSending}
                            onPress={() => void resendEmail()}
                            style={({ pressed }) => [
                                styles.resendButton,
                                (pressed || isSending || !email) && styles.resendPressed,
                            ]}
                        >
                            <Text style={styles.resendText}>
                                {isSending ? "Enviando..." : "Reenviar e-mail de confirmação"}
                            </Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            onPress={goToLogin}
                            style={styles.backButton}
                        >
                            <Text style={styles.backText}>Voltar ao login</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    flex: { flex: 1 },
    content: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 28 },
    hero: { alignItems: "center", gap: 10 },
    iconWrap: {
        width: 76,
        height: 76,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
        backgroundColor: theme.colors.primarySoft,
        marginBottom: 8,
    },
    eyebrow: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: "900" },
    title: { color: theme.colors.text, fontSize: 29, fontWeight: "900", textAlign: "center" },
    subtitle: { color: theme.colors.muted, fontSize: 15, lineHeight: 22, textAlign: "center" },
    email: { color: theme.colors.text, fontSize: 16, fontWeight: "800", textAlign: "center" },
    instructions: { color: theme.colors.muted, fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 3 },
    actions: {
        gap: 14,
        padding: 20,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        ...theme.shadow,
    },
    success: { color: theme.colors.success, fontSize: 13, lineHeight: 19, textAlign: "center" },
    error: { color: theme.colors.danger, fontSize: 13, lineHeight: 19, textAlign: "center" },
    resendButton: { minHeight: 44, alignItems: "center", justifyContent: "center" },
    resendPressed: { opacity: 0.55 },
    resendText: { color: theme.colors.primaryDark, fontWeight: "800" },
    backButton: { minHeight: 36, alignItems: "center", justifyContent: "center" },
    backText: { color: theme.colors.muted, fontWeight: "700" },
});
