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
import { aquariumKeys } from "@/src/features/aquariums/queries/aquarium.queries";
import {
  FieldHint,
  OnboardingStepGuide,
} from "@/src/features/aquariums/components/onboarding-step-guide";
import { useOnboardingNavigationGuard } from "@/src/features/aquariums/hooks/use-onboarding-navigation-guard";
import { setAquariumOnboardingStep } from "@/src/features/aquariums/services/aquarium-onboarding.service";
import { useAuth } from "@/src/providers/auth-provider";
import {
  EQUIPMENT_TYPES,
  type EquipmentType,
} from "@/src/features/equipment/model/equipment.types";
import { createEquipment } from "@/src/features/equipment/services/equipment.service";
import {
  AppInput,
  EmptyState,
  PrimaryButton,
  ScreenHeader,
} from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { getErrorMessage } from "@/src/shared/utils/error-message";
import { showSuccess } from "@/src/shared/utils/feedback";

export default function EquipmentScreen() {
  const params = useLocalSearchParams<{ id: string; onboarding?: string }>();
  const id = Number(params.id);
  const isOnboarding = params.onboarding === "true";
  const { user } = useAuth();
  const allowOnboardingNavigation = useOnboardingNavigationGuard(isOnboarding);
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<EquipmentType>("FILTER_HANG_ON");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [interval, setInterval] = useState("");
  const [error, setError] = useState<string | null>(null);
  const validId = Number.isInteger(id) && id > 0;

  async function continueToReminder() {
    if (!user || !validId) return;
    await setAquariumOnboardingStep(user.id, "reminder", id);
    allowOnboardingNavigation();
    router.replace({
      pathname: "/aquariums/[id]/reminder",
      params: { id, onboarding: "true" },
    });
  }

  const mutation = useMutation({
    mutationFn: createEquipment,
    onSuccess: async () => {
      setName("");
      setType("FILTER_HANG_ON");
      setBrand("");
      setModel("");
      setInterval("");
      setError(null);
      showSuccess("Equipamento cadastrado.");
      if (isOnboarding) {
        await continueToReminder();
      } else {
        router.back();
      }
      void client.invalidateQueries({ queryKey: aquariumKeys.detail(id) });
    },
    onError: (caught) =>
      setError(
        getErrorMessage(caught, "Não foi possível cadastrar o equipamento."),
      ),
  });
  function submit() {
    if (mutation.isPending) return;
    const parsedInterval = interval ? Number(interval) : undefined;
    if (!name.trim()) return setError("Informe o nome do equipamento.");
    if (
      parsedInterval !== undefined &&
      (!Number.isInteger(parsedInterval) || parsedInterval < 1)
    )
      return setError("O intervalo deve ser um número inteiro positivo.");
    setError(null);
    mutation.mutate({
      aquariumId: id,
      name: name.trim(),
      type,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      maintenanceIntervalDays: parsedInterval,
    });
  }

  async function skipOnboardingStep() {
    if (mutation.isPending) return;
    await continueToReminder();
  }

  if (!validId)
    return (
      <EmptyState
        title="Aquário inválido"
        message="Volte para a lista e selecione um aquário."
      />
    );
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {isOnboarding ? (
          <OnboardingStepGuide
            step="equipment"
            onSkip={() => void skipOnboardingStep()}
          />
        ) : null}
        <ScreenHeader
          eyebrow="ESTRUTURA"
          title="Novo equipamento"
          subtitle="Organize filtros, iluminação e outros componentes."
        />
        <AppInput
          label="Nome"
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Filtro principal"
        />
        {isOnboarding ? (
          <FieldHint>
            Dê um nome fácil de reconhecer, como “filtro principal”.
          </FieldHint>
        ) : null}
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
        {isOnboarding ? (
          <FieldHint>
            Selecione a categoria que descreve o equipamento instalado.
          </FieldHint>
        ) : null}
        <View style={styles.row}>
          <View style={styles.half}>
            <AppInput label="Marca" value={brand} onChangeText={setBrand} />
            {isOnboarding ? (
              <FieldHint>Fabricante do equipamento, se souber.</FieldHint>
            ) : null}
          </View>
          <View style={styles.half}>
            <AppInput label="Modelo" value={model} onChangeText={setModel} />
            {isOnboarding ? (
              <FieldHint>Modelo indicado na etiqueta ou embalagem.</FieldHint>
            ) : null}
          </View>
        </View>
        <AppInput
          label="Manutenção a cada quantos dias?"
          value={interval}
          onChangeText={setInterval}
          keyboardType="number-pad"
          placeholder="Ex.: 30"
        />
        {isOnboarding ? (
          <FieldHint>
            Opcional: informe de quantos em quantos dias este item costuma
            precisar de manutenção.
          </FieldHint>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title="Cadastrar equipamento"
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
    borderRadius: 99,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  active: { backgroundColor: theme.colors.primary },
  chipText: { color: theme.colors.muted, fontWeight: "700", fontSize: 12 },
  activeText: { color: "#fff" },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  error: { color: theme.colors.danger },
});
