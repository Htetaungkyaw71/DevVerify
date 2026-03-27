import axios from "axios";
import { store } from "@/store";
import { API_BASE_URL } from "@/lib/apiConfig";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const onlineCompilerApi = axios.create({
  baseURL: "/api/onlinecompiler/execute",
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

onlineCompilerApi.interceptors.request.use((config) => {
  const apiKey = import.meta.env.VITE_ONLINECOMPILER_API_KEY;

  if (apiKey) {
    config.headers.Authorization = apiKey;
  }

  config.headers["Content-Type"] = "application/json";

  return config;
});

export default api;
