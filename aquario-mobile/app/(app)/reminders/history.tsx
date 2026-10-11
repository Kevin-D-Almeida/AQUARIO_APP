import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

import {
  REMINDER_TYPES,
  formatReminderRecurrence,
} from "@/src/features/reminders/model/reminder.types";
import {
  getReminders,
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

export default function ReminderHistoryScreen() {
  const query = useQuery({
    queryKey: reminderKeys.all,
    queryFn: getReminders,
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  const completed = (query.data ?? [])
    .filter((reminder) => reminder.status === "DONE")
    .sort(
      (a, b) =>
        +new Date(b.completedAt ?? b.updatedAt) -
        +new Date(a.completedAt ?? a.updatedAt),
    );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={completed}
        keyExtractor={(item) => String(item.id)}
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
        contentContainerStyle={[
          styles.content,
          !completed.length && styles.grow,
        ]}
        ListHeaderComponent={
          <ScreenHeader
            eyebrow="HISTÓRICO"
            title="Atividades concluídas"
            subtitle="Seu registro de cuidados realizados nos aquários."
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Nenhuma atividade concluída"
            message="As tarefas finalizadas aparecerão aqui."
          />
        }
        renderItem={({ item }) => {
          const type = REMINDER_TYPES.find(
            (entry) => entry.value === item.type,
          )?.label;
          return (
            <Card>
              <View style={styles.row}>
                <View style={styles.icon}>
                  <Ionicons name="checkmark" size={22} color="#fff" />
                </View>
                <View style={styles.textContent}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.meta}>
                    {item.aquarium?.name ?? "Aquário"} • {type}
                  </Text>
                  {item.equipment ? (
                    <Text style={styles.meta}>
                      Equipamento: {item.equipment.name}
                    </Text>
                  ) : null}
                  <Text style={styles.completedAt}>
                    Concluído em{" "}
                    {new Date(
                      item.completedAt ?? item.updatedAt,
                    ).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  {item.repeatEveryDays ? (
                    <Text style={styles.meta}>
                      {formatReminderRecurrence(item.repeatEveryDays)}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Card>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 22, paddingBottom: 100 },
  grow: { flexGrow: 1 },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.success,
  },
  textContent: { flex: 1 },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: "800" },
  meta: { color: theme.colors.muted, fontSize: 12, marginTop: 4 },
  completedAt: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  separator: { height: 12 },
});
