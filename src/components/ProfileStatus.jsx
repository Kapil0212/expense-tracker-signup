import React, { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';

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

  const addExpense = (expense) => {
    setExpenses((currentExpenses) => [
      ...currentExpenses,
      expense,
    ]);
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
            <p>✓ Profile completed successfully.</p>

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
            <p>✓ Email verified successfully</p>
          )}
        </div>

        {message && <p>{message}</p>}

        {/* DAILY EXPENSES */}
        <ExpenseForm onAddExpense={addExpense} />

        <ExpenseList expenses={expenses} />
      </div>
    </div>
  );
}

export default ProfileStatus;