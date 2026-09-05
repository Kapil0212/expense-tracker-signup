import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import './style.css';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      console.log('User has successfully signed up.');
      setSuccess('Account created successfully!');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account already exists with this email.'); break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.'); break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.'); break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.'); break;
        default:
          setError('Something went wrong. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <header className="navbar">
        <div className="brand"><span className="brand-mark">◈</span><span>MyWebLink</span></div>
        <nav><a href="#">Home</a><a href="#">Products</a><a href="#">About Us</a></nav>
      </header>

      <div className="blue-shape" aria-hidden="true"></div>

      <main className="content">
        <section className="signup-wrap">
          <div className="card">
            <h1>SignUp</h1>
            <form onSubmit={handleSubmit} noValidate>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              {error && <p className="message error">{error}</p>}
              {success && <p className="message success">{success}</p>}
              <button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign up'}</button>
            </form>
          </div>
          <button className="login-box" type="button" onClick={() => alert('Login screen can be added here.')}>Have an account? Login</button>
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
