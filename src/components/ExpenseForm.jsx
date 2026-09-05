import React, { useState } from 'react';

function ExpenseForm({ onAddExpense }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || !description.trim() || !category) {
      alert('Please fill all expense details.');
      return;
    }

    const newExpense = {
      id: Date.now(),
      amount: Number(amount),
      description: description.trim(),
      category,
    };

    onAddExpense(newExpense);

    setAmount('');
    setDescription('');
    setCategory('');
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
          required
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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

        <button type="submit">
          Add Expense
        </button>
      </form>
    </section>
  );
}

export default ExpenseForm;