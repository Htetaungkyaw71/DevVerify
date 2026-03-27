const DEFAULT_API_BASE_URL = "http://localhost:5001/api";

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const configuredBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const API_BASE_URL = normalizeBaseUrl(configuredBaseUrl);

export const API_AUTH_GITHUB_URL = `${API_BASE_URL}/auth/github`;
