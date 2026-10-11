import type { AquariumType } from "./aquarium.types";

export const AQUARIUM_TYPES: { value: AquariumType; label: string }[] = [
  { value: "FRESHWATER", label: "Água doce" },
  { value: "MARINE", label: "Marinho" },
  { value: "BRACKISH", label: "Água salobra" },
  { value: "PLANTED", label: "Plantado" },
  { value: "BLACKWATER", label: "Águas negras" },
];

export function formatAquariumType(type: AquariumType) {
  return AQUARIUM_TYPES.find((item) => item.value === type)?.label ?? type;
}
