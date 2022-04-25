import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IUser {
  token: string;
  name: string;
  role: string;
}

interface authState {
  isLoggedIn: boolean;
  user?: IUser;
}

const initialState: authState = {
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: 'AUTH',
  initialState,
  reducers: {
    login: (state, { payload }: PayloadAction<IUser>) => {
      state.isLoggedIn = true;
      state.user = payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = undefined;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;