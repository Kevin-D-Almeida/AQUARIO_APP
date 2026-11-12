import { router } from "expo-router";
import { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AQUARIUM_TYPES } from "@/src/features/aquariums/model/aquarium.constants";
import {
  FieldHint,
  OnboardingStepGuide,
} from "@/src/features/aquariums/components/onboarding-step-guide";
import { useOnboardingNavigationGuard } from "@/src/features/aquariums/hooks/use-onboarding-navigation-guard";
import { useCreateAquariumViewModel } from "@/src/features/aquariums/view-model/use-create-aquarium-view-model";
import {
  AppInput,
  PrimaryButton,
  ScreenHeader,
} from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";

export default function CreateAquariumScreen() {
  const vm = useCreateAquariumViewModel();
  useOnboardingNavigationGuard(
    vm.isOnboarding && !vm.canLeaveOnboardingStep,
  );

  useEffect(() => {
    if (
      vm.isOnboarding &&
      vm.canLeaveOnboardingStep &&
      vm.createdAquariumId !== null
    ) {
      router.replace({
        pathname: "/aquariums/[id]/equipment",
        params: {
          id: vm.createdAquariumId,
          onboarding: "true",
        },
      });
    }
  }, [vm.canLeaveOnboardingStep, vm.createdAquariumId, vm.isOnboarding]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {vm.isOnboarding ? <OnboardingStepGuide step="aquarium" /> : null}
        <ScreenHeader
          eyebrow="NOVO ECOSSISTEMA"
          title="Cadastrar aquário"
          subtitle="As dimensões calculam automaticamente o volume em litros."
        />
        <AppInput
          label="Nome"
          value={vm.name}
          onChangeText={vm.setName}
          placeholder="Ex.: Amazônico"
          editable={!vm.isSubmitting}
        />
        {vm.isOnboarding ? (
          <FieldHint>
            Escolha um nome que ajude você a reconhecer este aquário na lista.
          </FieldHint>
        ) : null}
        <View style={styles.field}>
          <Text style={styles.label}>Tipo</Text>
          <View style={styles.chips}>
            {AQUARIUM_TYPES.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => vm.setType(item.value)}
                style={[
                  styles.chip,
                  vm.type === item.value && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    vm.type === item.value && styles.chipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {vm.isOnboarding ? (
            <FieldHint>
              Selecione água doce, marinha ou o tipo que melhor descreve seu
              sistema.
            </FieldHint>
          ) : null}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Dimensões em centímetros</Text>
          <View style={styles.row}>
            <View style={styles.dimensionField}>
              <AppInput
                label="Largura"
                value={vm.widthCm}
                onChangeText={vm.setWidthCm}
                keyboardType="decimal-pad"
                style={styles.dimension}
              />
              {vm.isOnboarding ? (
                <FieldHint>De lado a lado, em cm.</FieldHint>
              ) : null}
            </View>
            <View style={styles.dimensionField}>
              <AppInput
                label="Altura"
                value={vm.heightCm}
                onChangeText={vm.setHeightCm}
                keyboardType="decimal-pad"
                style={styles.dimension}
              />
              {vm.isOnboarding ? (
                <FieldHint>Da base ao topo, em cm.</FieldHint>
              ) : null}
            </View>
            <View style={styles.dimensionField}>
              <AppInput
                label="Profund."
                value={vm.depthCm}
                onChangeText={vm.setDepthCm}
                keyboardType="decimal-pad"
                style={styles.dimension}
              />
              {vm.isOnboarding ? (
                <FieldHint>Da frente ao fundo, em cm.</FieldHint>
              ) : null}
            </View>
          </View>
          {vm.isOnboarding ? (
            <FieldHint>
              Meça o espaço interno. O volume exibido será uma estimativa.
            </FieldHint>
          ) : null}
        </View>
        <AppInput
          label="Descrição (opcional)"
          value={vm.description}
          onChangeText={vm.setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.description}
        />
        {vm.isOnboarding ? (
          <FieldHint>
            Opcional: anote detalhes como local de instalação ou objetivo do
            aquário.
          </FieldHint>
        ) : null}
        {vm.errorMessage ? (
          <Text style={styles.error}>{vm.errorMessage}</Text>
        ) : null}
        <PrimaryButton
          title="Cadastrar aquário"
          onPress={vm.handleSubmit}
          loading={vm.isSubmitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 22, paddingBottom: 110, gap: 20 },
  field: { gap: 8 },
  label: { color: theme.colors.text, fontSize: 14, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.muted, fontWeight: "700" },
  chipTextActive: { color: "#fff" },
  row: { flexDirection: "row", gap: 8 },
  dimensionField: { flex: 1, gap: 5 },
  dimension: { minWidth: 0 },
  description: { minHeight: 110 },
  error: { color: theme.colors.danger, lineHeight: 19 },
});
