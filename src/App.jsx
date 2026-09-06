import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import { auth } from './firebase';

import { login, logout } from './redux/authSlice';

import ProfileStatus from './components/ProfileStatus';
import Counter from './components/Counter';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [profileComplete, setProfileComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [message, setMessage] = useState('');

  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  // Check Firebase authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          try {
            const token = await user.getIdToken(true);

            localStorage.setItem('idToken', token);
            localStorage.setItem('token', token);

            dispatch(
              login({
                token,
                userId: user.uid,
              })
            );

            setEmail(user.email || '');
            setFullName(user.displayName || '');
            setPhotoUrl(user.photoURL || '');
            setProfileComplete(
              Boolean(
                user.displayName &&
                user.photoURL
              )
            );
            setEmailVerified(
              Boolean(user.emailVerified)
            );
          } catch (error) {
            console.error(
              'Authentication check error:',
              error
            );
          }
        }
      }
    );

    return () => unsubscribe();
  }, [dispatch]);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert('Please enter email and password.');
      return;
    }

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      const token = await user.getIdToken(true);

      localStorage.setItem('idToken', token);
      localStorage.setItem('token', token);

      // Store login information in Redux
      dispatch(
        login({
          token,
          userId: user.uid,
        })
      );

      setEmail(user.email || '');
      setFullName(user.displayName || '');
      setPhotoUrl(user.photoURL || '');
      setProfileComplete(
        Boolean(
          user.displayName &&
          user.photoURL
        )
      );
      setEmailVerified(
        Boolean(user.emailVerified)
      );

      setPassword('');

      alert('Login successful');
    } catch (error) {
      console.error(
        'Login error:',
        error
      );

      alert(
        'Invalid email or password. Please try again.'
      );
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem('idToken');
      localStorage.removeItem('token');

      dispatch(logout());

      setEmail('');
      setPassword('');
      setFullName('');
      setPhotoUrl('');
      setProfileComplete(false);
      setEmailVerified(false);
      setMessage('');

      alert('Logged out successfully');
    } catch (error) {
      console.error(
        'Logout error:',
        error
      );
    }
  };

  // LOGIN PAGE
  if (!isAuthenticated) {
    return (
      <div className="redux-app">
        <header className="redux-header">
          <h1>Expense Tracker</h1>
        </header>

        <main className="redux-main">
          <section className="redux-login-card">
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
              <label>EMAIL</label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

              <label>PASSWORD</label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button type="submit">
                Login
              </button>
            </form>
          </section>

          <Counter />
        </main>
      </div>
    );
  }

  // LOGGED-IN PAGE
  return (
    <div className="redux-app">
      <ProfileStatus
        profileComplete={profileComplete}
        emailVerified={emailVerified}
        fullName={fullName}
        email={email}
        photoUrl={photoUrl}
        message={message}
        openProfile={() => {}}
        handleVerifyEmail={() => {}}
        checkEmailVerification={() => {}}
        handleLogout={handleLogout}
      />

      <div
        style={{
          maxWidth: '900px',
          margin: '20px auto',
        }}
      >
        <Counter />
      </div>
    </div>
  );
}

export default App;