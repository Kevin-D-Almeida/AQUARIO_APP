import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';

import type { AquariumType } from '../model/aquarium.types';
import { createAquarium } from '../services/aquariums.service';

export function useCreateAquariumViewModel() {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [type, setType] =
    useState<AquariumType>('FRESHWATER');

  const [widthCm, setWidthCm] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [depthCm, setDepthCm] = useState('');
  const [description, setDescription] = useState('');

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createAquarium,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['aquariums'],
      });

      router.back();
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;

        if (Array.isArray(apiMessage)) {
          setErrorMessage(apiMessage.join('\n'));
          return;
        }

        if (typeof apiMessage === 'string') {
          setErrorMessage(apiMessage);
          return;
        }
      }

      setErrorMessage(
        'Não foi possível cadastrar o aquário.',
      );
    },
  });

  function handleSubmit() {
    setErrorMessage(null);

    const parsedWidth = Number(widthCm);
    const parsedHeight = Number(heightCm);
    const parsedDepth = Number(depthCm);

    if (!name.trim()) {
      setErrorMessage('Informe o nome do aquário.');
      return;
    }

    if (
      parsedWidth <= 0 ||
      parsedHeight <= 0 ||
      parsedDepth <= 0
    ) {
      setErrorMessage(
        'As dimensões devem ser maiores que zero.',
      );
      return;
    }

    mutation.mutate({
      name: name.trim(),
      type,
      widthCm: parsedWidth,
      heightCm: parsedHeight,
      depthCm: parsedDepth,
      description: description.trim() || undefined,
    });
  }

  return {
    name,
    type,
    widthCm,
    heightCm,
    depthCm,
    description,

    isSubmitting: mutation.isPending,
    errorMessage,

    setName,
    setType,
    setWidthCm,
    setHeightCm,
    setDepthCm,
    setDescription,
    handleSubmit,
  };
}