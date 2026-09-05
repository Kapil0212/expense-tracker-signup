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

  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [profileComplete, setProfileComplete] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  /*
   * GET USER DETAILS FROM FIREBASE
   */
  const getUserDetails = async (idToken) => {
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
        data?.error?.message || 'Unable to fetch profile'
      );
    }

    if (data.users && data.users.length > 0) {
      const user = data.users[0];

      const fetchedFullName = user.displayName || '';
      const fetchedPhotoUrl = user.photoUrl || '';

      setEmail(user.email || '');
      setFullName(fetchedFullName);
      setPhotoUrl(fetchedPhotoUrl);

      setProfileComplete(
        Boolean(fetchedFullName && fetchedPhotoUrl)
      );

      setEmailVerified(
        Boolean(user.emailVerified)
      );

      return user;
    }

    return null;
  };

  /*
   * CHECK AUTHENTICATION ON PAGE LOAD / REFRESH
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setScreen('login');
          return;
        }

        setProfileLoading(true);

        try {
          const token = await user.getIdToken(true);

          localStorage.setItem('token', token);

          await getUserDetails(token);

          setScreen('profile-status');
        } catch (err) {
          console.error(err);

          setEmail(user.email || '');
          setFullName(user.displayName || '');
          setPhotoUrl(user.photoURL || '');
          setEmailVerified(Boolean(user.emailVerified));

          setProfileComplete(
            Boolean(
              user.displayName &&
              user.photoURL
            )
          );

          setScreen('profile-status');
        } finally {
          setProfileLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  /*
   * SIGNUP
   */
  const handleSignup = async (e) => {
    e.preventDefault();
    clearMessages();

    if (
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
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

      setSuccess(
        'Account created successfully! You can now login.'
      );

      setPassword('');
      setConfirmPassword('');

      setScreen('login');
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError(
            'An account already exists with this email.'
          );
          break;

        case 'auth/invalid-email':
          setError(
            'Please enter a valid email address.'
          );
          break;

        case 'auth/weak-password':
          setError(
            'Password should be at least 6 characters.'
          );
          break;

        case 'auth/network-request-failed':
          setError(
            'Network error. Please check your internet connection.'
          );
          break;

        default:
          setError(
            'Something went wrong. Please try again.'
          );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * LOGIN
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password) {
      alert('Please enter email and password.');
      return;
    }

    setLoading(true);

    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const token =
        await credential.user.getIdToken(true);

      localStorage.setItem('token', token);

      await getUserDetails(token);

      setPassword('');
      setScreen('profile-status');
    } catch (err) {
      console.error(err);

      alert(
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * FORGOT PASSWORD
   */
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert('Please enter your email first.');
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      alert(
        'Password reset email sent. Please check your inbox.'
      );
    } catch (err) {
      alert(
        'Unable to send password reset email. Please check the email.'
      );
    }
  };

  /*
   * SEND EMAIL VERIFICATION
   *
   * Firebase REST API:
   * accounts:sendOobCode
   *
   * requestType:
   * VERIFY_EMAIL
   */
  const handleVerifyEmail = async () => {
    clearMessages();

    if (!auth.currentUser) {
      alert('Please login again.');
      setScreen('login');
      return;
    }

    setVerificationLoading(true);

    try {
      /*
       * Get a fresh ID token.
       */
      const idToken =
        await auth.currentUser.getIdToken(true);

      const apiKey = auth.app.options.apiKey;

      /*
       * Send verification email through
       * Firebase REST API.
       */
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
        const firebaseError =
          data?.error?.message || '';

        switch (firebaseError) {
          case 'EMAIL_EXISTS':
            setError(
              'This email address is already associated with another account.'
            );
            break;

          case 'INVALID_ID_TOKEN':
            setError(
              'Your login session has expired. Please login again.'
            );
            break;

          case 'USER_NOT_FOUND':
            setError(
              'User account was not found. Please login again.'
            );
            break;

          case 'TOKEN_EXPIRED':
            setError(
              'Your session has expired. Please login again.'
            );
            break;

          case 'INVALID_EMAIL':
            setError(
              'The email address is invalid.'
            );
            break;

          case 'OPERATION_NOT_ALLOWED':
            setError(
              'Email verification is not enabled for this Firebase project.'
            );
            break;

          case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            setError(
              'Too many attempts. Please try again later.'
            );
            break;

          default:
            setError(
              'Unable to send verification email. Please try again.'
            );
        }

        return;
      }

      /*
       * Firebase successfully sent the email.
       */
      setSuccess(
        'Check your email, you might have received a verification link. Click on it to verify.'
      );

      alert(
        'Verification email sent! Check your inbox and click the verification link.'
      );
    } catch (err) {
      console.error(
        'Email verification error:',
        err
      );

      setError(
        'Unable to send verification email. Please check your internet connection and try again.'
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  /*
   * CHECK VERIFICATION STATUS
   *
   * Useful after the user clicks the verification
   * link in their email.
   */
  const checkEmailVerification = async () => {
    clearMessages();

    if (!auth.currentUser) {
      alert('Please login again.');
      setScreen('login');
      return;
    }

    setVerificationLoading(true);

    try {
      /*
       * Reload Firebase user information.
       */
      await auth.currentUser.reload();

      const user = auth.currentUser;

      /*
       * Get a fresh token after reload.
       */
      const token =
        await user.getIdToken(true);

      localStorage.setItem('token', token);

      /*
       * Fetch latest Firebase account information.
       */
      const latestUser =
        await getUserDetails(token);

      const verified =
        latestUser?.emailVerified ||
        user.emailVerified;

      setEmailVerified(Boolean(verified));

      if (verified) {
        setSuccess(
          'Your email has been verified successfully.'
        );
      } else {
        setError(
          'Your email is not verified yet. Please click the verification link sent to your email.'
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        'Unable to check email verification status. Please try again.'
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  /*
   * OPEN PROFILE
   */
  const openProfile = async () => {
    clearMessages();

    if (!auth.currentUser) {
      alert('Please login again.');
      setScreen('login');
      return;
    }

    setProfileLoading(true);

    try {
      const token =
        await auth.currentUser.getIdToken(true);

      localStorage.setItem('token', token);

      await getUserDetails(token);

      setScreen('update-profile');
    } catch (err) {
      console.error(err);

      setError(
        'Unable to load your profile details.'
      );
    } finally {
      setProfileLoading(false);
    }
  };

  /*
   * UPDATE PROFILE
   */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!auth.currentUser) {
      alert('Please login again.');
      setScreen('login');
      return;
    }

    if (
      !fullName.trim() ||
      !photoUrl.trim()
    ) {
      setError(
        'Full Name and Profile Photo URL are required.'
      );
      return;
    }

    setLoading(true);

    try {
      const apiKey = auth.app.options.apiKey;

      const token =
        await auth.currentUser.getIdToken(true);

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
          data?.error?.message ||
          'PROFILE_UPDATE_FAILED'
        );
      }

      if (data.idToken) {
        localStorage.setItem(
          'token',
          data.idToken
        );
      }

      const latestToken =
        data.idToken ||
        await auth.currentUser.getIdToken(true);

      await getUserDetails(latestToken);

      setProfileComplete(true);

      setSuccess(
        'Profile updated successfully!'
      );

      setScreen('profile-status');
    } catch (err) {
      console.error(
        'Update profile error:',
        err
      );

      setError(
        'Unable to update profile. Please check the details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * LOGOUT
   */
  const handleLogout = async () => {
    await signOut(auth);

    localStorage.removeItem('token');

    setScreen('login');

    setEmail('');
    setPassword('');
    setFullName('');
    setPhotoUrl('');

    setProfileComplete(false);
    setEmailVerified(false);

    clearMessages();
  };

  /*
   * PROFILE STATUS SCREEN
   */
  if (screen === 'profile-status') {
    if (profileLoading) {
      return (
        <div className="profile-page">
          <div className="status-content">
            <h1>Loading profile...</h1>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-page">

        <header className="profile-header">

          <div className="quote">
            Winners never quite, Quitters never win.
          </div>

          {!profileComplete && (
            <div className="profile-alert">

              <span>
                Your Profile is{' '}
                <strong>64%</strong> completed.
                A complete Profile has higher
                chances of landing a job.
              </span>

              <button
                onClick={openProfile}
                disabled={profileLoading}
              >
                {profileLoading
                  ? 'Loading...'
                  : 'Complete now'}
              </button>

            </div>
          )}

          {profileComplete && (
            <div className="profile-alert complete">

              Your Profile is{' '}
              <strong>100%</strong> completed.

            </div>
          )}

        </header>

        <main className="status-content">

          <h1>
            Welcome to Expense Tracker
          </h1>

          {success && (
            <p className="message success">
              {success}
            </p>
          )}

          {error && (
            <p className="message error">
              {error}
            </p>
          )}

          {!emailVerified && (
            <div className="verification-box">

              <h3>
                Verify your Email ID
              </h3>

              <p>
                Please verify your email address
                to keep your account secure.
              </p>

              <button
                className="verify-button"
                onClick={handleVerifyEmail}
                disabled={verificationLoading}
              >
                {verificationLoading
                  ? 'Sending...'
                  : 'Verify Email ID'}
              </button>

              <button
                className="check-button"
                onClick={checkEmailVerification}
                disabled={verificationLoading}
              >
                I have verified my email
              </button>

            </div>
          )}

          {emailVerified && (
            <div className="verified-box">
              ✓ Email verified successfully
            </div>
          )}

          {profileComplete && photoUrl && (
            <img
              className="profile-preview"
              src={photoUrl}
              alt="Profile"
            />
          )}

          {profileComplete && (
            <p>
              <strong>
                {fullName}
              </strong>
            </p>
          )}

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </main>

      </div>
    );
  }

  /*
   * EDIT PROFILE SCREEN
   */
  if (screen === 'update-profile') {
    return (
      <div className="profile-page">

        <header className="profile-header">

          <div className="quote">
            Winners never quite, Quitters never win.
          </div>

          <button
            className="cancel-button"
            onClick={() =>
              setScreen('profile-status')
            }
          >
            Cancel
          </button>

        </header>

        <main className="update-content">

          <h1>
            Contact Details
          </h1>

          <form
            className="profile-form"
            onSubmit={handleUpdateProfile}
          >

            <label>

              <span className="field-icon">
                ◉
              </span>

              <strong>
                Full Name:
              </strong>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
              />

            </label>

            <label>

              <span className="field-icon">
                ◎
              </span>

              <strong>
                Profile Photo URL
              </strong>

              <input
                type="url"
                value={photoUrl}
                onChange={(e) =>
                  setPhotoUrl(e.target.value)
                }
                placeholder="https://..."
              />

            </label>

            {error && (
              <p className="message error profile-error">
                {error}
              </p>
            )}

            <button
              className="update-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Updating...'
                : 'Update'}
            </button>

          </form>

        </main>

      </div>
    );
  }

  /*
   * LOGIN / SIGNUP
   */
  const isLogin = screen === 'login';

  return (
    <div className="page">

      <div
        className="blue-shape"
        aria-hidden="true"
      ></div>

      <main className="content">

        <section className="auth-wrap">

          <div className="card">

            <h1>
              {isLogin
                ? 'Login'
                : 'SignUp'}
            </h1>

            <form
              onSubmit={
                isLogin
                  ? handleLogin
                  : handleSignup
              }
              noValidate
            >

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
              />

              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete={
                  isLogin
                    ? 'current-password'
                    : 'new-password'
                }
              />

              {!isLogin && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
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
                onClick={
                  handleForgotPassword
                }
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