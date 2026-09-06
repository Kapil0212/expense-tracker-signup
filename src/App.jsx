import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { login, logout } from './redux/authSlice';

import Counter from './components/Counter';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const isAuthenticated = useSelector(
    (state) => state.auth.isAuthenticated
  );

  const handleLogin = (e) => {
    e.preventDefault();

    dispatch(login());
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated) {
    return (
      <div className="redux-app">
        <header className="redux-header">
          <h1>Redux Auth</h1>
        </header>

        <main className="redux-main">
          <section className="redux-login-card">
            <form onSubmit={handleLogin}>
              <label>EMAIL</label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <label>PASSWORD</label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
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

  return (
    <div className="redux-app">
      <header className="redux-header logged-in-header">
        <h1>Redux Auth</h1>

        <nav>
          <button type="button">
            My Products
          </button>

          <button type="button">
            My Sales
          </button>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="redux-main">
        <section className="user-profile-card">
          <h2>My User Profile</h2>
        </section>

        <Counter />
      </main>
    </div>
  );
}

export default App;