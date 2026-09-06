import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

function Counter() {
  const counter = useSelector((state) => state.counter);
  const dispatch = useDispatch();

  const handleIncrementFiveTimes = () => {
    for (let i = 0; i < 5; i += 1) {
      dispatch({ type: 'increment' });
    }
  };

  const handleDecrement = () => {
    dispatch({ type: 'decrement' });
  };

  const handleIncrementBy2 = () => {
    dispatch({ type: 'INCREMENTBY2' });
  };

  const handleDecrementBy2 = () => {
    dispatch({ type: 'DECREMENTBY2' });
  };

  return (
    <section className="counter-section">
      <h3>Redux Counter</h3>

      <p className="counter-value">
        Counter: {counter}
      </p>

      <div className="counter-actions">
        <button
          type="button"
          onClick={handleIncrementFiveTimes}
        >
          Increment 5 Times
        </button>

        <button
          type="button"
          onClick={handleDecrement}
        >
          Decrement
        </button>

        <button
          type="button"
          onClick={handleIncrementBy2}
        >
          Increment By 2
        </button>

        <button
          type="button"
          onClick={handleDecrementBy2}
        >
          Decrement By 2
        </button>
      </div>
    </section>
  );
}

export default Counter;