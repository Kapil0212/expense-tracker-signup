import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  expenses: [],
  loading: false,
  error: '',
};

const expensesSlice = createSlice({
  name: 'expenses',

  initialState,

  reducers: {
    setExpenses(state, action) {
      state.expenses = action.payload;
    },

    addExpense(state, action) {
      state.expenses.push(action.payload);
    },

    updateExpense(state, action) {
      const index = state.expenses.findIndex(
        (expense) => expense.id === action.payload.id
      );

      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },

    deleteExpense(state, action) {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },

    setError(state, action) {
      state.error = action.payload;
    },

    clearExpenses(state) {
      state.expenses = [];
      state.error = '';
    },
  },
});

export const {
  setExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  setLoading,
  setError,
  clearExpenses,
} = expensesSlice.actions;

export default expensesSlice.reducer;