import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  increment,
  incrementBy2,
  decrement,
  incrementBy5,
  decrementBy5,
} from '../redux/counterSlice';

function Counter() {
  const counter = useSelector(
    (state) => state.counter.counter
  );

  const dispatch = useDispatch();

  return (
    <section className="redux-counter-card">
      <h3>REDUX COUNTER</h3>

      <div className="counter-number">
        {counter}
      </div>

      <div className="counter-row">
        <button
          type="button"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>

        <button
          type="button"
          onClick={() => dispatch(incrementBy5())}
        >
          Increase by 5
        </button>

        <button
          type="button"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
      </div>

      <div className="counter-row">
        <button
          type="button"
          onClick={() => dispatch(incrementBy2())}
        >
          Increase by 2
        </button>

        <button
          type="button"
          onClick={() => dispatch(decrementBy5())}
        >
          Decrement by 5
        </button>
      </div>
    </section>
  );
}

export default Counter;