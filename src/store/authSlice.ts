import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthUser = Record<string, unknown> | null;

interface AuthState {
  token: string | null;
  user: AuthUser;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user?: AuthUser }>,
    ) => {
      state.token = action.payload.token;
      if (action.payload.user !== undefined) {
        state.user = action.payload.user;
      }
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
