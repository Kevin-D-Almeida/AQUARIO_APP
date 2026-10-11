export const aquariumKeys = {
  all: ["aquariums"] as const,
  detail: (id: number) => ["aquariums", id] as const,
};
