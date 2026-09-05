import React from 'react';

function AuthScreen({
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  handleAuth,
  openForgotPassword,
  message,
}) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Expense Tracker</h1>

        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="primary-btn">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {isLogin && (
          <button
            type="button"
            className="forgot-link"
            onClick={openForgotPassword}
          >
            Forgot Password?
          </button>
        )}

        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            setIsLogin(!isLogin);
          }}
        >
          {isLogin
            ? 'Create a new account'
            : 'Already have an account? Login'}
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default AuthScreen;