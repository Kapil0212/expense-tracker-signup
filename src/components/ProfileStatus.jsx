import React, { useEffect, useState } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';

import { auth } from '../firebase';

import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from '../services/expenseApi';

function ProfileStatus({
  profileComplete,
  emailVerified,
  fullName,
  email,
  photoUrl,
  message,
  openProfile,
  handleVerifyEmail,
  checkEmailVerification,
  handleLogout,
}) {
  const [expenses, setExpenses] = useState([]);

  const [loadingExpenses, setLoadingExpenses] =
    useState(true);

  const [addingExpense, setAddingExpense] =
    useState(false);

  const [expenseError, setExpenseError] =
    useState('');

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          return;
        }

        const idToken = await user.getIdToken(
          true
        );

        const userExpenses = await getExpenses(
          idToken,
          user.uid
        );

        setExpenses(userExpenses);
      } catch (error) {
        console.error(
          'Error loading expenses:',
          error
        );

        setExpenseError(
          error.message ||
            'Failed to load expenses.'
        );
      } finally {
        setLoadingExpenses(false);
      }
    };

    loadExpenses();
  }, []);

  /* ADD */

  const handleAddExpense = async (expense) => {
    setAddingExpense(true);
    setExpenseError('');

    try {
      const user = auth.currentUser;

      if (!user) {
        alert('Please login again.');
        return false;
      }

      const idToken = await user.getIdToken(
        true
      );

      const savedExpense =
        await addExpense(
          idToken,
          user.uid,
          expense
        );

      setExpenses((currentExpenses) => [
        ...currentExpenses,
        savedExpense,
      ]);

      return true;
    } catch (error) {
      console.error(
        'Error adding expense:',
        error
      );

      setExpenseError(
        error.message ||
          'Failed to add expense.'
      );

      alert(
        error.message ||
          'Failed to add expense.'
      );

      return false;
    } finally {
      setAddingExpense(false);
    }
  };

  /* UPDATE */

  const handleUpdateExpense = async (
    expenseId,
    updatedExpense
  ) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert('Please login again.');
        return false;
      }

      const idToken = await user.getIdToken(
        true
      );

      const updated =
        await updateExpense(
          idToken,
          user.uid,
          expenseId,
          updatedExpense
        );

      setExpenses((currentExpenses) =>
        currentExpenses.map((expense) =>
          expense.id === expenseId
            ? updated
            : expense
        )
      );

      return true;
    } catch (error) {
      console.error(
        'Error updating expense:',
        error
      );

      alert(
        error.message ||
          'Failed to update expense.'
      );

      return false;
    }
  };

  /* DELETE */

  const handleDeleteExpense = async (
    expenseId
  ) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert('Please login again.');
        return false;
      }

      const idToken = await user.getIdToken(
        true
      );

      await deleteExpense(
        idToken,
        user.uid,
        expenseId
      );

      setExpenses((currentExpenses) =>
        currentExpenses.filter(
          (expense) =>
            expense.id !== expenseId
        )
      );

      console.log(
        'Expense successfuly deleted'
      );

      return true;
    } catch (error) {
      console.error(
        'Error deleting expense:',
        error
      );

      alert(
        error.message ||
          'Failed to delete expense.'
      );

      return false;
    }
  };

  return (
    <div className="app-container">
      <div className="top-bar">
        <h1>Expense Tracker</h1>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="content-card">
        <h2>Welcome to Expense Tracker</h2>

        {!profileComplete ? (
          <div>
            <p>
              Your profile is incomplete.
            </p>

            <button
              type="button"
              onClick={openProfile}
            >
              Complete Now
            </button>
          </div>
        ) : (
          <div>
            <p>
              ✓ Profile completed successfully.
            </p>

            {photoUrl && (
              <img
                src={photoUrl}
                alt="Profile"
                className="profile-photo"
              />
            )}

            <p>
              <strong>Name:</strong>{' '}
              {fullName}
            </p>

            <p>
              <strong>Email:</strong>{' '}
              {email}
            </p>

            <button
              type="button"
              onClick={openProfile}
            >
              Edit User Details
            </button>
          </div>
        )}

        <div className="verification-section">
          {!emailVerified ? (
            <>
              <h3>Verify Email ID</h3>

              <p>
                Your email address is not
                verified yet.
              </p>

              <button
                type="button"
                onClick={handleVerifyEmail}
              >
                Verify Email ID
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={
                  checkEmailVerification
                }
              >
                I have verified my email
              </button>
            </>
          ) : (
            <p>
              ✓ Email verified successfully
            </p>
          )}
        </div>

        {message && <p>{message}</p>}

        <ExpenseForm
          onAddExpense={handleAddExpense}
          loading={addingExpense}
        />

        {expenseError && (
          <p className="expense-error">
            {expenseError}
          </p>
        )}

        <ExpenseList
          expenses={expenses}
          loading={loadingExpenses}
          onUpdateExpense={
            handleUpdateExpense
          }
          onDeleteExpense={
            handleDeleteExpense
          }
        />
      </div>
    </div>
  );
}

export default ProfileStatus;