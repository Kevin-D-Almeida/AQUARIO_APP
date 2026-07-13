import { useQuery } from '@tanstack/react-query';

import { getAquariums } from '../services/aquariums.service';

export function useAquariumsViewModel() {
  const query = useQuery({
    queryKey: ['aquariums'],
    queryFn: getAquariums,
  });

  return {
    aquariums: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refresh: query.refetch,
    isRefreshing: query.isRefetching,
  };
}