/**
 * Base URL API — prioritas: VITE_API_URL lengkap, atau host + port dari env.
 * Samakan VITE_API_PORT dengan PORT di backend/.env (mis. 5000).
 */
export function getApiBaseUrl(): string {
  const explicit = import.meta.env.VITE_API_URL as string | undefined;
  if (explicit && String(explicit).trim()) {
    return String(explicit).replace(/\/$/, "");
  }
  const host = (import.meta.env.VITE_API_HOST as string | undefined) || "localhost";
  const port = (import.meta.env.VITE_API_PORT as string | undefined) || "5000";
  return `http://${host}:${port}/api`;
}
