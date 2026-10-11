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
  EQUIPMENT_TYPES,
  type EquipmentType,
} from "@/src/features/equipment/model/equipment.types";
import {
  getEquipment,
  updateEquipment,
} from "@/src/features/equipment/services/equipment.service";
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

export default function EditEquipmentScreen() {
  const params = useLocalSearchParams<{ id: string; equipmentId: string }>();
  const aquariumId = Number(params.id);
  const equipmentId = Number(params.equipmentId);
  const validIds =
    Number.isInteger(aquariumId) &&
    aquariumId > 0 &&
    Number.isInteger(equipmentId) &&
    equipmentId > 0;
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<EquipmentType>("OTHER");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [interval, setInterval] = useState("");
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["equipment", equipmentId],
    queryFn: () => getEquipment(equipmentId),
    enabled: validIds,
  });

  useEffect(() => {
    if (!query.data) return;
    setName(query.data.name);
    setType(query.data.type);
    setBrand(query.data.brand ?? "");
    setModel(query.data.model ?? "");
    setInterval(
      query.data.maintenanceIntervalDays
        ? String(query.data.maintenanceIntervalDays)
        : "",
    );
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateEquipment,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: aquariumKeys.detail(aquariumId),
        }),
        client.invalidateQueries({ queryKey: ["equipment", equipmentId] }),
      ]);
      showSuccess("Equipamento atualizado.");
      router.back();
    },
    onError: (caught) =>
      setError(
        getErrorMessage(caught, "Não foi possível atualizar o equipamento."),
      ),
  });

  if (!validIds) {
    return (
      <EmptyState
        title="Equipamento inválido"
        message="Volte ao aquário e selecione um equipamento."
      />
    );
  }
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  function submit() {
    if (mutation.isPending) return;
    const parsedInterval = interval ? Number(interval) : undefined;
    if (!name.trim()) return setError("Informe o nome do equipamento.");
    if (
      parsedInterval !== undefined &&
      (!Number.isInteger(parsedInterval) || parsedInterval < 1)
    ) {
      return setError("O intervalo deve ser um número inteiro positivo.");
    }

    setError(null);
    mutation.mutate({
      id: equipmentId,
      data: {
        name: name.trim(),
        type,
        brand: brand.trim(),
        model: model.trim(),
        maintenanceIntervalDays: parsedInterval,
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
          eyebrow="ESTRUTURA"
          title="Editar equipamento"
          subtitle="Atualize as informações sem alterar o aquário vinculado."
        />
        <AppInput label="Nome" value={name} onChangeText={setName} />
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.chips}>
          {EQUIPMENT_TYPES.map((item) => (
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
        <AppInput label="Marca" value={brand} onChangeText={setBrand} />
        <AppInput label="Modelo" value={model} onChangeText={setModel} />
        <AppInput
          label="Intervalo de manutenção (dias)"
          value={interval}
          onChangeText={setInterval}
          keyboardType="number-pad"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title="Salvar equipamento"
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
