import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import { API_BASE_URL } from "@/lib/apiConfig";

export interface ChallengeSummary {
  _id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  tags: string[];
}

export interface ChallengesResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: ChallengeSummary[];
}

export interface ChallengeDetail {
  _id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  tags: string[];
  description?: string;
  problemStatement?: string;
  prompt?: string;
  hints?: string[];
  boilerplateCode?: Record<string, string>;
}

export interface ChallengeDetailResponse {
  success: boolean;
  data: ChallengeDetail;
}

export interface ChallengeTag {
  _id: string;
  name: string;
  count: number;
}

export interface ChallengeTagsResponse {
  success: boolean;
  data: ChallengeTag[];
}

export interface ChallengesQueryParams {
  page: number;
  limit: number;
  difficulty?: string;
  category?: string;
  tags?: string;
  search?: string;
}

export const challengesApi = createApi({
  reducerPath: "challengesApi",
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
    getChallenges: builder.query<ChallengesResponse, ChallengesQueryParams>({
      query: ({ page, limit, difficulty, category, tags, search }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (difficulty) params.set("difficulty", difficulty);
        if (category) params.set("category", category);
        if (tags) params.set("tags", tags);
        if (search) params.set("search", search);

        return `/challenges?${params.toString()}`;
      },
    }),
    getChallengeById: builder.query<ChallengeDetailResponse, string>({
      query: (id) => `/challenges/${id}`,
    }),
    getTags: builder.query<ChallengeTagsResponse, void>({
      query: () => "/tags",
    }),
  }),
});

export const {
  useGetChallengesQuery,
  useGetChallengeByIdQuery,
  useGetTagsQuery,
} = challengesApi;
