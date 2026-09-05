import { auth } from '../firebase';

const getDatabaseUrl = () => {
  const databaseUrl = auth.app.options.databaseURL;

  if (!databaseUrl) {
    throw new Error(
      'Firebase Realtime Database URL is missing.'
    );
  }

  return databaseUrl.replace(/\/$/, '');
};

export const getExpenses = async (idToken, userId) => {
  const databaseUrl = getDatabaseUrl();

  const response = await fetch(
    `${databaseUrl}/expenses/${userId}.json?auth=${idToken}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.error || 'Failed to fetch expenses.'
    );
  }

  const data = await response.json();

  if (!data) {
    return [];
  }

  return Object.entries(data).map(([id, expense]) => ({
    id,
    ...expense,
  }));
};

export const addExpense = async (
  idToken,
  userId,
  expense
) => {
  const databaseUrl = getDatabaseUrl();

  const response = await fetch(
    `${databaseUrl}/expenses/${userId}.json?auth=${idToken}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Number(expense.amount),
        description: expense.description,
        category: expense.category,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || 'Failed to add expense.'
    );
  }

  return {
    id: data.name,
    amount: Number(expense.amount),
    description: expense.description,
    category: expense.category,
  };
};

/* UPDATE EXPENSE */

export const updateExpense = async (
  idToken,
  userId,
  expenseId,
  expense
) => {
  const databaseUrl = getDatabaseUrl();

  const response = await fetch(
    `${databaseUrl}/expenses/${userId}/${expenseId}.json?auth=${idToken}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Number(expense.amount),
        description: expense.description,
        category: expense.category,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || 'Failed to update expense.'
    );
  }

  return {
    id: expenseId,
    amount: Number(data.amount),
    description: data.description,
    category: data.category,
  };
};

/* DELETE EXPENSE */

export const deleteExpense = async (
  idToken,
  userId,
  expenseId
) => {
  const databaseUrl = getDatabaseUrl();

  const response = await fetch(
    `${databaseUrl}/expenses/${userId}/${expenseId}.json?auth=${idToken}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.error || 'Failed to delete expense.'
    );
  }

  return true;
};