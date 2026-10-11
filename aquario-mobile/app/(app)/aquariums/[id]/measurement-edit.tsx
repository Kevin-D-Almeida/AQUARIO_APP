import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { aquariumKeys } from "@/src/features/aquariums/queries/aquarium.queries";
import {
  MEASUREMENT_TYPES,
  type MeasurementType,
} from "@/src/features/measurements/model/measurement.types";
import {
  getMeasurement,
  updateMeasurement,
} from "@/src/features/measurements/services/measurements.service";
import {
  AppInput,
  EmptyState,
  ErrorState,
  LoadingState,
  PrimaryButton,
  ScreenHeader,
} from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { getErrorMessage } from "@/src/shared/utils/error-message";
import { showSuccess } from "@/src/shared/utils/feedback";

export default function EditMeasurementScreen() {
  const params = useLocalSearchParams<{ id: string; measurementId: string }>();
  const aquariumId = Number(params.id);
  const measurementId = Number(params.measurementId);
  const validIds =
    Number.isInteger(aquariumId) &&
    aquariumId > 0 &&
    Number.isInteger(measurementId) &&
    measurementId > 0;
  const client = useQueryClient();
  const [type, setType] = useState<MeasurementType>("TEMPERATURE");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["measurements", measurementId],
    queryFn: () => getMeasurement(measurementId),
    enabled: validIds,
  });

  useEffect(() => {
    if (!query.data) return;
    setType(query.data.type);
    setValue(String(query.data.value));
    setNote(query.data.note ?? "");
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateMeasurement,
    onSuccess: async () => {
      await client.invalidateQueries({
        queryKey: aquariumKeys.detail(aquariumId),
      });
      showSuccess("Medição atualizada.");
      router.back();
    },
    onError: (caught) =>
      setError(
        getErrorMessage(caught, "Não foi possível atualizar a medição."),
      ),
  });

  if (!validIds) {
    return (
      <EmptyState
        title="Medição inválida"
        message="Volte ao aquário e selecione uma medição."
      />
    );
  }
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  const selected = MEASUREMENT_TYPES.find((item) => item.value === type)!;

  function submit() {
    if (mutation.isPending) return;
    const numericValue = Number(value.replace(",", "."));
    if (!Number.isFinite(numericValue)) {
      return setError("Informe um valor numérico válido.");
    }

    setError(null);
    mutation.mutate({
      id: measurementId,
      data: {
        type,
        value: numericValue,
        unit: selected.unit,
        note: note.trim(),
      },
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          eyebrow="QUALIDADE DA ÁGUA"
          title="Editar medição"
          subtitle="Corrija o parâmetro registrado."
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
        />
        <AppInput
          label="Observação"
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
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
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
