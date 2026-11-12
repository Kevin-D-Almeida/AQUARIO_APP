import { Link } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { requestPasswordReset } from "@/src/features/auth/services/account.service";
import { AppInput, PrimaryButton } from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { getErrorMessage } from "@/src/shared/utils/error-message";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || loading) return;

    try {
      setLoading(true);
      setError(null);
      const result = await requestPasswordReset(normalizedEmail);
      setMessage(result.message);
    } catch (caught) {
      setError(
        getErrorMessage(caught, "Não foi possível enviar as instruções."),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View>
            <Text style={styles.eyebrow}>ACESSO À CONTA</Text>
            <Text style={styles.title}>Redefinir senha</Text>
            <Text style={styles.subtitle}>
              Informe o e-mail cadastrado. Se houver uma conta ativa, enviaremos
              as instruções para criar uma nova senha.
            </Text>
          </View>
          <View style={styles.form}>
            <AppInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {message ? <Text style={styles.success}>{message}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              title="Enviar instruções"
              onPress={submit}
              loading={loading}
              disabled={!email.trim()}
            />
            <Link href="/reset-password" style={styles.link}>
              Já recebi um código
            </Link>
            <Text style={styles.footer}>
              Lembrou sua senha?{" "}
              <Link href="/login" style={styles.linkInline}>
                Entrar
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 28 },
  eyebrow: { color: theme.colors.primary, fontWeight: "900", marginBottom: 8 },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: "900" },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 22,
    gap: 17,
    ...theme.shadow,
  },
  success: { color: theme.colors.success, lineHeight: 20 },
  error: { color: theme.colors.danger, lineHeight: 20 },
  link: {
    color: theme.colors.primaryDark,
    fontWeight: "800",
    textAlign: "center",
  },
  footer: { color: theme.colors.muted, textAlign: "center" },
  linkInline: { color: theme.colors.primary, fontWeight: "800" },
});
