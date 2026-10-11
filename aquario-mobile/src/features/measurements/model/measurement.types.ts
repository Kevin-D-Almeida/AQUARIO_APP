export type MeasurementType =
  | "TEMPERATURE"
  | "PH"
  | "WATER_LEVEL"
  | "AMMONIA"
  | "NITRITE"
  | "NITRATE"
  | "GH"
  | "KH"
  | "TDS"
  | "CONDUCTIVITY";

export type Measurement = {
  id: number;
  type: MeasurementType;
  source: "MANUAL" | "IOT";
  value: number;
  unit: string;
  measuredAt: string;
  note: string | null;
  aquariumId: number;
  deviceId: number | null;
};

export type CreateMeasurementRequest = {
  type: MeasurementType;
  value: number;
  unit: string;
  aquariumId: number;
  source?: "MANUAL" | "IOT";
  note?: string;
  measuredAt?: string;
};

export type UpdateMeasurementRequest = Partial<CreateMeasurementRequest>;

export const MEASUREMENT_TYPES: {
  value: MeasurementType;
  label: string;
  unit: string;
}[] = [
  { value: "TEMPERATURE", label: "Temperatura", unit: "°C" },
  { value: "PH", label: "pH", unit: "pH" },
  { value: "WATER_LEVEL", label: "Nível da água", unit: "%" },
  { value: "AMMONIA", label: "Amônia", unit: "ppm" },
  { value: "NITRITE", label: "Nitrito", unit: "ppm" },
  { value: "NITRATE", label: "Nitrato", unit: "ppm" },
  { value: "GH", label: "GH", unit: "dGH" },
  { value: "KH", label: "KH", unit: "dKH" },
  { value: "TDS", label: "TDS", unit: "ppm" },
  { value: "CONDUCTIVITY", label: "Condutividade", unit: "µS/cm" },
];
