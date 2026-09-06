import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  token: '',
  userId: '',
};

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
    },

    logout(state) {
      state.isAuthenticated = false;
      state.token = '';
      state.userId = '';
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;