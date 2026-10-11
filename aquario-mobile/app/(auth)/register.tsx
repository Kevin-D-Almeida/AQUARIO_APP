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

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (loading) return;
    if (!name.trim() || !email.trim() || !password)
      return setError("Preencha todos os campos.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return setError("Informe um e-mail válido.");
    if (password.length < 6)
      return setError("A senha deve ter pelo menos 6 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    try {
      setLoading(true);
      setError(null);
      await signUp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (caught) {
      setError(getErrorMessage(caught, "Não foi possível criar sua conta."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text style={styles.eyebrow}>COMECE AGORA</Text>
            <Text style={styles.title}>Crie sua conta</Text>
            <Text style={styles.subtitle}>
              Organize cuidados, parâmetros e equipamentos em um só lugar.
            </Text>
          </View>
          <View style={styles.form}>
            <AppInput
              label="Nome"
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
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
            />
            <AppInput
              label="Confirmar senha"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              title="Criar conta"
              onPress={submit}
              loading={loading}
            />
            <Text style={styles.footer}>
              Já possui conta?{" "}
              <Link href="/login" style={styles.link}>
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
  content: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 24 },
  eyebrow: {
    color: theme.colors.primary,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: "900" },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  form: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: theme.radius.lg,
    gap: 15,
    ...theme.shadow,
  },
  error: { color: theme.colors.danger },
  footer: { color: theme.colors.muted, textAlign: "center" },
  link: { color: theme.colors.primary, fontWeight: "800" },
});
