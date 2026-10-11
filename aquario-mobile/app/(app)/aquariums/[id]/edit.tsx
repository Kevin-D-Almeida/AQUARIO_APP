import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { aquariumKeys } from "@/src/features/aquariums/queries/aquarium.queries";
import {
  getAquarium,
  updateAquarium,
} from "@/src/features/aquariums/services/aquariums.service";
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

export default function EditAquariumScreen() {
  const id = Number(useLocalSearchParams<{ id: string }>().id);
  const validId = Number.isInteger(id) && id > 0;
  const client = useQueryClient();
  const query = useQuery({
    queryKey: aquariumKeys.detail(id),
    queryFn: () => getAquarium(id),
    enabled: validId,
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [depth, setDepth] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!query.data) return;
    setName(query.data.name);
    setDescription(query.data.description ?? "");
    setWidth(String(query.data.widthCm));
    setHeight(String(query.data.heightCm));
    setDepth(String(query.data.depthCm));
  }, [query.data]);
  const mutation = useMutation({
    mutationFn: updateAquarium,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: aquariumKeys.all }),
        client.invalidateQueries({ queryKey: aquariumKeys.detail(id) }),
      ]);
      showSuccess("Aquário atualizado.");
      router.back();
    },
    onError: (caught) =>
      setError(
        getErrorMessage(caught, "Não foi possível atualizar o aquário."),
      ),
  });
  if (!validId)
    return (
      <EmptyState
        title="Aquário inválido"
        message="Volte para a lista e selecione um aquário."
      />
    );
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data)
    return <ErrorState onRetry={() => void query.refetch()} />;
  function submit() {
    if (mutation.isPending) return;
    const dimensions = [width, height, depth].map((item) =>
      Number(item.replace(",", ".")),
    );
    if (!name.trim()) return setError("Informe o nome.");
    if (!dimensions.every((item) => Number.isFinite(item) && item > 0))
      return setError("Informe dimensões válidas.");
    mutation.mutate({
      id,
      data: {
        name: name.trim(),
        description: description.trim(),
        widthCm: dimensions[0],
        heightCm: dimensions[1],
        depthCm: dimensions[2],
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
          eyebrow="CONFIGURAÇÕES"
          title="Editar aquário"
          subtitle="Ao alterar qualquer dimensão, o volume será recalculado pela API."
        />
        <AppInput label="Nome" value={name} onChangeText={setName} />
        <AppInput
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <AppInput
          label="Largura (cm)"
          value={width}
          onChangeText={setWidth}
          keyboardType="decimal-pad"
        />
        <AppInput
          label="Altura (cm)"
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
        />
        <AppInput
          label="Profundidade (cm)"
          value={depth}
          onChangeText={setDepth}
          keyboardType="decimal-pad"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          title="Salvar alterações"
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
  error: { color: theme.colors.danger },
});
