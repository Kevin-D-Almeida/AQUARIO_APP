import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) {
    return "Ocorreu um erro inesperado. Tente novamente.";
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return "O servidor demorou para responder. Verifique se a API está ligada e tente novamente.";
  }

  if (!error.response) {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "não configurada";
    const diagnostic = __DEV__
      ? `\n\nDiagnóstico: ${error.code ?? "sem código"} • ${error.message} • ${apiUrl}`
      : "";

    return `Sem conexão com o servidor. Confirme o Wi-Fi do celular, o endereço da API e se o backend está ligado.${diagnostic}`;
  }

  if (error.response.status === 401) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  if (error.response.status === 403) {
    return "Você não tem permissão para realizar esta ação.";
  }

  if (error.response.status === 404) {
    return "Este registro não foi encontrado ou já foi removido.";
  }

  if (error.response.status >= 500) {
    return "O servidor encontrou um problema. Tente novamente em instantes.";
  }

  const message = error.response.data?.message;
  if (Array.isArray(message)) return message.join("\n");
  return typeof message === "string" ? message : fallback;
}
