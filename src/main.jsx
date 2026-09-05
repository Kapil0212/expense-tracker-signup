import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import './style.css';

function App() {
  const [screen, setScreen] = useState('login');
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [profileComplete, setProfileComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [message, setMessage] = useState('');

  const getUserDetails = async (idToken) => {
    try {
      const apiKey = auth.app.options.apiKey;

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || 'Failed to fetch user details'
        );
      }

      if (data.users && data.users.length > 0) {
        const user = data.users[0];

        setEmail(user.email || '');
        setFullName(user.displayName || '');
        setPhotoUrl(user.photoUrl || '');

        setProfileComplete(
          Boolean(user.displayName && user.photoUrl)
        );

        setEmailVerified(Boolean(user.emailVerified));

        return user;
      }

      return null;
    } catch (error) {
      console.error('Get user details error:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await getIdToken(user, true);

          localStorage.setItem('idToken', token);
          localStorage.setItem('token', token);

          await getUserDetails(token);

          setScreen('profile-status');
        } catch (error) {
          console.error(error);
        }
      } else {
        localStorage.removeItem('idToken');
        localStorage.removeItem('token');
        setScreen('login');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const token = await getIdToken(userCredential.user, true);

        localStorage.setItem('idToken', token);
        localStorage.setItem('token', token);

        await getUserDetails(token);

        setScreen('profile-status');
      } else {
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const token = await getIdToken(userCredential.user, true);

        localStorage.setItem('idToken', token);
        localStorage.setItem('token', token);

        setProfileComplete(false);
        setEmailVerified(false);
        setScreen('profile-status');
      }
    } catch (error) {
      console.error(error);

      if (isLogin) {
        alert('Invalid email or password.');
      } else {
        alert(error.message || 'Signup failed.');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email first.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent. Check your inbox.');
    } catch (error) {
      alert(error.message || 'Failed to send password reset email.');
    }
  };

  const openProfile = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setScreen('login');
        return;
      }

      const token = await getIdToken(user, true);

      localStorage.setItem('idToken', token);
      localStorage.setItem('token', token);

      await getUserDetails(token);

      setScreen('update-profile');
    } catch (error) {
      console.error(error);
      alert('Failed to load profile details.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const user = auth.currentUser;

      if (!user) {
        setScreen('login');
        return;
      }

      const token = await getIdToken(user, true);
      const apiKey = auth.app.options.apiKey;

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: token,
            displayName: fullName.trim(),
            photoUrl: photoUrl.trim(),
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || 'Failed to update profile'
        );
      }

      const latestToken = data.idToken || token;

      localStorage.setItem('idToken', latestToken);
      localStorage.setItem('token', latestToken);

      await getUserDetails(latestToken);

      setMessage('Profile updated successfully!');
      setScreen('profile-status');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to update profile.');
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setScreen('login');
        return;
      }

      const idToken = await user.getIdToken(true);
      const apiKey = auth.app.options.apiKey;

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: 'VERIFY_EMAIL',
            idToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorCode = data?.error?.message;

        const errorMessages = {
          EMAIL_EXISTS: 'This email is already in use.',
          INVALID_ID_TOKEN:
            'Your session has expired. Please login again.',
          USER_NOT_FOUND: 'User not found.',
          TOKEN_EXPIRED:
            'Your session has expired. Please login again.',
          INVALID_EMAIL: 'Invalid email address.',
          OPERATION_NOT_ALLOWED:
            'Email verification is not allowed for this account.',
          TOO_MANY_ATTEMPTS_TRY_LATER:
            'Too many attempts. Please try again later.',
        };

        throw new Error(
          errorMessages[errorCode] ||
            errorCode ||
            'Failed to send verification email.'
        );
      }

      setMessage(
        'Verification email sent! Check your inbox and click the verification link.'
      );

      alert(
        'Verification email sent! Check your inbox and click the verification link.'
      );
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to send verification email.');
    }
  };

  const checkEmailVerification = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setScreen('login');
        return;
      }

      await user.reload();

      const token = await user.getIdToken(true);

      localStorage.setItem('idToken', token);
      localStorage.setItem('token', token);

      const userData = await getUserDetails(token);

      if (userData?.emailVerified) {
        setEmailVerified(true);
        setMessage('Email verified successfully!');
      } else {
        setEmailVerified(false);
        setMessage(
          'Email is not verified yet. Please click the verification link from your email.'
        );
      }
    } catch (error) {
      console.error(error);
      alert('Failed to check email verification status.');
    }
  };

  // LOGOUT USER
  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear ID token from local storage
      localStorage.removeItem('idToken');
      localStorage.removeItem('token');

      // Reset login screen
      setEmail('');
      setPassword('');
      setFullName('');
      setPhotoUrl('');
      setProfileComplete(false);
      setEmailVerified(false);
      setMessage('');
      setIsLogin(true);

      // Redirect to login page
      setScreen('login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  // LOGIN SCREEN
  if (screen === 'login') {
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

            <button type="submit">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          {isLogin && (
            <button
              type="button"
              className="secondary-btn"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          )}

          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
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

  // PROFILE STATUS SCREEN
  if (screen === 'profile-status') {
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
        </div>
      </div>
    );
  }

  // UPDATE PROFILE SCREEN
  if (screen === 'update-profile') {
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
          <h2>Edit User Details</h2>

          <form onSubmit={handleUpdateProfile}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <input
              type="url"
              placeholder="Profile Photo URL"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              required
            />

            <button type="submit">
              Update Profile
            </button>
          </form>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => setScreen('profile-status')}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);