import { createStore } from 'redux';

const initialState = {
  counter: 0,
};

const counterReducer = (state = initialState, action) => {
  if (action.type === 'increment') {
    return {
      ...state,
      counter: state.counter + 1,
    };
  }

  if (action.type === 'decrement') {
    return {
      ...state,
      counter: state.counter - 1,
    };
  }

  if (action.type === 'INCREMENTBY2') {
    return {
      ...state,
      counter: state.counter + 2,
    };
  }

  if (action.type === 'DECREMENTBY2') {
    return {
      ...state,
      counter: state.counter - 2,
    };
  }

  return state;
};

const store = createStore(counterReducer);

export default store;