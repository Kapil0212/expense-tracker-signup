import React, { useState } from 'react';

function ExpenseEditForm({
  expense,
  onUpdate,
  onCancel,
  loading,
}) {
  const [amount, setAmount] = useState(
    expense.amount
  );

  const [description, setDescription] = useState(
    expense.description
  );

  const [category, setCategory] = useState(
    expense.category
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !amount ||
      !description.trim() ||
      !category
    ) {
      alert('Please fill all expense details.');
      return;
    }

    await onUpdate(expense.id, {
      amount: Number(amount),
      description: description.trim(),
      category,
    });
  };

  return (
    <form
      className="expense-edit-form"
      onSubmit={handleSubmit}
    >
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Money Spent"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={loading}
        required
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        disabled={loading}
        required
      />

      <select
        value={category}
        onChange={(e) =>
          setCategory(e.target.value)
        }
        disabled={loading}
        required
      >
        <option value="">Select Category</option>
        <option value="Food">Food</option>
        <option value="Petrol">Petrol</option>
        <option value="Salary">Salary</option>
        <option value="Shopping">Shopping</option>
        <option value="Travel">Travel</option>
        <option value="Bills">Bills</option>
        <option value="Other">Other</option>
      </select>

      <div className="expense-edit-actions">
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Submit'}
        </button>

        <button
          type="button"
          className="cancel-btn"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ExpenseEditForm;