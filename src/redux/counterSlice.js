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

    decrement(state) {
      state.counter -= 1;
    },

    incrementBy2(state) {
      state.counter += 2;
    },

    decrementBy2(state) {
      state.counter -= 2;
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
  decrement,
  incrementBy2,
  decrementBy2,
  incrementBy5,
  decrementBy5,
} = counterSlice.actions;

export default counterSlice.reducer;