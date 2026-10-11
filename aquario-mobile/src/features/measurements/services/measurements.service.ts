import { api } from "@/src/shared/services/api";
import type {
  CreateMeasurementRequest,
  Measurement,
  UpdateMeasurementRequest,
} from "../model/measurement.types";

export async function createMeasurement(data: CreateMeasurementRequest) {
  const response = await api.post<Measurement>("/measurements", data);
  return response.data;
}

export async function getMeasurement(id: number) {
  const response = await api.get<Measurement>(`/measurements/${id}`);
  return response.data;
}

export async function updateMeasurement({
  id,
  data,
}: {
  id: number;
  data: UpdateMeasurementRequest;
}) {
  const response = await api.patch<Measurement>(`/measurements/${id}`, data);
  return response.data;
}

export async function deleteMeasurement(id: number) {
  await api.delete(`/measurements/${id}`);
}
