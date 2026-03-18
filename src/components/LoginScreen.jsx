import { useState } from 'react';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onLogin({ username, password });

    if (!result?.ok) {
      setError(result?.message || 'Login failed.');
      return;
    }

    setError('');
    setPassword('');
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-header">
          <p className="login-brand">Sip Up Coffee</p>
          <h1>POS Login</h1>
          <p className="login-sub">Sign in as Admin or Cashier to continue.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="Enter username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter password"
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn-primary login-btn">Login</button>
        </form>

      </div>
    </div>
  );
}
