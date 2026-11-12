import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { resetPassword } from "@/src/features/auth/services/account.service";
import { AppInput, PrimaryButton } from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { getErrorMessage } from "@/src/shared/utils/error-message";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const routeToken = Array.isArray(params.token)
    ? params.token[0]
    : params.token;
  const [token, setToken] = useState(routeToken ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (routeToken) setToken(routeToken);
  }, [routeToken]);

  async function submit() {
    if (loading) return;
    if (!token.trim()) return setError("Informe o código recebido por e-mail.");
    if (password.length < 6)
      return setError("A senha deve ter pelo menos 6 caracteres.");
    if (password !== confirmPassword)
      return setError("As senhas não coincidem.");

    try {
      setLoading(true);
      setError(null);
      await resetPassword(token.trim(), password);
      setSuccess(true);
    } catch (caught) {
      setError(
        getErrorMessage(caught, "Não foi possível redefinir sua senha."),
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
            <Text style={styles.title}>Crie uma nova senha</Text>
            <Text style={styles.subtitle}>
              O código do e-mail expira em uma hora e só pode ser usado uma vez.
            </Text>
          </View>
          <View style={styles.form}>
            <AppInput
              label="Código de recuperação"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <AppInput
              label="Nova senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            <AppInput
              label="Confirmar nova senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? (
              <Text style={styles.success}>
                Senha redefinida. Você já pode entrar com a nova senha.
              </Text>
            ) : (
              <PrimaryButton
                title="Salvar nova senha"
                onPress={submit}
                loading={loading}
              />
            )}
            <Link href="/login" style={styles.link}>
              Voltar para entrar
            </Link>
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
  error: { color: theme.colors.danger, lineHeight: 20 },
  success: { color: theme.colors.success, lineHeight: 20 },
  link: { color: theme.colors.primary, fontWeight: "800", textAlign: "center" },
});
