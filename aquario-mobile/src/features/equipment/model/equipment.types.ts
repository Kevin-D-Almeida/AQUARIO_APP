export type EquipmentType =
  | "FILTER_HANG_ON"
  | "FILTER_CANISTER"
  | "FILTER_INTERNAL"
  | "FILTER_SPONGE"
  | "SUMP"
  | "HEATER"
  | "LIGHTING"
  | "CO2"
  | "UV_FILTER"
  | "AIR_PUMP"
  | "OTHER";

export type Equipment = {
  id: number;
  name: string;
  type: EquipmentType;
  brand: string | null;
  model: string | null;
  biologicalCapacityLiters: number | null;
  maintenanceIntervalDays: number | null;
  installedAt: string | null;
  lastMaintenanceAt: string | null;
  aquariumId: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateEquipmentRequest = {
  name: string;
  type: EquipmentType;
  aquariumId: number;
  brand?: string;
  model?: string;
  biologicalCapacityLiters?: number;
  maintenanceIntervalDays?: number;
};

export type UpdateEquipmentRequest = Partial<
  Omit<CreateEquipmentRequest, "aquariumId">
>;

export const EQUIPMENT_TYPES: { value: EquipmentType; label: string }[] = [
  { value: "FILTER_HANG_ON", label: "Filtro Hang-on" },
  { value: "FILTER_CANISTER", label: "Filtro Canister" },
  { value: "FILTER_INTERNAL", label: "Filtro interno" },
  { value: "FILTER_SPONGE", label: "Filtro de esponja" },
  { value: "SUMP", label: "Sump" },
  { value: "HEATER", label: "Aquecedor" },
  { value: "LIGHTING", label: "Iluminação" },
  { value: "CO2", label: "CO₂" },
  { value: "UV_FILTER", label: "Filtro UV" },
  { value: "AIR_PUMP", label: "Bomba de ar" },
  { value: "OTHER", label: "Outro" },
];
