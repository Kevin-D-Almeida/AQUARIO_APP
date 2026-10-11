import type { PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";
import { theme } from "../theme/theme";

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: object }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AppInput({
  label,
  error,
  style,
  containerStyle,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: object;
}) {
  return (
    <View style={[styles.field, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "danger" | "ghost";
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        variant === "danger" && styles.dangerButton,
        variant === "ghost" && styles.ghostButton,
        (pressed || inactive) && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "ghost" ? theme.colors.primary : "#fff"}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "ghost" && styles.ghostButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>◌</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {action}
    </View>
  );
}

export function LoadingState() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.subtitle}>Carregando...</Text>
    </View>
  );
}

export function ErrorState({
  title = "Não foi possível carregar",
  message = "Verifique sua conexão e tente novamente.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.loading}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {onRetry ? (
        <PrimaryButton
          title="Tentar novamente"
          variant="ghost"
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 22,
  },
  headerText: { flex: 1 },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 7,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    ...theme.shadow,
  },
  field: { gap: 7 },
  label: { color: theme.colors.text, fontSize: 14, fontWeight: "700" },
  input: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
  },
  error: { color: theme.colors.danger, fontSize: 13, lineHeight: 18 },
  button: {
    minHeight: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButton: { backgroundColor: theme.colors.danger },
  ghostButton: { backgroundColor: theme.colors.primarySoft },
  buttonPressed: { opacity: 0.65 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  ghostButtonText: { color: theme.colors.primaryDark },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 8,
  },
  emptyIcon: { color: theme.colors.primary, fontSize: 48 },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyMessage: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 8,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: theme.colors.background,
  },
});
