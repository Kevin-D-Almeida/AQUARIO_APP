import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  MEASUREMENT_TYPES,
  type MeasurementType,
} from "@/src/features/measurements/model/measurement.types";
import { createMeasurement } from "@/src/features/measurements/services/measurements.service";
import { aquariumKeys } from "@/src/features/aquariums/queries/aquarium.queries";
import {
  FieldHint,
  OnboardingStepGuide,
} from "@/src/features/aquariums/components/onboarding-step-guide";
import { useOnboardingNavigationGuard } from "@/src/features/aquariums/hooks/use-onboarding-navigation-guard";
import { completeAquariumOnboarding } from "@/src/features/aquariums/services/aquarium-onboarding.service";
import { useAuth } from "@/src/providers/auth-provider";
import {
  AppInput,
  EmptyState,
  PrimaryButton,
  ScreenHeader,
} from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { getErrorMessage } from "@/src/shared/utils/error-message";
import { showSuccess } from "@/src/shared/utils/feedback";

export default function MeasurementScreen() {
  const params = useLocalSearchParams<{ id: string; onboarding?: string }>();
  const id = Number(params.id);
  const isOnboarding = params.onboarding === "true";
  const { user } = useAuth();
  const allowOnboardingNavigation = useOnboardingNavigationGuard(isOnboarding);
  const client = useQueryClient();
  const [type, setType] = useState<MeasurementType>("TEMPERATURE");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const validId = Number.isInteger(id) && id > 0;

  async function finishOnboarding() {
    if (!user) return;
    await completeAquariumOnboarding(user.id);
    allowOnboardingNavigation();
    router.replace({
      pathname: "/aquariums",
      params: { onboardingComplete: "true" },
    });
  }

  const mutation = useMutation({
    mutationFn: createMeasurement,
    onSuccess: async () => {
      setType("TEMPERATURE");
      setValue("");
      setNote("");
      setError(null);
      showSuccess("Medição salva.");
      if (isOnboarding) {
        await finishOnboarding();
      } else {
        router.back();
      }
      void client.invalidateQueries({ queryKey: aquariumKeys.detail(id) });
    },
    onError: (caught) =>
      setError(getErrorMessage(caught, "Não foi possível salvar a medição.")),
  });
  const selected = MEASUREMENT_TYPES.find((item) => item.value === type)!;
  if (!validId)
    return (
      <EmptyState
        title="Aquário inválido"
        message="Volte para a lista e selecione um aquário."
      />
    );
  function submit() {
    if (mutation.isPending) return;
    const number = Number(value.replace(",", "."));
    if (!Number.isFinite(number))
      return setError("Informe um valor numérico válido.");
    setError(null);
    mutation.mutate({
      aquariumId: id,
      type,
      value: number,
      unit: selected.unit,
      source: "MANUAL",
      note: note.trim() || undefined,
    });
  }

  async function skipOnboardingStep() {
    if (mutation.isPending) return;
    await finishOnboarding();
  }

  return (
    <FormShell>
      {isOnboarding ? (
        <OnboardingStepGuide
          step="measurement"
          onSkip={() => void skipOnboardingStep()}
        />
      ) : null}
      <ScreenHeader
        eyebrow="QUALIDADE DA ÁGUA"
        title="Nova medição"
        subtitle="Registre parâmetros regularmente para acompanhar tendências."
      />
      <Text style={styles.label}>Parâmetro</Text>
      <View style={styles.chips}>
        {MEASUREMENT_TYPES.map((item) => (
          <Pressable
            key={item.value}
            onPress={() => setType(item.value)}
            style={[styles.chip, type === item.value && styles.active]}
          >
            <Text
              style={[
                styles.chipText,
                type === item.value && styles.activeText,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {isOnboarding ? (
        <FieldHint>
          Escolha o parâmetro que você mediu; a unidade correspondente será
          exibida no campo de valor.
        </FieldHint>
      ) : null}
      <AppInput
        label={`Valor (${selected.unit})`}
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        placeholder="0,0"
      />
      {isOnboarding ? (
        <FieldHint>
          Digite o resultado do teste usando a unidade indicada no rótulo.
        </FieldHint>
      ) : null}
      <AppInput
        label="Observação (opcional)"
        value={note}
        onChangeText={setNote}
        multiline
      />
      {isOnboarding ? (
        <FieldHint>
          Opcional: anote o teste utilizado ou outra condição observada.
        </FieldHint>
      ) : null}
      {isOnboarding ? (
        <FieldHint>
          A data e o horário desta medição são registrados automaticamente.
        </FieldHint>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        title="Salvar medição"
        onPress={submit}
        loading={mutation.isPending}
      />
    </FormShell>
  );
}
function FormShell({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 22, paddingBottom: 110, gap: 18 },
  label: { color: theme.colors.text, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 99,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  active: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.muted, fontWeight: "700", fontSize: 12 },
  activeText: { color: "#fff" },
  error: { color: theme.colors.danger },
});
