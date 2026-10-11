import { api } from "@/src/shared/services/api";
import type {
  CreateEquipmentRequest,
  Equipment,
  UpdateEquipmentRequest,
} from "../model/equipment.types";

export async function createEquipment(data: CreateEquipmentRequest) {
  const response = await api.post<Equipment>("/equipment", data);
  return response.data;
}

export async function getEquipment(id: number) {
  const response = await api.get<Equipment>(`/equipment/${id}`);
  return response.data;
}

export async function updateEquipment({
  id,
  data,
}: {
  id: number;
  data: UpdateEquipmentRequest;
}) {
  const response = await api.patch<Equipment>(`/equipment/${id}`, data);
  return response.data;
}

export async function deleteEquipment(id: number) {
  await api.delete(`/equipment/${id}`);
}
