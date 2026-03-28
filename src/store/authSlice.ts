import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthUser = Record<string, unknown> | null;

interface AuthState {
  user: AuthUser;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user?: AuthUser }>) => {
      if (action.payload.user !== undefined) {
        state.user = action.payload.user;
        state.initialized = true;
      }
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.initialized = true;
    },
    setAuthInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.initialized = true;
    },
  },
});

export const { setCredentials, setUser, setAuthInitialized, logout } =
  authSlice.actions;
export default authSlice.reducer;
