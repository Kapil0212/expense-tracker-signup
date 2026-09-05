import React, { useState } from 'react';
import ExpenseEditForm from './ExpenseEditForm';

function ExpenseList({
  expenses,
  loading,
  onUpdateExpense,
  onDeleteExpense,
}) {
  const [editingExpenseId, setEditingExpenseId] =
    useState(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  const handleUpdate = async (
    expenseId,
    updatedExpense
  ) => {
    setActionLoading(true);

    const success = await onUpdateExpense(
      expenseId,
      updatedExpense
    );

    setActionLoading(false);

    if (success) {
      setEditingExpenseId(null);
    }
  };

  const handleDelete = async (expenseId) => {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this expense?'
    );

    if (!shouldDelete) {
      return;
    }

    setActionLoading(true);

    await onDeleteExpense(expenseId);

    setActionLoading(false);
  };

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
        expenses.map((expense) => {
          const isEditing =
            editingExpenseId === expense.id;

          if (isEditing) {
            return (
              <div
                className="expense-item expense-editing"
                key={expense.id}
              >
                <ExpenseEditForm
                  expense={expense}
                  onUpdate={handleUpdate}
                  onCancel={() =>
                    setEditingExpenseId(null)
                  }
                  loading={actionLoading}
                />
              </div>
            );
          }

          return (
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

              <div className="expense-right">
                <div className="expense-amount">
                  ₹
                  {Number(expense.amount).toFixed(
                    2
                  )}
                </div>

                <div className="expense-actions">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() =>
                      setEditingExpenseId(
                        expense.id
                      )
                    }
                    disabled={actionLoading}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(expense.id)
                    }
                    disabled={actionLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

export default ExpenseList;