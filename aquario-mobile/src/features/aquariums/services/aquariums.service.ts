import { api } from "@/src/shared/services/api";
import type {
  Aquarium,
  CreateAquariumRequest,
  UpdateAquariumRequest,
} from "../model/aquarium.types";

export async function getAquariums(): Promise<Aquarium[]> {
  const response = await api.get<Aquarium[]>("/aquariums");

  return response.data;
}

export async function createAquarium(
  data: CreateAquariumRequest,
): Promise<Aquarium> {
  const response = await api.post<Aquarium>("/aquariums", data);
  return response.data;
}

export async function getAquarium(id: number): Promise<Aquarium> {
  const response = await api.get<Aquarium>(`/aquariums/${id}`);
  return response.data;
}

export async function updateAquarium({
  id,
  data,
}: {
  id: number;
  data: UpdateAquariumRequest;
}): Promise<Aquarium> {
  const response = await api.patch<Aquarium>(`/aquariums/${id}`, data);
  return response.data;
}

export async function deleteAquarium(id: number): Promise<void> {
  await api.delete(`/aquariums/${id}`);
}
