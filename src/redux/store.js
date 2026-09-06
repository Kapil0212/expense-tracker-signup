import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import counterReducer from './counterSlice';
import expensesReducer from './expensesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    counter: counterReducer,
    expenses: expensesReducer,
  },
});

export default store;