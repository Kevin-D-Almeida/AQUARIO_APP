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

import { useAuth } from "@/src/providers/auth-provider";
import { AppInput, PrimaryButton } from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { getErrorMessage } from "@/src/shared/utils/error-message";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (loading) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password)
      return setError("Informe e-mail e senha.");
    try {
      setLoading(true);
      setError(null);
      await signIn({ email: normalizedEmail, password });
    } catch (caught) {
      setError(
        getErrorMessage(
          caught,
          "Não foi possível entrar. Verifique seus dados.",
        ),
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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>A</Text>
            </View>
            <Text style={styles.brandName}>Aquário</Text>
            <Text style={styles.tagline}>
              Seu ecossistema, sempre em equilíbrio.
            </Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>
              Entre para acompanhar seus aquários.
            </Text>
            <AppInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <AppInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
            />
            <Text style={styles.footer}>
              Ainda não tem uma conta?{" "}
              <Link href="/register" style={styles.link}>
                Criar conta
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
  content: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 34 },
  brand: { alignItems: "center" },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    ...theme.shadow,
  },
  logoText: { color: "#fff", fontSize: 34, fontWeight: "900" },
  brandName: { color: theme.colors.text, fontSize: 30, fontWeight: "900" },
  tagline: { color: theme.colors.muted, marginTop: 5 },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 22,
    gap: 17,
    ...theme.shadow,
  },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: "800" },
  subtitle: { color: theme.colors.muted, marginTop: -10, marginBottom: 4 },
  error: { color: theme.colors.danger, lineHeight: 19 },
  footer: { color: theme.colors.muted, textAlign: "center" },
  link: { color: theme.colors.primary, fontWeight: "800" },
});
