import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { formatAquariumType } from "@/src/features/aquariums/model/aquarium.constants";
import { aquariumKeys } from "@/src/features/aquariums/queries/aquarium.queries";
import {
  deleteAquarium,
  getAquarium,
} from "@/src/features/aquariums/services/aquariums.service";
import { deleteEquipment } from "@/src/features/equipment/services/equipment.service";
import { MEASUREMENT_TYPES } from "@/src/features/measurements/model/measurement.types";
import { deleteMeasurement } from "@/src/features/measurements/services/measurements.service";
import {
  REMINDER_TYPES,
  formatReminderRecurrence,
} from "@/src/features/reminders/model/reminder.types";
import {
  deleteReminder,
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

export default function AquariumDetailScreen() {
  const rawId = useLocalSearchParams<{ id: string }>().id;
  const id = Number(rawId);
  const validId = Number.isInteger(id) && id > 0;
  const client = useQueryClient();
  const query = useQuery({
    queryKey: aquariumKeys.detail(id),
    queryFn: () => getAquarium(id),
    enabled: validId,
  });

  const removeAquarium = useMutation({
    mutationFn: () => deleteAquarium(id),
    onSuccess: async () => {
      client.removeQueries({ queryKey: aquariumKeys.detail(id) });
      await Promise.all([
        client.invalidateQueries({ queryKey: aquariumKeys.all }),
        client.invalidateQueries({ queryKey: reminderKeys.all }),
      ]);
      showSuccess("Aquário excluído.");
      router.replace("/aquariums");
    },
    onError: (error) =>
      showError("Não foi possível excluir", error),
  });
  const removeMeasurement = useMutation({
    mutationFn: deleteMeasurement,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: aquariumKeys.detail(id) });
      showSuccess("Medição excluída.");
    },
    onError: (error) => showError("Não foi possível excluir a medição", error),
  });
  const removeEquipment = useMutation({
    mutationFn: deleteEquipment,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: aquariumKeys.detail(id) });
      showSuccess("Equipamento excluído.");
    },
    onError: (error) =>
      showError(
        "Não foi possível excluir o equipamento",
        error,
        "Remova primeiro os lembretes relacionados a este equipamento.",
      ),
  });
  const removeReminder = useMutation({
    mutationFn: deleteReminder,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: aquariumKeys.detail(id) }),
        client.invalidateQueries({ queryKey: reminderKeys.all }),
      ]);
      showSuccess("Lembrete excluído.");
    },
    onError: (error) => showError("Não foi possível excluir o lembrete", error),
  });

  if (!validId) {
    return (
      <EmptyState
        title="Aquário inválido"
        message="Volte para a lista e selecione um aquário."
      />
    );
  }
  if (query.isLoading) return <LoadingState />;
  if (query.isError) {
    return <ErrorState onRetry={() => void query.refetch()} />;
  }
  if (!query.data) {
    return (
      <EmptyState
        title="Aquário não encontrado"
        message="Este aquário não está mais disponível."
      />
    );
  }

  const aquarium = query.data;
  const measurements = [...(aquarium.measurements ?? [])].sort(
    (a, b) => +new Date(b.measuredAt) - +new Date(a.measuredAt),
  );
  const reminders = (aquarium.reminders ?? [])
    .filter((reminder) => reminder.status === "PENDING")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));

  function confirmDeleteAquarium() {
    Alert.alert(
      "Excluir aquário?",
      "Todos os lembretes e históricos, equipamentos, medições e dispositivos deste aquário também serão excluídos. Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => removeAquarium.mutate(),
        },
      ],
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow={formatAquariumType(aquarium.type)}
        title={aquarium.name}
        subtitle={aquarium.description || "Seu ecossistema aquático."}
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar aquário"
            onPress={() =>
              router.push({
                pathname: "/aquariums/[id]/edit",
                params: { id },
              })
            }
            style={styles.iconButton}
          >
            <Ionicons
              name="create-outline"
              size={22}
              color={theme.colors.primary}
            />
          </Pressable>
        }
      />

      <Card style={styles.hero}>
        <Text style={styles.volume}>
          {aquarium.volumeLiters.toFixed(1)}{" "}
          <Text style={styles.liters}>litros</Text>
        </Text>
        <View style={styles.dimensions}>
          <Stat value={`${aquarium.widthCm} cm`} label="Largura" />
          <Stat value={`${aquarium.heightCm} cm`} label="Altura" />
          <Stat value={`${aquarium.depthCm} cm`} label="Profundidade" />
        </View>
      </Card>

      <View style={styles.quickRow}>
        <Quick
          icon="flask-outline"
          label="Medição"
          onPress={() =>
            router.push({
              pathname: "/aquariums/[id]/measurement",
              params: { id },
            })
          }
        />
        <Quick
          icon="hardware-chip-outline"
          label="Equipamento"
          onPress={() =>
            router.push({
              pathname: "/aquariums/[id]/equipment",
              params: { id },
            })
          }
        />
        <Quick
          icon="calendar-outline"
          label="Lembrete"
          onPress={() =>
            router.push({
              pathname: "/aquariums/[id]/reminder",
              params: { id },
            })
          }
        />
      </View>

      <Section title="Parâmetros recentes" count={measurements.length}>
        {measurements.length ? (
          measurements.slice(0, 6).map((item) => {
            const config = MEASUREMENT_TYPES.find(
              (type) => type.value === item.type,
            );
            return (
              <ListItem
                key={item.id}
                icon="pulse-outline"
                title={config?.label ?? item.type}
                subtitle={`${new Date(item.measuredAt).toLocaleDateString(
                  "pt-BR",
                )}${item.note ? ` • ${item.note}` : ""}`}
                value={`${item.value} ${item.unit}`}
                onEdit={() =>
                  router.push({
                    pathname: "/aquariums/[id]/measurement-edit",
                    params: { id, measurementId: item.id },
                  })
                }
                onDelete={() =>
                  confirmDelete("Excluir medição?", undefined, () =>
                    removeMeasurement.mutate(item.id),
                  )
                }
              />
            );
          })
        ) : (
          <Text style={styles.muted}>Nenhuma medição registrada.</Text>
        )}
      </Section>

      <Section title="Equipamentos" count={aquarium.equipment?.length ?? 0}>
        {aquarium.equipment?.length ? (
          aquarium.equipment.map((item) => (
            <ListItem
              key={item.id}
              icon="settings-outline"
              title={item.name}
              subtitle={
                [item.brand, item.model].filter(Boolean).join(" • ") ||
                "Sem marca/modelo"
              }
              onEdit={() =>
                router.push({
                  pathname: "/aquariums/[id]/equipment-edit",
                  params: { id, equipmentId: item.id },
                })
              }
              onDelete={() =>
                confirmDelete("Excluir equipamento?", item.name, () =>
                  removeEquipment.mutate(item.id),
                )
              }
            />
          ))
        ) : (
          <Text style={styles.muted}>Nenhum equipamento cadastrado.</Text>
        )}
      </Section>

      <Section title="Próximos cuidados" count={reminders.length}>
        {reminders.length ? (
          reminders.map((item) => (
            <ListItem
              key={item.id}
              icon="calendar-outline"
              title={item.title}
              subtitle={`${new Date(item.dueDate).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })} • ${
                REMINDER_TYPES.find((type) => type.value === item.type)
                  ?.label ?? item.type
              } • ${formatReminderRecurrence(item.repeatEveryDays)}${
                item.status === "DONE" ? " • Concluído" : ""
              }`}
              onEdit={() =>
                router.push({
                  pathname: "/aquariums/[id]/reminder-edit",
                  params: { id, reminderId: item.id },
                })
              }
              onDelete={() =>
                confirmDelete("Excluir lembrete?", item.title, () =>
                  removeReminder.mutate(item.id),
                )
              }
            />
          ))
        ) : (
          <Text style={styles.muted}>Nenhum lembrete criado.</Text>
        )}
      </Section>

      <Pressable onPress={confirmDeleteAquarium} style={styles.deleteAquarium}>
        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        <Text style={styles.deleteText}>Excluir aquário</Text>
      </Pressable>
    </ScrollView>
  );
}

function showError(
  title: string,
  error: unknown,
  fallback = "Tente novamente.",
) {
  Alert.alert(title, getErrorMessage(error, fallback));
}

function confirmDelete(
  title: string,
  message: string | undefined,
  onConfirm: () => void,
) {
  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: "Excluir", style: "destructive", onPress: onConfirm },
  ]);
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Quick({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quick}>
      <Ionicons name={icon} size={23} color={theme.colors.primary} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.badge}>{count}</Text>
      </View>
      <Card style={styles.sectionCard}>{children}</Card>
    </View>
  );
}

function ListItem({
  icon,
  title,
  subtitle,
  value,
  onEdit,
  onDelete,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  value?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.listItem}>
      <View style={styles.itemIcon}>
        <Ionicons name={icon} size={19} color={theme.colors.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
        {value ? <Text style={styles.itemValue}>{value}</Text> : null}
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar ${title}`}
          hitSlop={8}
          onPress={onEdit}
          style={styles.actionButton}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={theme.colors.primary}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${title}`}
          hitSlop={8}
          onPress={onDelete}
          style={styles.actionButton}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={theme.colors.danger}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 22, paddingBottom: 110 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { backgroundColor: theme.colors.primary, borderWidth: 0 },
  volume: { color: "#fff", fontSize: 34, fontWeight: "900" },
  liters: { fontSize: 16, fontWeight: "600", color: "#D8F4F3" },
  dimensions: {
    flexDirection: "row",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#3497A0",
  },
  stat: { flex: 1 },
  statValue: { color: "#fff", fontWeight: "800" },
  statLabel: { color: "#C4EBE9", fontSize: 11, marginTop: 3 },
  quickRow: { flexDirection: "row", gap: 9, marginVertical: 18 },
  quick: {
    flex: 1,
    minHeight: 82,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickLabel: { color: theme.colors.text, fontSize: 11, fontWeight: "700" },
  section: { marginTop: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
    gap: 8,
  },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  badge: {
    color: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: "800",
  },
  sectionCard: { paddingVertical: 8 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primarySoft,
  },
  itemContent: { flex: 1 },
  itemTitle: { color: theme.colors.text, fontWeight: "700" },
  itemSubtitle: { color: theme.colors.muted, fontSize: 12, marginTop: 3 },
  itemValue: {
    color: theme.colors.primaryDark,
    fontWeight: "900",
    marginTop: 4,
  },
  actions: { flexDirection: "row", gap: 4 },
  actionButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  muted: { color: theme.colors.muted, paddingVertical: 12 },
  deleteAquarium: {
    marginTop: 30,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  deleteText: { color: theme.colors.danger, fontWeight: "800" },
});
