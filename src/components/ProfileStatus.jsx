import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';

import { auth } from '../firebase';

import {
  addExpense as addExpenseApi,
  getExpenses,
  updateExpense as updateExpenseApi,
  deleteExpense as deleteExpenseApi,
} from '../services/expenseApi';

import {
  setExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  setLoading,
  setError,
  clearExpenses,
} from '../redux/expensesSlice';

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
  const dispatch = useDispatch();

  const expenses = useSelector(
    (state) => state.expenses.expenses
  );

  const loadingExpenses = useSelector(
    (state) => state.expenses.loading
  );

  const expenseError = useSelector(
    (state) => state.expenses.error
  );

  const [addingExpense, setAddingExpense] =
    useState(false);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(''));

        const user = auth.currentUser;

        if (!user) {
          dispatch(clearExpenses());
          return;
        }

        const idToken = await user.getIdToken(true);

        const userExpenses = await getExpenses(
          idToken,
          user.uid
        );

        dispatch(setExpenses(userExpenses));
      } catch (error) {
        console.error(
          'Error loading expenses:',
          error
        );

        dispatch(
          setError(
            error.message ||
              'Failed to load expenses.'
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadExpenses();
  }, [dispatch]);

  const handleAddExpense = async (expense) => {
    setAddingExpense(true);
    dispatch(setError(''));

    try {
      const user = auth.currentUser;

      if (!user) {
        alert('Please login again.');
        return false;
      }

      const idToken = await user.getIdToken(true);

      const savedExpense = await addExpenseApi(
        idToken,
        user.uid,
        expense
      );

      dispatch(addExpense(savedExpense));

      return true;
    } catch (error) {
      console.error(
        'Error adding expense:',
        error
      );

      dispatch(
        setError(
          error.message ||
            'Failed to add expense.'
        )
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

      const idToken = await user.getIdToken(true);

      const updated = await updateExpenseApi(
        idToken,
        user.uid,
        expenseId,
        updatedExpense
      );

      dispatch(updateExpense(updated));

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

  const handleDeleteExpense = async (expenseId) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert('Please login again.');
        return false;
      }

      const idToken = await user.getIdToken(true);

      await deleteExpenseApi(
        idToken,
        user.uid,
        expenseId
      );

      dispatch(deleteExpense(expenseId));

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

  const totalExpense = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const showPremium = totalExpense > 10000;

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
            <p>Your profile is incomplete.</p>

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
              <strong>Name:</strong> {fullName}
            </p>

            <p>
              <strong>Email:</strong> {email}
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
                Your email address is not verified yet.
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
                onClick={checkEmailVerification}
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

        <div className="expense-summary">
          <h3>
            Total Expenses: ₹
            {totalExpense.toFixed(2)}
          </h3>

          {showPremium && (
            <button
              type="button"
              className="premium-btn"
            >
              Activate Premium
            </button>
          )}
        </div>

        <ExpenseList
          expenses={expenses}
          loading={loadingExpenses}
          onUpdateExpense={handleUpdateExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      </div>
    </div>
  );
}

export default ProfileStatus;