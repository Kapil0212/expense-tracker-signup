import React from 'react';

function ExpenseList({ expenses, loading }) {
  return (
    <section className="expense-list">
      <h3>Added Expenses</h3>

      {loading ? (
        <p className="no-expenses">
          Loading expenses...
        </p>
      ) : expenses.length === 0 ? (
        <p className="no-expenses">
          No expenses added yet.
        </p>
      ) : (
        expenses.map((expense) => (
          <div
            className="expense-item"
            key={expense.id}
          >
            <div className="expense-info">
              <h4>{expense.description}</h4>

              <p>
                Category: {expense.category}
              </p>
            </div>

            <div className="expense-amount">
              ₹{Number(expense.amount).toFixed(2)}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

export default ExpenseList;