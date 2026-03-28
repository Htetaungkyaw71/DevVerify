import axios from "axios";
import { API_BASE_URL, ONLINE_COMPILER_ENDPOINT } from "@/lib/apiConfig";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const onlineCompilerApi = axios.create({
  baseURL: ONLINE_COMPILER_ENDPOINT,
  withCredentials: true,
});

onlineCompilerApi.interceptors.request.use((config) => {
  config.headers["Content-Type"] = "application/json";

  return config;
});

export default api;
