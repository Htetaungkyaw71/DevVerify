import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/lib/apiConfig";

export interface SubmissionPayload {
  positionId: string;
  challengeId: string;
  language: string;
  submittedCode: string;
}

export interface CodeReviewMetadata {
  tokenUsage?: number;
  processingMs: number;
}

export interface PopulatedUser {
  _id?: string;
  username: string;
  email: string;
}

export interface PopulatedChallenge {
  _id?: string;
  title: string;
  difficulty: string;
}

export interface PopulatedPosition {
  _id?: string;
  title: string;
}

export interface Submission {
  _id: string;
  userId: string | PopulatedUser;
  positionId: string | PopulatedPosition;
  challengeId: string | PopulatedChallenge;
  language: string;
  submittedCode: string;
  status: "pending" | "completed" | "failed";
  marks?: number;
  scoreBreakdown?: {
    logic: number;
    security: number;
    readability: number;
    performance: number;
    cleanliness: number;
  };
  report?: string;
  suggestions?: string[];
  strengths?: string[];
  weaknesses?: string[];
  aiModel?: string;
  metadata?: CodeReviewMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface PositionSubmissionsResponse {
  submissions: Submission[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const submissionsApi = createApi({
  reducerPath: "submissionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["Submission"],
  endpoints: (builder) => ({
    createSubmission: builder.mutation<
      { message: string; submission: Submission },
      SubmissionPayload
    >({
      query: (payload) => ({
        url: "/submissions",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Submission"],
    }),

    getUserChallengeSubmission: builder.query<
      Submission | null,
      { challengeId: string }
    >({
      query: ({ challengeId }) => ({
        url: `/submissions/challenge/${challengeId}`,
        method: "GET",
      }),
      providesTags: ["Submission"],
    }),

    getPositionSubmissions: builder.query<
      PositionSubmissionsResponse,
      { positionId: string; page?: number; limit?: number }
    >({
      query: ({ positionId, page, limit }) => ({
        url: `/submissions/position/${positionId}`,
        method: "GET",
        params: {
          ...(page ? { page } : {}),
          ...(limit ? { limit } : {}),
        },
      }),
      providesTags: ["Submission"],
    }),
  }),
});

export const {
  useCreateSubmissionMutation,
  useGetUserChallengeSubmissionQuery,
  useGetPositionSubmissionsQuery,
} = submissionsApi;
