import { auth } from '../firebase';

const getDatabaseUrl = () => {
  const databaseUrl = auth.app.options.databaseURL;

  if (!databaseUrl) {
    throw new Error(
      'Firebase Realtime Database URL is missing. Please add databaseURL to firebase.js.'
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

export const addExpense = async (idToken, userId, expense) => {
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