import { useState } from 'react';
import styles from './FakeGoogleModal.module.css';

export default function FakeGoogleModal({ isOpen, onClose, onSelectAccount }) {
  const [loadingUser, setLoadingUser] = useState(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const accounts = [
    {
      name: 'Ayush Mittal',
      email: 'ayushmittal.demo@gmail.com',
      initial: 'A',
      color: '#1a73e8', // Google Blue
    },
    {
      name: 'Demo Evaluator',
      email: 'evaluator.demo@gmail.com',
      initial: 'E',
      color: '#0f9d58', // Google Green
    },
  ];

  const handleSelect = (account) => {
    setLoadingUser(account.name);
    setTimeout(() => {
      onSelectAccount({
        name: account.name,
        email: account.email,
        token: 'mock-google-token',
      });
    }, 600);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleSelect({
      name,
      email: customEmail.trim(),
    });
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ✕
        </button>

        <div className={styles.header}>
          <svg className={styles.googleLogo} viewBox="0 0 74 24" fill="none">
            <path
              d="M9.24 18.08C4.16 18.08 0 14.04 0 8.96C0 3.88 4.16 0 9.24 0C11.96 0 14.12 1.04 15.6 2.48L13.8 4.28C12.64 3.2 11.16 2.48 9.24 2.48C5.64 2.48 2.68 5.4 2.68 8.96C2.68 12.52 5.64 15.6 9.24 15.6C12 15.6 13.56 14.48 14.56 13.48C15.32 12.72 15.8 11.56 16.04 9.96H9.24V7.52H18.56C18.68 8.04 18.76 8.64 18.76 9.32C18.76 11.08 18.28 13.24 16.76 14.76C15.28 16.28 13.08 18.08 9.24 18.08Z"
              fill="#4285F4"
            />
            <path
              d="M24.8 12.24C24.8 15.52 22.28 18.08 19.16 18.08C16.04 18.08 13.52 15.52 13.52 12.24C13.52 8.92 16.04 6.4 19.16 6.4C22.28 6.4 24.8 8.92 24.8 12.24ZM22.28 12.24C22.28 10.12 20.76 8.68 19.16 8.68C17.56 8.68 16.04 10.12 16.04 12.24C16.04 14.32 17.56 15.8 19.16 15.8C20.76 15.8 22.28 14.32 22.28 12.24Z"
              fill="#EA4335"
            />
            <path
              d="M36.8 12.24C36.8 15.52 34.28 18.08 31.16 18.08C28.04 18.08 25.52 15.52 25.52 12.24C25.52 8.92 28.04 6.4 31.16 6.4C34.28 6.4 36.8 8.92 36.8 12.24ZM34.28 12.24C34.28 10.12 32.76 8.68 31.16 8.68C29.56 8.68 28.04 10.12 28.04 12.24C28.04 14.32 29.56 15.8 31.16 15.8C32.76 15.8 34.28 14.32 34.28 12.24Z"
              fill="#FBBC05"
            />
            <path
              d="M48.24 6.72V17.24C48.24 21.56 45.68 23.36 42.64 23.36C39.8 23.36 38.08 21.44 37.44 19.92L39.64 19C40.04 19.96 41.08 21.12 42.64 21.12C44.6 21.12 45.76 19.92 45.76 17.68V16.84H45.64C44.76 17.92 43.24 18.88 41.4 18.88C37.84 18.88 34.72 15.8 34.72 12.28C34.72 8.72 37.84 5.64 41.4 5.64C43.24 5.64 44.76 6.6 45.64 7.64H45.76V6.72H48.24ZM46.04 12.28C46.04 10.2 44.6 8.68 43 8.68C41.4 8.68 40.04 10.2 40.04 12.28C40.04 14.32 41.4 15.84 43 15.84C44.6 15.84 46.04 14.32 46.04 12.28Z"
              fill="#4285F4"
            />
            <path
              d="M52.08 0.72H54.6V17.84H52.08V0.72Z"
              fill="#34A853"
            />
            <path
              d="M62.68 15.8C61.32 15.8 60.36 15.16 59.72 13.96L66.72 11.08L66.48 10.48C66 9.16 64.52 6.4 61.08 6.4C57.68 6.4 54.8 9.08 54.8 12.24C54.8 15.48 57.64 18.08 61.08 18.08C63.84 18.08 65.48 16.36 66.16 15.36L64.12 14C63.44 15.04 62.24 15.8 62.68 15.8ZM59.96 12.08C59.96 9.88 61.4 8.64 62.76 8.64C63.68 8.64 64.48 9.12 64.76 9.8L59.96 12.08Z"
              fill="#EA4335"
            />
          </svg>
          <h2 className={styles.title}>Sign in with Google</h2>
          <p className={styles.subtitle}>to continue to PriceRadar</p>
        </div>

        {loadingUser ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Signing in as {loadingUser}…</p>
          </div>
        ) : (
          <>
            <div className={styles.accountList}>
              {accounts.map((acc) => (
                <button
                  key={acc.email}
                  className={styles.accountItem}
                  onClick={() => handleSelect(acc)}
                  type="button"
                >
                  <div className={styles.avatar} style={{ backgroundColor: acc.color }}>
                    {acc.initial}
                  </div>
                  <div className={styles.accountInfo}>
                    <span className={styles.accountName}>{acc.name}</span>
                    <span className={styles.accountEmail}>{acc.email}</span>
                  </div>
                </button>
              ))}

              <button
                className={styles.accountItem}
                onClick={() => setShowCustom(!showCustom)}
                type="button"
              >
                <div className={styles.avatar} style={{ backgroundColor: '#5f6368' }}>
                  +
                </div>
                <div className={styles.accountInfo}>
                  <span className={styles.accountName}>Use another account</span>
                  <span className={styles.accountEmail}>Enter any fake Gmail</span>
                </div>
              </button>
            </div>

            {showCustom && (
              <form onSubmit={handleCustomSubmit} className={styles.customAccountBox}>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Ayush Mittal)"
                  className={styles.customInput}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Gmail address (e.g. ayush@gmail.com)"
                  className={styles.customInput}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                  autoFocus
                />
                <button type="submit" className={styles.customSubmitBtn}>
                  Continue with this account →
                </button>
              </form>
            )}

            <p className={styles.footerNote}>
              To continue, Google will share your name and email address with PriceRadar.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

