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
  AppInput,
  EmptyState,
  PrimaryButton,
  ScreenHeader,
} from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { getErrorMessage } from "@/src/shared/utils/error-message";
import { showSuccess } from "@/src/shared/utils/feedback";

export default function MeasurementScreen() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const client = useQueryClient();
  const [type, setType] = useState<MeasurementType>("TEMPERATURE");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const validId = Number.isInteger(id) && id > 0;
  const mutation = useMutation({
    mutationFn: createMeasurement,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: aquariumKeys.detail(id) });
      setType("TEMPERATURE");
      setValue("");
      setNote("");
      setError(null);
      showSuccess("Medição salva.");
      router.back();
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
  return (
    <FormShell>
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
      <AppInput
        label={`Valor (${selected.unit})`}
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        placeholder="0,0"
      />
      <AppInput
        label="Observação (opcional)"
        value={note}
        onChangeText={setNote}
        multiline
      />
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
