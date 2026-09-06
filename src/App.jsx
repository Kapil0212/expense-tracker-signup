import React, { useEffect, useState } from 'react';

import {
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { useDispatch, useSelector } from 'react-redux';

import { auth } from './firebase';

import { login, logout } from './redux/authSlice';
import { toggleTheme } from './redux/themeSlice';

import AuthScreen from './components/AuthScreen';
import ForgotPassword from './components/ForgotPassword';
import ProfileStatus from './components/ProfileStatus';
import UpdateProfile from './components/UpdateProfile.jsx';

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

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  const isDark = useSelector(
    (state) => state.theme.isDark
  );

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
          data?.error?.message ||
            'Failed to fetch user details'
        );
      }

      if (data.users && data.users.length > 0) {
        const user = data.users[0];

        setEmail(user.email || '');
        setFullName(user.displayName || '');
        setPhotoUrl(user.photoUrl || '');

        setProfileComplete(
          Boolean(
            user.displayName &&
              user.photoUrl
          )
        );

        setEmailVerified(
          Boolean(user.emailVerified)
        );

        return user;
      }

      return null;
    } catch (error) {
      console.error(
        'Get user details error:',
        error
      );

      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          try {
            const token = await getIdToken(
              user,
              true
            );

            localStorage.setItem(
              'idToken',
              token
            );

            localStorage.setItem(
              'token',
              token
            );

            dispatch(
              login({
                token,
                userId: user.uid,
              })
            );

            await getUserDetails(token);

            setScreen('profile-status');
          } catch (error) {
            console.error(
              'Authentication error:',
              error
            );
          }
        } else {
          localStorage.removeItem(
            'idToken'
          );

          localStorage.removeItem(
            'token'
          );

          dispatch(logout());

          setScreen((currentScreen) =>
            currentScreen ===
            'forgot-password'
              ? 'forgot-password'
              : 'login'
          );
        }
      }
    );

    return () => unsubscribe();
  }, [dispatch]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isLogin) {
        const userCredential =
          await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        const user =
          userCredential.user;

        const token =
          await getIdToken(user, true);

        localStorage.setItem(
          'idToken',
          token
        );

        localStorage.setItem(
          'token',
          token
        );

        dispatch(
          login({
            token,
            userId: user.uid,
          })
        );

        await getUserDetails(token);

        setScreen('profile-status');
      } else {
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );

        const user =
          userCredential.user;

        const token =
          await getIdToken(user, true);

        localStorage.setItem(
          'idToken',
          token
        );

        localStorage.setItem(
          'token',
          token
        );

        dispatch(
          login({
            token,
            userId: user.uid,
          })
        );

        setProfileComplete(false);
        setEmailVerified(false);
        setScreen('profile-status');
      }
    } catch (error) {
      console.error(error);

      if (isLogin) {
        alert(
          'Invalid email or password.'
        );
      } else {
        alert(
          error.message ||
            'Signup failed.'
        );
      }
    }
  };

  const openForgotPassword = () => {
    setForgotEmail('');
    setForgotMessage('');
    setForgotError('');
    setForgotLoading(false);

    setScreen('forgot-password');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setForgotMessage('');
    setForgotError('');

    const trimmedEmail =
      forgotEmail.trim();

    if (!trimmedEmail) {
      setForgotError(
        'Please enter your email address.'
      );

      return;
    }

    setForgotLoading(true);

    try {
      const apiKey =
        auth.app.options.apiKey;

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            requestType:
              'PASSWORD_RESET',
            email: trimmedEmail,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        const errorCode =
          data?.error?.message;

        const errorMessages = {
          EMAIL_NOT_FOUND:
            'No account exists with this email address.',

          INVALID_EMAIL:
            'Please enter a valid email address.',

          USER_NOT_FOUND:
            'No account exists with this email address.',

          OPERATION_NOT_ALLOWED:
            'Password reset is not enabled for this project.',

          TOO_MANY_ATTEMPTS_TRY_LATER:
            'Too many attempts. Please try again later.',
        };

        throw new Error(
          errorMessages[errorCode] ||
            errorCode ||
            'Unable to send password reset email.'
        );
      }

      setForgotMessage(
        `Password reset link has been sent to ${
          data.email ||
          trimmedEmail
        }. Please check your inbox.`
      );
    } catch (error) {
      console.error(
        'Forgot password error:',
        error
      );

      setForgotError(
        error.message ||
          'Unable to send password reset email.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const openProfile = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setScreen('login');
        return;
      }

      const token =
        await getIdToken(user, true);

      localStorage.setItem(
        'idToken',
        token
      );

      localStorage.setItem(
        'token',
        token
      );

      await getUserDetails(token);

      setScreen('update-profile');
    } catch (error) {
      console.error(error);

      alert(
        'Failed to load profile details.'
      );
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

      const token =
        await getIdToken(user, true);

      const apiKey =
        auth.app.options.apiKey;

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            idToken: token,
            displayName:
              fullName.trim(),
            photoUrl:
              photoUrl.trim(),
            returnSecureToken: true,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            'Failed to update profile'
        );
      }

      const latestToken =
        data.idToken || token;

      localStorage.setItem(
        'idToken',
        latestToken
      );

      localStorage.setItem(
        'token',
        latestToken
      );

      dispatch(
        login({
          token: latestToken,
          userId: user.uid,
        })
      );

      await getUserDetails(
        latestToken
      );

      setMessage(
        'Profile updated successfully!'
      );

      setScreen('profile-status');
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          'Failed to update profile.'
      );
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setScreen('login');
        return;
      }

      const idToken =
        await user.getIdToken(true);

      const apiKey =
        auth.app.options.apiKey;

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            requestType:
              'VERIFY_EMAIL',
            idToken,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            'Failed to send verification email.'
        );
      }

      setMessage(
        `Verification email sent to ${
          data.email || email
        }.`
      );

      alert(
        'Verification email sent! Check your inbox and click the verification link.'
      );
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          'Failed to send verification email.'
      );
    }
  };

  const checkEmailVerification =
    async () => {
      try {
        const user =
          auth.currentUser;

        if (!user) {
          setScreen('login');
          return;
        }

        await user.reload();

        const token =
          await user.getIdToken(
            true
          );

        localStorage.setItem(
          'idToken',
          token
        );

        localStorage.setItem(
          'token',
          token
        );

        const userData =
          await getUserDetails(
            token
          );

        if (userData?.emailVerified) {
          setEmailVerified(true);

          setMessage(
            'Email verified successfully!'
          );
        } else {
          setEmailVerified(false);

          setMessage(
            'Email is not verified yet. Please click the verification link from your email.'
          );
        }
      } catch (error) {
        console.error(error);

        alert(
          'Failed to check email verification status.'
        );
      }
    };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem(
        'idToken'
      );

      localStorage.removeItem(
        'token'
      );

      dispatch(logout());

      setEmail('');
      setPassword('');
      setFullName('');
      setPhotoUrl('');
      setProfileComplete(false);
      setEmailVerified(false);
      setMessage('');

      setIsLogin(true);
      setScreen('login');
    } catch (error) {
      console.error(
        'Logout error:',
        error
      );

      alert(
        'Failed to logout. Please try again.'
      );
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  if (screen === 'forgot-password') {
    return (
      <div
        className={
          isDark
            ? 'app-theme dark-theme'
            : 'app-theme'
        }
      >
        <ForgotPassword
          forgotEmail={forgotEmail}
          setForgotEmail={
            setForgotEmail
          }
          forgotLoading={
            forgotLoading
          }
          forgotMessage={
            forgotMessage
          }
          forgotError={forgotError}
          handleForgotPassword={
            handleForgotPassword
          }
          onBack={() => {
            setForgotMessage('');
            setForgotError('');
            setScreen('login');
          }}
        />
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <div
        className={
          isDark
            ? 'app-theme dark-theme'
            : 'app-theme'
        }
      >
        <AuthScreen
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          fullName={fullName}
          setFullName={setFullName}
          handleAuth={handleAuth}
          openForgotPassword={
            openForgotPassword
          }
          message={message}
        />
      </div>
    );
  }

  if (screen === 'profile-status') {
    return (
      <div
        className={
          isDark
            ? 'app-theme dark-theme'
            : 'app-theme'
        }
      >
        <ProfileStatus
          profileComplete={
            profileComplete
          }
          emailVerified={
            emailVerified
          }
          fullName={fullName}
          email={email}
          photoUrl={photoUrl}
          message={message}
          openProfile={openProfile}
          handleVerifyEmail={
            handleVerifyEmail
          }
          checkEmailVerification={
            checkEmailVerification
          }
          handleLogout={handleLogout}
          onThemeToggle={
            handleThemeToggle
          }
          isDark={isDark}
        />
      </div>
    );
  }

  if (screen === 'update-profile') {
    return (
      <div
        className={
          isDark
            ? 'app-theme dark-theme'
            : 'app-theme'
        }
      >
        <UpdateProfile
          fullName={fullName}
          setFullName={setFullName}
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
          handleUpdateProfile={
            handleUpdateProfile
          }
          onBack={() =>
            setScreen(
              'profile-status'
            )
          }
          handleLogout={handleLogout}
        />
      </div>
    );
  }

  return null;
}

export default App;