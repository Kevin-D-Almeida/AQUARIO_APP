export type AquariumType =
  | 'FRESHWATER'
  | 'MARINE'
  | 'BRACKISH'
  | 'PLANTED'
  | 'BLACKWATER';

export type Aquarium = {
  id: number;
  name: string;
  type: AquariumType;

  widthCm: number;
  heightCm: number;
  depthCm: number;
  volumeLiters: number;

  description: string | null;
  imageUrl: string | null;
  setupDate: string | null;

  createdAt: string;
  updatedAt: string;
  userId: number;
};

export type CreateAquariumRequest = {
  name: string;
  type: AquariumType;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  description?: string;
};