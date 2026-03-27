import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import { API_BASE_URL } from "@/lib/apiConfig";

export type PositionChallengeInput = {
  id: string;
  timeLimit: number;
};

export type PopulatedChallenge = {
  _id: string;
  title: string;
  slug?: string;
  difficulty?: string;
  category?: string;
};

export type PositionChallenge = {
  challengeId: string | PopulatedChallenge;
  timeLimit: number;
  _id?: string;
};

export type Position = {
  _id: string;
  title: string;
  recruiterId: string;
  challenges: PositionChallenge[];
  inviteToken: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CreatePositionRequest = {
  title: string;
  challenges: PositionChallengeInput[];
};

type UpdatePositionRequest = {
  id: string;
  body: {
    title?: string;
    challenges?: PositionChallengeInput[];
    isActive?: boolean;
  };
};

type CreatePositionResponse = {
  message: string;
  position: Position;
  inviteLink: string;
};

type PositionResponse = {
  position: Position;
};

type PositionsResponse = {
  positions: Position[];
};

type MessageResponse = {
  message: string;
};

export const positionsApi = createApi({
  reducerPath: "positionsApi",
  tagTypes: ["Positions", "Position"],
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
    createPosition: builder.mutation<
      CreatePositionResponse,
      CreatePositionRequest
    >({
      query: (body) => ({
        url: "/positions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Positions"],
    }),
    getMyPositions: builder.query<PositionsResponse, void>({
      query: () => "/positions",
      providesTags: (result) =>
        result
          ? [
              ...result.positions.map((position) => ({
                type: "Position" as const,
                id: position._id,
              })),
              { type: "Positions" as const, id: "LIST" },
            ]
          : [{ type: "Positions" as const, id: "LIST" }],
    }),
    getMyPositionById: builder.query<PositionResponse, string>({
      query: (id) => `/positions/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "Position", id },
        { type: "Positions", id: "LIST" },
      ],
    }),
    updateMyPosition: builder.mutation<PositionResponse, UpdatePositionRequest>(
      {
        query: ({ id, body }) => ({
          url: `/positions/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: "Position", id },
          { type: "Positions", id: "LIST" },
        ],
      },
    ),
    deleteMyPosition: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `/positions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Position", id },
        { type: "Positions", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreatePositionMutation,
  useGetMyPositionsQuery,
  useGetMyPositionByIdQuery,
  useUpdateMyPositionMutation,
  useDeleteMyPositionMutation,
} = positionsApi;
