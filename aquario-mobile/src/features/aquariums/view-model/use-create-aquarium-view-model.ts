import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import type { AquariumType } from "../model/aquarium.types";
import { aquariumKeys } from "../queries/aquarium.queries";
import { createAquarium } from "../services/aquariums.service";
import { getErrorMessage } from "@/src/shared/utils/error-message";
import { showSuccess } from "@/src/shared/utils/feedback";

export function useCreateAquariumViewModel() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<AquariumType>("FRESHWATER");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [depthCm, setDepthCm] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: createAquarium,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: aquariumKeys.all });
      setName("");
      setType("FRESHWATER");
      setWidthCm("");
      setHeightCm("");
      setDepthCm("");
      setDescription("");
      setErrorMessage(null);
      showSuccess("Aquário cadastrado.");
      router.back();
    },
    onError: (error) =>
      setErrorMessage(
        getErrorMessage(error, "Não foi possível cadastrar o aquário."),
      ),
  });

  function handleSubmit() {
    if (mutation.isPending) return;
    setErrorMessage(null);
    const parsedWidth = Number(widthCm.replace(",", "."));
    const parsedHeight = Number(heightCm.replace(",", "."));
    const parsedDepth = Number(depthCm.replace(",", "."));
    if (!name.trim()) return setErrorMessage("Informe o nome do aquário.");
    if (
      ![parsedWidth, parsedHeight, parsedDepth].every(
        (value) => Number.isFinite(value) && value > 0,
      )
    )
      return setErrorMessage("Informe dimensões numéricas maiores que zero.");
    mutation.mutate({
      name: name.trim(),
      type,
      widthCm: parsedWidth,
      heightCm: parsedHeight,
      depthCm: parsedDepth,
      description: description.trim() || undefined,
    });
  }
  return {
    name,
    type,
    widthCm,
    heightCm,
    depthCm,
    description,
    isSubmitting: mutation.isPending,
    errorMessage,
    setName,
    setType,
    setWidthCm,
    setHeightCm,
    setDepthCm,
    setDescription,
    handleSubmit,
  };
}
