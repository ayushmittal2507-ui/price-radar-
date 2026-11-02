import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FakeGoogleModal from '../components/FakeGoogleModal';
import api from '../api/axios';
import styles from './AuthForm.module.css';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleQuickFill = () => {
    setForm({
      name: 'Ayush Mittal',
      email: 'ayush.showcase@gmail.com',
      password: 'password123',
    });
    setError('');
  };

  const handleGoogleSelect = async ({ name, email, token }) => {
    setShowGoogleModal(false);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { token, name, email });
      login({ _id: data._id, name: data.name, email: data.email }, data.token);
      toast.success(`Account created with Google: Welcome, ${data.name}!`);
      navigate('/dashboard');
    } catch {
      const mockId = '60d5ecb8b5c0c24d88e40099';
      const mockToken = 'mock-jwt-' + Date.now();
      login({ _id: mockId, name, email }, mockToken);
      toast.success(`Welcome, ${name}!`);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const nameToUse = form.name.trim() || 'Demo User';
    const emailToUse = form.email.trim() || 'demo@gmail.com';
    const passwordToUse = form.password || 'password123';

    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        name: nameToUse,
        email: emailToUse,
        password: passwordToUse,
      });
      login({ _id: data._id, name: data.name, email: data.email }, data.token);
      toast.success(`Account created successfully! Welcome, ${data.name}.`);
      navigate('/dashboard');
    } catch {
      // Fallback
      const mockUser = {
        _id: '60d5ecb8b5c0c24d88e40099',
        name: nameToUse,
        email: emailToUse,
      };
      const mockToken = 'mock-jwt-' + Date.now();
      login(mockUser, mockToken);
      toast.success(`Welcome, ${mockUser.name}!`);
      navigate('/dashboard');
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

            {/* Quick Demo Credentials Pill */}
            <div className={styles.demoBanner}>
              <div className={styles.demoText}>
                <strong>Showcase:</strong> <code>ayush.showcase@gmail.com</code>
              </div>
              <button
                type="button"
                className={styles.demoFillBtn}
                onClick={handleQuickFill}
              >
                Auto-Fill
              </button>
            </div>

            {/* Fake Google Login Button */}
            <button
              type="button"
              className={styles.googleBtn}
              onClick={() => setShowGoogleModal(true)}
              disabled={loading}
            >
              <svg className={styles.googleIcon} viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.346l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className={styles.formDivider}><span>or with email</span></div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <label className="input-label" htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input"
                  placeholder="Ayush Mittal"
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
                  placeholder="ayush@gmail.com"
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

            <p className={`text-sm text-muted ${styles.switchLink}`} style={{ marginTop: 'var(--space-4)' }}>
              Already have an account?{' '}
              <Link to="/login">Log in</Link>
            </p>
          </div>

          <div className={styles.receiptTear} />
        </div>
      </div>

      {/* Fake Google Auth Modal */}
      <FakeGoogleModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleGoogleSelect}
      />
    </div>
  );
}
