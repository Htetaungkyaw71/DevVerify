import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { authApi } from "./authApi";
import { challengesApi } from "./challengesApi";
import { positionsApi } from "./positionsApi";
import { submissionsApi } from "./submissionsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [challengesApi.reducerPath]: challengesApi.reducer,
    [positionsApi.reducerPath]: positionsApi.reducer,
    [submissionsApi.reducerPath]: submissionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true,
    }).concat(
      authApi.middleware,
      challengesApi.middleware,
      positionsApi.middleware,
      submissionsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
