import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './AuthForm.module.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login({ _id: data._id, name: data.name, email: data.email }, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className={styles.formWrap}>
          {/* Receipt header */}
          <div className={styles.receiptHead}>
            <span className={styles.receiptLabel}>SIGN IN</span>
          </div>

          <div className={styles.formCard}>
            <h1 className={styles.formTitle}>Welcome back</h1>
            <p className={`text-muted text-sm ${styles.formSub}`}>
              Log in to your PriceRadar account.
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <label className="input-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Log in'}
              </button>
            </form>

            <div className={styles.formDivider}><span>or</span></div>

            <p className={`text-sm text-muted ${styles.switchLink}`}>
              Don&apos;t have an account?{' '}
              <Link to="/signup">Sign up free</Link>
            </p>
          </div>

          {/* Tear bottom */}
          <div className={styles.receiptTear} />
        </div>
      </div>
    </div>
  );
}
