import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';

import { login } from '../services/auth.service';
import { saveAccessToken } from '@/src/shared/storage/auth-token.storage';

export function useLoginViewModel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await login({
        email,
        password,
      });

        await saveAccessToken(result.accessToken);

        router.replace('/aquariums');

      router.replace('/aquariums');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;

        setErrorMessage(
          typeof apiMessage === 'string'
            ? apiMessage
            : 'Não foi possível realizar o login.',
        );

        return;
      }

      setErrorMessage('Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  }

  return {
    email,
    password,
    isLoading,
    errorMessage,
    setEmail,
    setPassword,
    handleLogin,
  };
}