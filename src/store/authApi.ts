import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials } from "./authSlice";
import type { RootState } from "./index.js";
import { API_BASE_URL } from "@/lib/apiConfig";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  code: string;
}

interface AuthPayload {
  token: string;
  user?: Record<string, unknown> | null;
}

interface ForgotPasswordRequest {
  email: string;
}

interface SendRegisterOtpRequest {
  email: string;
}

interface SendRegisterOtpResponse {
  message: string;
  email: string;
}

interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

const normalizeAuthResponse = (response: any): AuthPayload => {
  const payload = response?.data ?? response;
  const token = payload?.token ?? payload?.accessToken ?? payload?.jwt;

  if (!token) {
    throw new Error("Authentication token not found in server response.");
  }

  return {
    token,
    user: payload?.user,
  };
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthPayload, LoginRequest>({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      transformResponse: normalizeAuthResponse,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    register: builder.mutation<AuthPayload, RegisterRequest>({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
      transformResponse: normalizeAuthResponse,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    sendRegisterOtp: builder.mutation<
      SendRegisterOtpResponse,
      SendRegisterOtpRequest
    >({
      query: (body) => ({
        url: "/register/send-otp",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation<
      { message: string },
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (body) => ({
        url: "/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendRegisterOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
