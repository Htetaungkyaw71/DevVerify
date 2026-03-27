import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  type PersistConfig,
  persistReducer,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";
import { authApi } from "./authApi";
import { challengesApi } from "./challengesApi";
import { positionsApi } from "./positionsApi";
import { submissionsApi } from "./submissionsApi";

type AuthState = ReturnType<typeof authReducer>;

const authPersistConfig: PersistConfig<AuthState> = {
  key: "auth",
  storage,
  whitelist: ["token", "user"],
};

const persistedAuthReducer = persistReducer<AuthState>(
  authPersistConfig,
  authReducer,
);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    [authApi.reducerPath]: authApi.reducer,
    [challengesApi.reducerPath]: challengesApi.reducer,
    [positionsApi.reducerPath]: positionsApi.reducer,
    [submissionsApi.reducerPath]: submissionsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApi.middleware,
      challengesApi.middleware,
      positionsApi.middleware,
      submissionsApi.middleware,
    ),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
