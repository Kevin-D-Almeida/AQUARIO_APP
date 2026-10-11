import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  REMINDER_TYPES,
  formatReminderRecurrence,
  type Reminder,
} from "@/src/features/reminders/model/reminder.types";
import {
  deleteReminder,
  getReminders,
  markReminderAsDone,
  reminderKeys,
} from "@/src/features/reminders/services/reminders.service";
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  ScreenHeader,
} from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";
import { getErrorMessage } from "@/src/shared/utils/error-message";
import { showSuccess } from "@/src/shared/utils/feedback";

export default function RemindersScreen() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: reminderKeys.all,
    queryFn: getReminders,
  });
  const done = useMutation({
    mutationFn: markReminderAsDone,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: reminderKeys.all }),
        client.invalidateQueries({ queryKey: ["aquariums"] }),
      ]);
      showSuccess("Atividade concluída.");
    },
    onError: (error) =>
      Alert.alert(
        "Não foi possível concluir",
        getErrorMessage(error, "Tente novamente."),
      ),
  });
  const remove = useMutation({
    mutationFn: deleteReminder,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: reminderKeys.all }),
        client.invalidateQueries({ queryKey: ["aquariums"] }),
      ]);
      showSuccess("Lembrete excluído.");
    },
    onError: (error) =>
      Alert.alert(
        "Não foi possível excluir",
        getErrorMessage(error, "Tente novamente."),
      ),
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  const reminders = (query.data ?? [])
    .filter((reminder) => reminder.status === "PENDING")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => String(item.id)}
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
        contentContainerStyle={[
          styles.content,
          !reminders.length && styles.grow,
        ]}
        ListHeaderComponent={
          <ScreenHeader
            eyebrow="CUIDADOS"
            title="Agenda"
            subtitle="Tudo que precisa ser feito para manter seus aquários saudáveis."
            action={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Abrir histórico de atividades concluídas"
                onPress={() => router.push("/reminders/history")}
                style={styles.historyButton}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.historyButtonText}>Histórico</Text>
              </Pressable>
            }
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Agenda em dia"
            message="Crie lembretes dentro de um aquário para acompanhar sua rotina."
          />
        }
        renderItem={({ item }) => (
          <ReminderCard
            item={item}
            busy={done.isPending || remove.isPending}
            onDone={() => done.mutate(item.id)}
            onEdit={() =>
              router.push({
                pathname: "/aquariums/[id]/reminder-edit",
                params: { id: item.aquariumId, reminderId: item.id },
              })
            }
            onDelete={() =>
              Alert.alert("Excluir lembrete?", item.title, [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Excluir",
                  style: "destructive",
                  onPress: () => remove.mutate(item.id),
                },
              ])
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

function ReminderCard({
  item,
  busy,
  onDone,
  onEdit,
  onDelete,
}: {
  item: Reminder;
  busy: boolean;
  onDone: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isDone = item.status === "DONE";
  const dueDate = new Date(item.dueDate);
  const today = new Date();
  const isScheduledForToday = isSameLocalDay(dueDate, today);
  const overdue = !isDone && dueDate < today;
  const missedDate = dueDate < startOfLocalDay(today);
  const completionHint = missedDate
    ? "Data perdida — edite para reagendar"
    : "Disponível para conclusão no dia agendado";
  const type = REMINDER_TYPES.find((entry) => entry.value === item.type)?.label;

  return (
    <Card style={isDone ? styles.doneCard : undefined}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isDone ? "Lembrete concluído" : "Marcar lembrete como concluído"
          }
          disabled={isDone || busy || !isScheduledForToday}
          onPress={onDone}
          style={[
            styles.check,
            isDone && styles.checked,
            !isDone && !isScheduledForToday && styles.checkDisabled,
          ]}
        >
          <Ionicons
            name={isDone ? "checkmark" : "ellipse-outline"}
            size={22}
            color={isDone ? "#fff" : theme.colors.primary}
          />
        </Pressable>
        <View style={styles.contentText}>
          <Text style={[styles.title, isDone && styles.doneText]}>
            {item.title}
          </Text>
          <Text style={styles.meta}>
            {item.aquarium?.name ?? "Aquário"} • {type}
          </Text>
          {item.equipment ? (
            <Text style={styles.meta}>Equipamento: {item.equipment.name}</Text>
          ) : null}
          <Text style={[styles.date, overdue && styles.overdue]}>
            {overdue ? "Atrasado • " : ""}
            {new Date(item.dueDate).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={styles.meta}>
            {formatReminderRecurrence(item.repeatEveryDays)}
          </Text>
          {!isDone && !isScheduledForToday ? (
            <Text style={styles.completionHint}>{completionHint}</Text>
          ) : null}
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${item.title}`}
            disabled={busy}
            onPress={onEdit}
            hitSlop={8}
          >
            <Ionicons
              name="create-outline"
              color={theme.colors.primary}
              size={19}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Excluir ${item.title}`}
            disabled={busy}
            onPress={onDelete}
            hitSlop={8}
          >
            <Ionicons
              name="trash-outline"
              color={theme.colors.danger}
              size={19}
            />
          </Pressable>
        </View>
      </View>
      {missedDate && !isDone ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Reagendar atividade ${item.title}`}
          disabled={busy}
          onPress={onEdit}
          style={({ pressed }) => [
            styles.rescheduleButton,
            (pressed || busy) && styles.rescheduleButtonPressed,
          ]}
        >
          <Ionicons name="calendar" size={19} color="#fff" />
          <Text style={styles.rescheduleText}>Reagendar atividade</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </Pressable>
      ) : null}
    </Card>
  );
}

function isSameLocalDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 22, paddingBottom: 100 },
  grow: { flexGrow: 1 },
  doneCard: { opacity: 0.65 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  check: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { backgroundColor: theme.colors.success },
  checkDisabled: { opacity: 0.4 },
  contentText: { flex: 1 },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: "800" },
  doneText: { textDecorationLine: "line-through" },
  meta: { color: theme.colors.muted, fontSize: 12, marginTop: 4 },
  date: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  overdue: { color: theme.colors.danger },
  completionHint: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
  },
  rescheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primary,
  },
  rescheduleButtonPressed: { opacity: 0.65 },
  rescheduleText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  actions: { gap: 18, paddingLeft: 5 },
  separator: { height: 12 },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
  },
  historyButtonText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
});
