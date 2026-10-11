import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { formatAquariumType } from "@/src/features/aquariums/model/aquarium.constants";
import type { Aquarium } from "@/src/features/aquariums/model/aquarium.types";
import { useAquariumsViewModel } from "@/src/features/aquariums/view-model/use-aquariums-view-model";
import {
  Card,
  EmptyState,
  LoadingState,
  PrimaryButton,
  ScreenHeader,
} from "@/src/shared/components/ui";
import { theme } from "@/src/shared/theme/theme";

export default function AquariumsScreen() {
  const { aquariums, isLoading, isError, refresh, isRefreshing } =
    useAquariumsViewModel();

  if (isLoading) return <LoadingState />;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={aquariums}
        keyExtractor={(item) => String(item.id)}
        refreshing={isRefreshing}
        onRefresh={refresh}
        contentContainerStyle={[
          styles.content,
          !aquariums.length && styles.grow,
        ]}
        ListHeaderComponent={
          <>
            <ScreenHeader
              eyebrow="PAINEL"
              title="Meus aquários"
              subtitle="A saúde de cada ecossistema em um só lugar."
            />

            <CreateAquariumCard />

            {isError ? (
              <Card style={styles.errorCard}>
                <Text style={styles.errorTitle}>
                  Não foi possível sincronizar
                </Text>
                <Text style={styles.muted}>
                  Verifique a API e tente novamente.
                </Text>
                <PrimaryButton
                  title="Tentar novamente"
                  variant="ghost"
                  onPress={() => refresh()}
                />
              </Card>
            ) : null}

            {aquariums.length ? (
              <View style={styles.listHeading}>
                <View>
                  <Text style={styles.listTitle}>Seus ecossistemas</Text>
                  <Text style={styles.listSubtitle}>
                    Toque em um aquário para ver os detalhes
                  </Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{aquariums.length}</Text>
                </View>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !isError ? (
            <EmptyState
              title="Nenhum aquário cadastrado"
              message="Use o botão acima para cadastrar seu primeiro ecossistema."
            />
          ) : null
        }
        renderItem={({ item }) => <AquariumCard aquarium={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

function CreateAquariumCard() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Cadastrar um novo aquário"
      accessibilityHint="Abre o formulário de cadastro de aquário"
      onPress={() => router.push("/aquariums/create")}
      style={({ pressed }) => [
        styles.createCard,
        pressed && styles.createCardPressed,
      ]}
    >
      <View style={styles.createIcon}>
        <Ionicons name="add" size={27} color="#fff" />
      </View>

      <View style={styles.createTextContainer}>
        <Text style={styles.createTitle}>Cadastrar novo aquário</Text>
        <Text style={styles.createSubtitle}>
          Adicione dimensões, tipo e informações básicas
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={22} color={theme.colors.primary} />
    </Pressable>
  );
}

function AquariumCard({ aquarium }: { aquarium: Aquarium }) {
  const measurements = aquarium.measurements?.length ?? 0;
  const reminders =
    aquarium.reminders?.filter((item) => item.status === "PENDING").length ?? 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir aquário ${aquarium.name}`}
      onPress={() =>
        router.push({
          pathname: "/aquariums/[id]",
          params: { id: aquarium.id },
        })
      }
      style={({ pressed }) => pressed && styles.aquariumCardPressed}
    >
      <Card>
        <View style={styles.cardTop}>
          <View style={styles.waterIcon}>
            <Ionicons name="water" color={theme.colors.primary} size={23} />
          </View>

          <View style={styles.cardHeading}>
            <Text style={styles.cardTitle}>{aquarium.name}</Text>
            <Text style={styles.muted}>
              {formatAquariumType(aquarium.type)}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            color={theme.colors.muted}
            size={20}
          />
        </View>

        <View style={styles.metrics}>
          <Metric
            label="Volume"
            value={`${aquarium.volumeLiters.toFixed(1)} L`}
          />
          <Metric label="Medições" value={String(measurements)} />
          <Metric label="Pendências" value={String(reminders)} />
        </View>

        <Text style={styles.dimensions}>
          {aquarium.widthCm} × {aquarium.heightCm} × {aquarium.depthCm} cm
        </Text>
      </Card>
    </Pressable>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 22,
    paddingBottom: 100,
  },
  grow: {
    flexGrow: 1,
  },
  createCard: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    marginBottom: 26,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#B9E0DE",
    backgroundColor: theme.colors.primarySoft,
  },
  createCardPressed: {
    opacity: 0.68,
    transform: [{ scale: 0.99 }],
  },
  createIcon: {
    width: 52,
    height: 52,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    ...theme.shadow,
  },
  createTextContainer: {
    flex: 1,
  },
  createTitle: {
    color: theme.colors.primaryDark,
    fontSize: 16,
    fontWeight: "900",
  },
  createSubtitle: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  listHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  listTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  listSubtitle: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
  },
  countText: {
    color: theme.colors.primaryDark,
    fontWeight: "900",
  },
  aquariumCardPressed: {
    opacity: 0.72,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardHeading: {
    flex: 1,
  },
  waterIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
  muted: {
    color: theme.colors.muted,
    fontSize: 14,
  },
  metrics: {
    flexDirection: "row",
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  metric: {
    flex: 1,
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  dimensions: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 14,
  },
  separator: {
    height: 14,
  },
  errorCard: {
    gap: 10,
    marginBottom: 18,
  },
  errorTitle: {
    color: theme.colors.danger,
    fontSize: 17,
    fontWeight: "800",
  },
});
