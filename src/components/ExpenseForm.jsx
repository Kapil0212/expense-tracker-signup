import React, { useState } from 'react';

function ExpenseForm({ onAddExpense, loading }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !description.trim() || !category) {
      alert('Please fill all expense details.');
      return;
    }

    const expense = {
      amount: Number(amount),
      description: description.trim(),
      category,
    };

    const success = await onAddExpense(expense);

    if (success) {
      setAmount('');
      setDescription('');
      setCategory('');
    }
  };

  return (
    <section className="expense-section">
      <h2>Daily Expenses</h2>

      <p className="expense-subtitle">
        Add your daily expenses for tracking.
      </p>

      <form
        className="expense-form"
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
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Add Expense'}
        </button>
      </form>
    </section>
  );
}

export default ExpenseForm;