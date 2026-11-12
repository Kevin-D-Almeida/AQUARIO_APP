import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { getAquarium } from "@/src/features/aquariums/services/aquariums.service";
import {
  FieldHint,
  OnboardingStepGuide,
} from "@/src/features/aquariums/components/onboarding-step-guide";
import { useOnboardingNavigationGuard } from "@/src/features/aquariums/hooks/use-onboarding-navigation-guard";
import { setAquariumOnboardingStep } from "@/src/features/aquariums/services/aquarium-onboarding.service";
import {
  REMINDER_TYPES,
  type ReminderType,
} from "@/src/features/reminders/model/reminder.types";
import {
  createReminder,
  reminderKeys,
} from "@/src/features/reminders/services/reminders.service";
import {
  AppInput,
  EmptyState,
  PrimaryButton,
  ScreenHeader,
} from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { useAuth } from "@/src/providers/auth-provider";
import { getErrorMessage } from "@/src/shared/utils/error-message";
import { showSuccess } from "@/src/shared/utils/feedback";

function getInitialDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  return tomorrow;
}

export default function ReminderScreen() {
  const params = useLocalSearchParams<{ id: string; onboarding?: string }>();
  const id = Number(params.id);
  const isOnboarding = params.onboarding === "true";
  const { user } = useAuth();
  const allowOnboardingNavigation = useOnboardingNavigationGuard(isOnboarding);
  const client = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ReminderType>("WATER_CHANGE");
  const [dueDate, setDueDate] = useState(getInitialDate);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [equipmentId, setEquipmentId] = useState<number | undefined>();
  const [repeatMode, setRepeatMode] = useState<"none" | "1" | "7" | "custom">(
    "none",
  );
  const [customDays, setCustomDays] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isValidId = Number.isInteger(id) && id > 0;

  async function continueToMeasurement() {
    if (!user || !isValidId) return;
    await setAquariumOnboardingStep(user.id, "measurement", id);
    allowOnboardingNavigation();
    router.replace({
      pathname: "/aquariums/[id]/measurement",
      params: { id, onboarding: "true" },
    });
  }

  const aquariumQuery = useQuery({
    queryKey: aquariumKeys.detail(id),
    queryFn: () => getAquarium(id),
    enabled: isValidId,
  });

  const mutation = useMutation({
    mutationFn: createReminder,
    onSuccess: async () => {
      setTitle("");
      setDescription("");
      setType("WATER_CHANGE");
      setDueDate(getInitialDate());
      setEquipmentId(undefined);
      setRepeatMode("none");
      setCustomDays("");
      setShowCalendar(false);
      setShowTimePicker(false);
      setError(null);
      showSuccess("Lembrete criado.");
      if (isOnboarding) {
        await continueToMeasurement();
      } else {
        router.back();
      }
      void Promise.all([
        client.invalidateQueries({ queryKey: reminderKeys.all }),
        client.invalidateQueries({ queryKey: aquariumKeys.detail(id) }),
      ]);
    },
    onError: (caught) =>
      setError(getErrorMessage(caught, "Não foi possível criar o lembrete.")),
  });

  function handleDateChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setShowCalendar(false);
    if (event.type === "dismissed" || !selected) return;

    const normalizedDate = new Date(selected);
    normalizedDate.setHours(dueDate.getHours(), dueDate.getMinutes(), 0, 0);
    setDueDate(normalizedDate);
  }

  function handleTimeChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (event.type === "dismissed" || !selected) return;

    const normalizedDate = new Date(dueDate);
    normalizedDate.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setDueDate(normalizedDate);
  }

  function submit() {
    if (mutation.isPending) return;
    if (!title.trim()) {
      setError("Informe um título.");
      return;
    }

    if (dueDate <= new Date()) {
      setError("Escolha uma data e hora futuras.");
      return;
    }

    const repeatEveryDays =
      repeatMode === "none"
        ? undefined
        : repeatMode === "custom"
          ? Number(customDays)
          : Number(repeatMode);

    if (
      repeatMode === "custom" &&
      (!Number.isInteger(repeatEveryDays) || (repeatEveryDays ?? 0) < 1)
    ) {
      setError("Informe um intervalo de repetição maior que zero.");
      return;
    }

    setError(null);
    mutation.mutate({
      aquariumId: id,
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      dueDate: dueDate.toISOString(),
      equipmentId,
      repeatEveryDays,
    });
  }

  async function skipOnboardingStep() {
    if (mutation.isPending) return;
    await continueToMeasurement();
  }

  if (!isValidId) {
    return (
      <EmptyState
        title="Aquário inválido"
        message="Volte para a lista e selecione um aquário."
      />
    );
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
        {isOnboarding ? (
          <OnboardingStepGuide
            step="reminder"
            onSkip={() => void skipOnboardingStep()}
          />
        ) : null}
        <ScreenHeader
          eyebrow="ROTINA"
          title="Novo lembrete"
          subtitle="Planeje os próximos cuidados deste aquário."
        />

        <AppInput
          label="Título"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex.: Trocar 30% da água"
        />
        {isOnboarding ? (
          <FieldHint>
            Escreva a tarefa de forma direta para reconhecê-la na agenda.
          </FieldHint>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.chips}>
            {REMINDER_TYPES.map((item) => (
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
              A categoria ajuda a organizar e identificar o tipo de cuidado.
            </FieldHint>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Data do agendamento</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Selecionar data do lembrete"
            onPress={() => setShowCalendar(true)}
            style={({ pressed }) => [
              styles.dateButton,
              pressed && styles.dateButtonPressed,
            ]}
          >
            <View style={styles.dateIcon}>
              <Ionicons
                name="calendar-outline"
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateValue}>
                {dueDate.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.dateHint}>Toque para alterar</Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={20}
              color={theme.colors.muted}
            />
          </Pressable>
          {isOnboarding ? (
            <FieldHint>
              Escolha o dia em que pretende realizar esta tarefa.
            </FieldHint>
          ) : null}

          {showCalendar ? (
            <View style={styles.calendarContainer}>
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                minimumDate={new Date()}
                onChange={handleDateChange}
                accentColor={theme.colors.primary}
              />
              {Platform.OS === "ios" ? (
                <Pressable
                  onPress={() => setShowCalendar(false)}
                  style={styles.calendarDone}
                >
                  <Text style={styles.calendarDoneText}>Confirmar data</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Horário da atividade</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Selecionar horário do lembrete"
            onPress={() => setShowTimePicker(true)}
            style={styles.dateButton}
          >
            <View style={styles.dateIcon}>
              <Ionicons
                name="time-outline"
                size={22}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateValue}>
                {dueDate.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text style={styles.dateHint}>Toque para alterar</Text>
            </View>
          </Pressable>
          {isOnboarding ? (
            <FieldHint>
              Defina um horário para o aviso. Ele será usado pela notificação
              local.
            </FieldHint>
          ) : null}
          {showTimePicker ? (
            <View style={styles.calendarContainer}>
              <DateTimePicker
                value={dueDate}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                is24Hour
                onChange={handleTimeChange}
                accentColor={theme.colors.primary}
              />
              {Platform.OS === "ios" ? (
                <Pressable
                  onPress={() => setShowTimePicker(false)}
                  style={styles.calendarDone}
                >
                  <Text style={styles.calendarDoneText}>Confirmar horário</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Repetição</Text>
          <View style={styles.chips}>
            {[
              { value: "none" as const, label: "Não repetir" },
              { value: "1" as const, label: "Todos os dias" },
              { value: "7" as const, label: "Toda semana" },
              { value: "custom" as const, label: "A cada X dias" },
            ].map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setRepeatMode(option.value)}
                style={[
                  styles.chip,
                  repeatMode === option.value && styles.active,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    repeatMode === option.value && styles.activeText,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {repeatMode === "custom" ? (
            <View style={styles.field}>
              <AppInput
                label="Repetir a cada quantos dias?"
                value={customDays}
                onChangeText={setCustomDays}
                keyboardType="number-pad"
                placeholder="Ex.: 3"
              />
              {isOnboarding ? (
                <FieldHint>
                  Informe quantos dias devem separar uma ocorrência da próxima.
                </FieldHint>
              ) : null}
            </View>
          ) : null}
          <Text style={styles.dateHint}>
            Ao concluir, a próxima ocorrência será criada automaticamente.
          </Text>
          {isOnboarding ? (
            <FieldHint>
              Use repetição para tarefas regulares; deixe “Não repetir” para
              uma atividade única.
            </FieldHint>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Equipamento relacionado (opcional)</Text>
          <View style={styles.chips}>
            <Pressable
              onPress={() => setEquipmentId(undefined)}
              style={[styles.chip, equipmentId === undefined && styles.active]}
            >
              <Text
                style={[
                  styles.chipText,
                  equipmentId === undefined && styles.activeText,
                ]}
              >
                Nenhum
              </Text>
            </Pressable>
            {aquariumQuery.data?.equipment?.map((equipment) => (
              <Pressable
                key={equipment.id}
                onPress={() => setEquipmentId(equipment.id)}
                style={[
                  styles.chip,
                  equipmentId === equipment.id && styles.active,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    equipmentId === equipment.id && styles.activeText,
                  ]}
                >
                  {equipment.name}
                </Text>
              </Pressable>
            ))}
          </View>
          {isOnboarding ? (
            <FieldHint>
              Opcional: vincule a tarefa ao equipamento que precisa de cuidado.
            </FieldHint>
          ) : null}
          {aquariumQuery.isError ? (
            <Text style={styles.error}>
              Não foi possível carregar os equipamentos. Você ainda pode criar
              um lembrete sem vínculo.
            </Text>
          ) : null}
        </View>

        <AppInput
          label="Descrição (opcional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={styles.description}
        />
        {isOnboarding ? (
          <FieldHint>
            Opcional: inclua quantidade, instruções ou algum detalhe útil.
          </FieldHint>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title="Criar lembrete"
          onPress={submit}
          loading={mutation.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 22, paddingBottom: 110, gap: 20 },
  field: { gap: 9 },
  label: { color: theme.colors.text, fontWeight: "700", fontSize: 14 },
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
  dateButton: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  dateButtonPressed: { opacity: 0.7 },
  dateIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primarySoft,
  },
  dateTextContainer: { flex: 1 },
  dateValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  dateHint: { color: theme.colors.muted, fontSize: 12, marginTop: 4 },
  calendarContainer: {
    overflow: "hidden",
    borderRadius: theme.radius.md,
    borderWidth: Platform.OS === "ios" ? 1 : 0,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: Platform.OS === "ios" ? 8 : 0,
  },
  calendarDone: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  calendarDoneText: { color: theme.colors.primary, fontWeight: "800" },
  description: { minHeight: 90 },
  error: { color: theme.colors.danger, lineHeight: 19 },
});
