import { configureStore } from '@reduxjs/toolkit';

import counterReducer from './counterSlice';
import authReducer from './authSlice';
import themeReducer from './themeSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    theme: themeReducer,
  },
});

export default store;