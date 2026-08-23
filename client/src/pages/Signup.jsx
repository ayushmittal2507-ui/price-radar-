import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './AuthForm.module.css';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', form);
      login({ _id: data._id, name: data.name, email: data.email }, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className={styles.formWrap}>
          <div className={styles.receiptHead}>
            <span className={styles.receiptLabel}>NEW ACCOUNT</span>
          </div>

          <div className={styles.formCard}>
            <h1 className={styles.formTitle}>Create your account</h1>
            <p className={`text-muted text-sm ${styles.formSub}`}>
              Start tracking prices in under a minute.
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <label className="input-label" htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
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
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Sign up free'}
              </button>
            </form>

            <div className={styles.formDivider}><span>or</span></div>

            <p className={`text-sm text-muted ${styles.switchLink}`}>
              Already have an account?{' '}
              <Link to="/login">Log in</Link>
            </p>
          </div>

          <div className={styles.receiptTear} />
        </div>
      </div>
    </div>
  );
}
