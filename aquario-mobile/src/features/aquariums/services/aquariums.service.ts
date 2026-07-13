import { api } from '@/src/shared/services/api';
import type { Aquarium,CreateAquariumRequest } from '../model/aquarium.types';

export async function getAquariums(): Promise<Aquarium[]> {
  const response = await api.get<Aquarium[]>('/aquariums');

  return response.data;
}

export async function createAquarium(data: CreateAquariumRequest): Promise<Aquarium>{

  const response = await api.post<Aquarium>('/aquariums',data)
  return response.data

}

export async function deleateAquarium(): Promise<Aquarium>{

  const response = await api.delete<Aquarium>('/aquariums')

  return response.data
}