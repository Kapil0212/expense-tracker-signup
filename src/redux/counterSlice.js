import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  counter: 0,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.counter += 1;
    },

    incrementBy2(state) {
      state.counter += 2;
    },

    decrement(state) {
      state.counter -= 1;
    },

    incrementBy5(state) {
      state.counter += 5;
    },

    decrementBy5(state) {
      state.counter -= 5;
    },
  },
});

export const {
  increment,
  incrementBy2,
  decrement,
  incrementBy5,
  decrementBy5,
} = counterSlice.actions;

export default counterSlice.reducer;