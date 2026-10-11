import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
import { getAquarium } from "@/src/features/aquariums/services/aquariums.service";
import {
  REMINDER_TYPES,
  type ReminderType,
} from "@/src/features/reminders/model/reminder.types";
import {
  getReminder,
  reminderKeys,
  updateReminder,
} from "@/src/features/reminders/services/reminders.service";
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

export default function EditReminderScreen() {
  const params = useLocalSearchParams<{ id: string; reminderId: string }>();
  const aquariumId = Number(params.id);
  const reminderId = Number(params.reminderId);
  const validIds =
    Number.isInteger(aquariumId) &&
    aquariumId > 0 &&
    Number.isInteger(reminderId) &&
    reminderId > 0;
  const client = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ReminderType>("OTHER");
  const [dueDate, setDueDate] = useState(new Date());
  const [equipmentId, setEquipmentId] = useState<number | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "1" | "7" | "custom">(
    "none",
  );
  const [customDays, setCustomDays] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reminderQuery = useQuery({
    queryKey: ["reminders", reminderId],
    queryFn: () => getReminder(reminderId),
    enabled: validIds,
  });
  const aquariumQuery = useQuery({
    queryKey: aquariumKeys.detail(aquariumId),
    queryFn: () => getAquarium(aquariumId),
    enabled: validIds,
  });

  useEffect(() => {
    if (!reminderQuery.data) return;
    setTitle(reminderQuery.data.title);
    setDescription(reminderQuery.data.description ?? "");
    setType(reminderQuery.data.type);
    setDueDate(new Date(reminderQuery.data.dueDate));
    setEquipmentId(reminderQuery.data.equipmentId ?? undefined);
    const repeatDays = reminderQuery.data.repeatEveryDays;
    if (!repeatDays) {
      setRepeatMode("none");
    } else if (repeatDays === 1 || repeatDays === 7) {
      setRepeatMode(String(repeatDays) as "1" | "7");
    } else {
      setRepeatMode("custom");
      setCustomDays(String(repeatDays));
    }
  }, [reminderQuery.data]);

  const mutation = useMutation({
    mutationFn: updateReminder,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: reminderKeys.all }),
        client.invalidateQueries({
          queryKey: aquariumKeys.detail(aquariumId),
        }),
      ]);
      showSuccess("Lembrete atualizado.");
      router.back();
    },
    onError: (caught) =>
      setError(
        getErrorMessage(caught, "Não foi possível atualizar o lembrete."),
      ),
  });

  if (!validIds) {
    return (
      <EmptyState
        title="Lembrete inválido"
        message="Volte ao aquário e selecione um lembrete."
      />
    );
  }
  if (reminderQuery.isLoading || aquariumQuery.isLoading) {
    return <LoadingState />;
  }
  if (
    reminderQuery.isError ||
    aquariumQuery.isError ||
    !reminderQuery.data ||
    !aquariumQuery.data
  ) {
    return (
      <ErrorState
        onRetry={() => {
          void reminderQuery.refetch();
          void aquariumQuery.refetch();
        }}
      />
    );
  }

  function handleDateChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setShowCalendar(false);
    if (event.type === "dismissed" || !selected) return;
    const normalized = new Date(selected);
    normalized.setHours(dueDate.getHours(), dueDate.getMinutes(), 0, 0);
    setDueDate(normalized);
  }

  function handleTimeChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") setShowTimePicker(false);
    if (event.type === "dismissed" || !selected) return;
    const normalized = new Date(dueDate);
    normalized.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setDueDate(normalized);
  }

  function submit() {
    if (mutation.isPending) return;
    if (!title.trim()) return setError("Informe um título.");

    const repeatEveryDays =
      repeatMode === "none"
        ? null
        : repeatMode === "custom"
          ? Number(customDays)
          : Number(repeatMode);

    if (
      repeatMode === "custom" &&
      (!Number.isInteger(repeatEveryDays) || (repeatEveryDays ?? 0) < 1)
    ) {
      return setError("Informe um intervalo de repetição maior que zero.");
    }

    setError(null);
    mutation.mutate({
      id: reminderId,
      data: {
        title: title.trim(),
        description: description.trim(),
        type,
        dueDate: dueDate.toISOString(),
        aquariumId,
        equipmentId,
        repeatEveryDays,
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
          eyebrow="ROTINA"
          title="Editar lembrete"
          subtitle="Atualize a tarefa, a data ou o equipamento relacionado."
        />
        <AppInput label="Título" value={title} onChangeText={setTitle} />
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.chips}>
          {REMINDER_TYPES.map((item) => (
            <Choice
              key={item.value}
              label={item.label}
              selected={type === item.value}
              onPress={() => setType(item.value)}
            />
          ))}
        </View>
        <Text style={styles.label}>Equipamento relacionado</Text>
        <View style={styles.chips}>
          {aquariumQuery.data.equipment?.map((equipment) => (
            <Choice
              key={equipment.id}
              label={equipment.name}
              selected={equipmentId === equipment.id}
              onPress={() => setEquipmentId(equipment.id)}
            />
          ))}
          {!aquariumQuery.data.equipment?.length ? (
            <Text style={styles.muted}>
              Este aquário não possui equipamentos.
            </Text>
          ) : null}
        </View>
        <Text style={styles.label}>Data</Text>
        <Pressable
          onPress={() => setShowCalendar(true)}
          style={styles.dateButton}
        >
          <Text style={styles.dateText}>
            {dueDate.toLocaleDateString("pt-BR")}
          </Text>
          <Text style={styles.muted}>Toque para alterar</Text>
        </Pressable>
        {showCalendar ? (
          <View style={styles.calendar}>
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              minimumDate={new Date()}
              onChange={handleDateChange}
              accentColor={theme.colors.primary}
            />
            {Platform.OS === "ios" ? (
              <Pressable onPress={() => setShowCalendar(false)}>
                <Text style={styles.confirm}>Confirmar data</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <Text style={styles.label}>Horário</Text>
        <Pressable
          onPress={() => setShowTimePicker(true)}
          style={styles.dateButton}
        >
          <Text style={styles.dateText}>
            {dueDate.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={styles.muted}>Toque para alterar</Text>
        </Pressable>
        {showTimePicker ? (
          <View style={styles.calendar}>
            <DateTimePicker
              value={dueDate}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              is24Hour
              onChange={handleTimeChange}
              accentColor={theme.colors.primary}
            />
            {Platform.OS === "ios" ? (
              <Pressable onPress={() => setShowTimePicker(false)}>
                <Text style={styles.confirm}>Confirmar horário</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <Text style={styles.label}>Repetição</Text>
        <View style={styles.chips}>
          {[
            { value: "none" as const, label: "Não repetir" },
            { value: "1" as const, label: "Todos os dias" },
            { value: "7" as const, label: "Toda semana" },
            { value: "custom" as const, label: "A cada X dias" },
          ].map((option) => (
            <Choice
              key={option.value}
              label={option.label}
              selected={repeatMode === option.value}
              onPress={() => setRepeatMode(option.value)}
            />
          ))}
        </View>
        {repeatMode === "custom" ? (
          <AppInput
            label="Repetir a cada quantos dias?"
            value={customDays}
            onChangeText={setCustomDays}
            keyboardType="number-pad"
          />
        ) : null}
        <AppInput
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title="Salvar lembrete"
          onPress={submit}
          loading={mutation.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.active]}
    >
      <Text style={[styles.chipText, selected && styles.activeText]}>
        {label}
      </Text>
    </Pressable>
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  active: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: { color: theme.colors.muted, fontWeight: "700", fontSize: 12 },
  activeText: { color: "#fff" },
  dateButton: {
    padding: 16,
    gap: 4,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  dateText: { color: theme.colors.text, fontWeight: "800", fontSize: 16 },
  muted: { color: theme.colors.muted, fontSize: 13 },
  calendar: {
    padding: Platform.OS === "ios" ? 8 : 0,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  confirm: {
    color: theme.colors.primary,
    fontWeight: "800",
    textAlign: "right",
    padding: 12,
  },
  error: { color: theme.colors.danger },
});
