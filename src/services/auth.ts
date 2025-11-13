// Chave para guardar o token no localStorage
const TOKEN_KEY = "ecoponto-token";

/**
 * Guarda o token JWT no localStorage.
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Recupera o token JWT do localStorage.
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove o token JWT do localStorage (logout).
 */
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Verifica se o utilizador está autenticado (se existe um token).
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};
