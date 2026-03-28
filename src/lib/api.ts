import axios from "axios";
import { store } from "@/store";
import { API_BASE_URL, ONLINE_COMPILER_ENDPOINT } from "@/lib/apiConfig";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const onlineCompilerApi = axios.create({
  baseURL: ONLINE_COMPILER_ENDPOINT,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

onlineCompilerApi.interceptors.request.use((config) => {
  config.headers["Content-Type"] = "application/json";

  return config;
});

export default api;
