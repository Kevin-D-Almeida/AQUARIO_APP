import * as SecureStore from "expo-secure-store";

const ONBOARDING_STATUS_KEY = "aquario.first-aquarium-onboarding.status.v2";
const ONBOARDING_PROGRESS_KEY = "aquario.first-aquarium-onboarding.progress.v1";

export type AquariumOnboardingStep =
  | "aquarium"
  | "equipment"
  | "reminder"
  | "measurement";

export type AquariumOnboardingStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export type AquariumOnboardingProgress = {
  status: AquariumOnboardingStatus;
  step: AquariumOnboardingStep | null;
  aquariumId: number | null;
};

export async function getAquariumOnboardingProgress(
  userId: number,
): Promise<AquariumOnboardingProgress> {
  const key = `${ONBOARDING_PROGRESS_KEY}.${userId}`;
  const stored = await SecureStore.getItemAsync(key);
  if (stored) {
    try {
      const progress = JSON.parse(stored) as AquariumOnboardingProgress;
      if (
        progress.status === "completed" ||
        (progress.status === "in-progress" &&
          ["aquarium", "equipment", "reminder", "measurement"].includes(
            progress.step ?? "",
          ))
      ) {
        return progress;
      }
    } catch {
      await SecureStore.deleteItemAsync(key);
    }
  }

  const legacyStatus = await SecureStore.getItemAsync(
    `${ONBOARDING_STATUS_KEY}.${userId}`,
  );
  if (legacyStatus === "completed") {
    return { status: "completed", step: null, aquariumId: null };
  }
  if (legacyStatus === "in-progress") {
    return { status: "in-progress", step: "aquarium", aquariumId: null };
  }
  return { status: "not-started", step: null, aquariumId: null };
}

export async function getAquariumOnboardingStatus(
  userId: number,
): Promise<AquariumOnboardingStatus> {
  return (await getAquariumOnboardingProgress(userId)).status;
}

export async function startAquariumOnboarding(userId: number) {
  await setAquariumOnboardingStep(userId, "aquarium");
}

export async function setAquariumOnboardingStep(
  userId: number,
  step: AquariumOnboardingStep,
  aquariumId?: number,
) {
  const current = await getAquariumOnboardingProgress(userId);
  const progress: AquariumOnboardingProgress = {
    status: "in-progress",
    step,
    aquariumId: aquariumId ?? current.aquariumId,
  };
  await SecureStore.setItemAsync(
    `${ONBOARDING_PROGRESS_KEY}.${userId}`,
    JSON.stringify(progress),
  );
  await SecureStore.setItemAsync(
    `${ONBOARDING_STATUS_KEY}.${userId}`,
    "in-progress",
  );
}

export async function completeAquariumOnboarding(userId: number) {
  await SecureStore.setItemAsync(
    `${ONBOARDING_PROGRESS_KEY}.${userId}`,
    JSON.stringify({ status: "completed", step: null, aquariumId: null }),
  );
  await SecureStore.setItemAsync(
    `${ONBOARDING_STATUS_KEY}.${userId}`,
    "completed",
  );
}
