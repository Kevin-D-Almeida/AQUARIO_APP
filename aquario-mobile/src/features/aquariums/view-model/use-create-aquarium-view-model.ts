import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import type { AquariumType } from "../model/aquarium.types";
import { aquariumKeys } from "../queries/aquarium.queries";
import {
  setAquariumOnboardingStep,
} from "../services/aquarium-onboarding.service";
import { createAquarium } from "../services/aquariums.service";
import { getErrorMessage } from "@/src/shared/utils/error-message";
import { showSuccess } from "@/src/shared/utils/feedback";
import { useAuth } from "@/src/providers/auth-provider";

export function useCreateAquariumViewModel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const [canLeaveOnboardingStep, setCanLeaveOnboardingStep] = useState(false);
  const [createdAquariumId, setCreatedAquariumId] = useState<number | null>(
    null,
  );
  const [name, setName] = useState("");
  const [type, setType] = useState<AquariumType>("FRESHWATER");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [depthCm, setDepthCm] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createAquarium,
    onSuccess: async (aquarium) => {
      setName("");
      setType("FRESHWATER");
      setWidthCm("");
      setHeightCm("");
      setDepthCm("");
      setDescription("");
      setErrorMessage(null);
      showSuccess("Aquário cadastrado.");
      if (onboarding === "true") {
        if (!user) return;
        await setAquariumOnboardingStep(
          user.id,
          "equipment",
          aquarium.id,
        );
        setCreatedAquariumId(aquarium.id);
        setCanLeaveOnboardingStep(true);
      } else {
        router.back();
      }
      void queryClient.invalidateQueries({ queryKey: aquariumKeys.all });
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
    isOnboarding: onboarding === "true",
    canLeaveOnboardingStep,
    createdAquariumId,
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
