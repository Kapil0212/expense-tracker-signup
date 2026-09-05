import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import './style.css';

function App() {
  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
        setScreen('welcome');
      }
    });

    return unsubscribe;
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await signOut(auth);

      setSuccess('Account created successfully! You can now login.');
      setPassword('');
      setConfirmPassword('');
      setScreen('login');

    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account already exists with this email.');
          break;

        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;

        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;

        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;

        default:
          setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password) {
      alert('Please enter email and password.');
      return;
    }

    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Get Firebase token
      const token = await credential.user.getIdToken();

      // Store token
      localStorage.setItem('token', token);

      setEmail('');
      setPassword('');

      // Show welcome screen
      setScreen('welcome');

    } catch (err) {
      alert('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert('Please enter your email first.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert('Password reset email sent. Please check your inbox.');
    } catch (err) {
      alert('Unable to send password reset email. Please check the email.');
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    await signOut(auth);

    localStorage.removeItem('token');

    setScreen('login');
    setEmail('');
    setPassword('');
    clearMessages();
  };

  // WELCOME SCREEN
  if (screen === 'welcome') {
    return (
      <div className="welcome-page">
        <div className="welcome-bar">
          Welcome to Expense Tracker!!!
        </div>

        <div className="welcome-content">
          <h1>Welcome to Expense Tracker</h1>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const isLogin = screen === 'login';

  return (
    <div className="page">

      <div className="blue-shape"></div>

      <main className="content">

        <section className="auth-wrap">

          <div className="card">

            <h1>
              {isLogin ? 'Login' : 'SignUp'}
            </h1>

            <form
              onSubmit={isLogin ? handleLogin : handleSignup}
              noValidate
            >

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <div className="password-field">

                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    isLogin
                      ? 'current-password'
                      : 'new-password'
                  }
                />

                {isLogin && (
                  <span className="eye">◉</span>
                )}

              </div>

              {!isLogin && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  autoComplete="new-password"
                />
              )}

              {error && (
                <p className="message error">
                  {error}
                </p>
              )}

              {success && (
                <p className="message success">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? isLogin
                    ? 'Logging in...'
                    : 'Signing up...'
                  : isLogin
                    ? 'Login'
                    : 'Sign up'}
              </button>

            </form>

            {isLogin && (
              <button
                className="forgot-button"
                type="button"
                onClick={handleForgotPassword}
              >
                Forgot password
              </button>
            )}

          </div>

          <button
            className="switch-box"
            type="button"
            onClick={() => {
              clearMessages();

              setScreen(
                isLogin
                  ? 'signup'
                  : 'login'
              );

              setPassword('');
              setConfirmPassword('');
            }}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Have an account? Login'}
          </button>

        </section>

      </main>

    </div>
  );
}

createRoot(
  document.getElementById('root')
).render(<App />);