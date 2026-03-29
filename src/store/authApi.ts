import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials } from "./authSlice";
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

  return {
    user: payload?.user,
  };
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
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
        localStorage.setItem("devverify:has_session", "true");
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
        localStorage.setItem("devverify:has_session", "true");
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
