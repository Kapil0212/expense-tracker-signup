import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDark: false,
};

const themeSlice = createSlice({
  name: 'theme',

  initialState,

  reducers: {
    toggleTheme(state) {
      state.isDark = !state.isDark;
    },

    setDarkTheme(state) {
      state.isDark = true;
    },

    setLightTheme(state) {
      state.isDark = false;
    },
  },
});

export const {
  toggleTheme,
  setDarkTheme,
  setLightTheme,
} = themeSlice.actions;

export default themeSlice.reducer;