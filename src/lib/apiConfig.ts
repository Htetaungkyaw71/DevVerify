const DEFAULT_API_BASE_URL = "http://localhost:5001/api";

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");
const normalizePath = (path: string) => `/${path.replace(/^\/+/, "")}`;

const configuredBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const API_BASE_URL = normalizeBaseUrl(configuredBaseUrl);

export const API_AUTH_GITHUB_URL = `${API_BASE_URL}/auth/github`;

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const defaultOnlineCompilerEndpoint = `${API_BASE_URL}/onlinecompiler/execute`;

const configuredOnlineCompilerEndpoint =
  import.meta.env.VITE_ONLINECOMPILER_ENDPOINT?.trim();

const resolveOnlineCompilerEndpoint = () => {
  if (!configuredOnlineCompilerEndpoint) {
    return defaultOnlineCompilerEndpoint;
  }

  if (/^https?:\/\//i.test(configuredOnlineCompilerEndpoint)) {
    return normalizeBaseUrl(configuredOnlineCompilerEndpoint);
  }

  const normalizedPath = normalizePath(configuredOnlineCompilerEndpoint);

  if (normalizedPath.startsWith("/api/")) {
    return `${API_ORIGIN}${normalizedPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
};

export const ONLINE_COMPILER_ENDPOINT = resolveOnlineCompilerEndpoint();
